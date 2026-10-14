import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { stripAuthTokensFromUrl } from '../lib/authSecurity'
import { establishRecoverySession, redirectRecoveryCallbackToResetPage } from '../lib/recoverySession'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface AuthContextValue {
  /** Connexion cloud : login obligatoire. Mode démo local : pas d’auth. */
  requiresAuth: boolean
  authReady: boolean
  session: Session | null
  userEmail: string | null
  passwordRecovery: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  clearPasswordRecovery: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const requiresAuth = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!requiresAuth)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!supabase) return
    if (redirectRecoveryCallbackToResetPage()) return

    let cancelled = false
    const onResetPage = window.location.pathname === '/reinitialiser-mot-de-passe'

    void (async () => {
      if (onResetPage) {
        await establishRecoverySession()
      }
      if (cancelled) return
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      setSession(data.session)
      if (data.session) stripAuthTokensFromUrl()
      setAuthReady(true)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      setSession(nextSession)
      if (nextSession && event !== 'SIGNED_OUT') {
        stripAuthTokensFromUrl()
      }
      setAuthReady(true)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase non configuré')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut({ scope: 'global' })
    setSession(null)
    setPasswordRecovery(false)
    stripAuthTokensFromUrl()
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase non configuré')
    const redirectTo = `${window.location.origin}/reinitialiser-mot-de-passe`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) throw new Error('Supabase non configuré')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }, [])

  const clearPasswordRecovery = useCallback(() => setPasswordRecovery(false), [])

  const value = useMemo(
    () => ({
      requiresAuth,
      authReady,
      session,
      userEmail: session?.user.email ?? null,
      passwordRecovery,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      clearPasswordRecovery,
    }),
    [
      requiresAuth,
      authReady,
      session,
      passwordRecovery,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      clearPasswordRecovery,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
