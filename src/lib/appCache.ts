const BUILD_STORAGE_KEY = 'nemea-build-id'

/** Vide service worker + caches (PWA) puis recharge la page. */
export async function hardRefreshApp(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
  window.location.reload()
}

/**
 * Après un déploiement, évite qu’une ancienne PWA charge d’anciens chunks JS (import PDF cassé).
 * @returns true si un reload a été déclenché — ne pas monter React dans ce cas.
 */
export async function ensureFreshAppShell(): Promise<boolean> {
  const buildId = typeof __NEMEA_BUILD_ID__ !== 'undefined' ? __NEMEA_BUILD_ID__ : 'dev'
  const previous = localStorage.getItem(BUILD_STORAGE_KEY)

  if (previous === buildId) return false

  localStorage.setItem(BUILD_STORAGE_KEY, buildId)

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }

  const reloadKey = `nemea-reloaded-${buildId}`
  if (!sessionStorage.getItem(reloadKey)) {
    sessionStorage.setItem(reloadKey, '1')
    window.location.reload()
    return true
  }

  return false
}
