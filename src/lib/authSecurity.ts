/** Supprime tokens OAuth / recovery de l’URL une fois la session établie côté client. */
export function stripAuthTokensFromUrl(): void {
  if (typeof window === 'undefined') return

  const { pathname, search, hash } = window.location
  const hashBody = hash.startsWith('#') ? hash.slice(1) : hash
  const hashParams = new URLSearchParams(hashBody)
  const searchParams = new URLSearchParams(search)

  const sensitive = [
    'access_token',
    'refresh_token',
    'provider_token',
    'provider_refresh_token',
    'expires_in',
    'token_type',
    'code',
    'token_hash',
    'type',
  ]

  const hasHashTokens = sensitive.some((key) => hashParams.has(key))
  const hasSearchCode = searchParams.has('code') || searchParams.has('token_hash')

  if (!hasHashTokens && !hasSearchCode) return

  for (const key of sensitive) searchParams.delete(key)
  for (const key of ['type']) hashParams.delete(key)
  const nextSearch = searchParams.toString()
  const nextPath = pathname + (nextSearch ? `?${nextSearch}` : '')
  window.history.replaceState(null, '', nextPath)
}

/** True si l’URL ressemble à un lien Supabase (recovery, magic link, PKCE). */
export function urlLooksLikeAuthCallback(): boolean {
  if (typeof window === 'undefined') return false
  const { search, hash } = window.location
  const hashBody = hash.startsWith('#') ? hash.slice(1) : hash
  if (/type=recovery|type=magiclink|access_token=/i.test(hashBody)) return true
  const searchParams = new URLSearchParams(search)
  if (searchParams.has('code') || searchParams.has('token_hash')) return true
  return false
}
