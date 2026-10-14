import type { Session } from '@supabase/supabase-js'
import { stripAuthTokensFromUrl } from './authSecurity'
import { supabase } from './supabase'

export type RecoverySessionResult =
  | { ok: true; session: Session }
  | { ok: false; error: string }

function parseUrlAuthParams() {
  const url = new URL(window.location.href)
  const search = url.searchParams
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
  return { search, hash }
}

/** Établit une session à partir du lien e-mail Supabase (recovery). */
export async function establishRecoverySession(): Promise<RecoverySessionResult | null> {
  if (!supabase) {
    return { ok: false, error: 'Supabase non configuré.' }
  }

  const { data: existing } = await supabase.auth.getSession()
  if (existing.session) {
    return { ok: true, session: existing.session }
  }

  const { search, hash } = parseUrlAuthParams()

  const tokenHash = search.get('token_hash')
  const type = search.get('type') ?? hash.get('type')
  if (tokenHash && type === 'recovery') {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })
    if (error) return { ok: false, error: error.message }
    if (data.session) {
      stripAuthTokensFromUrl()
      return { ok: true, session: data.session }
    }
  }

  const code = search.get('code')
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return {
        ok: false,
        error:
          `${error.message} — Ouvrez le lien dans le même navigateur où vous avez demandé le mail, ou redemandez un e-mail.`,
      }
    }
    if (data.session) {
      stripAuthTokensFromUrl()
      return { ok: true, session: data.session }
    }
  }

  const accessToken = hash.get('access_token')
  const refreshToken = hash.get('refresh_token')
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (error) return { ok: false, error: error.message }
    if (data.session) {
      stripAuthTokensFromUrl()
      return { ok: true, session: data.session }
    }
  }

  return null
}

/** Redirige vers la page dédiée si Supabase renvoie sur / avec les jetons recovery. */
export function redirectRecoveryCallbackToResetPage(): boolean {
  if (typeof window === 'undefined') return false
  const { pathname, search, hash } = window.location
  if (pathname === '/reinitialiser-mot-de-passe') return false

  const blob = `${search}${hash}`
  const isRecovery =
    /type=recovery/i.test(blob)
    || (hash.includes('access_token=') && /type=recovery/i.test(blob))
    || (search.includes('code=') && /type=recovery/i.test(blob))

  if (!isRecovery) return false

  window.location.replace(`/reinitialiser-mot-de-passe${search}${hash}`)
  return true
}
