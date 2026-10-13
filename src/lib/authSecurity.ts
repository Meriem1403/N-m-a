/** Supprime tokens OAuth / recovery de l’URL (ne jamais partager un lien contenant ces paramètres). */
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
  ]

  let dirty = /type=recovery|type=magiclink/i.test(hashBody)
  for (const key of sensitive) {
    if (hashParams.has(key) || searchParams.has(key)) dirty = true
  }

  if (!dirty) return

  for (const key of sensitive) searchParams.delete(key)
  const nextSearch = searchParams.toString()
  const nextUrl = pathname + (nextSearch ? `?${nextSearch}` : '')
  window.history.replaceState(null, '', nextUrl)
}
