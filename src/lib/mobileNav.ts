/** Retour contextuel pour la barre mobile (sous-pages). */
export function getMobileBackNav(pathname: string): { to: string; label: string } | null {
  if (pathname === '/biens/nouveau') return { to: '/biens', label: 'Biens' }
  if (/^\/biens\/[^/]+\/modifier$/.test(pathname)) {
    return { to: pathname.replace(/\/modifier$/, ''), label: 'Fiche' }
  }
  if (/^\/biens\/[^/]+$/.test(pathname)) return { to: '/biens', label: 'Biens' }

  if (pathname === '/profils/nouveau') return { to: '/profils', label: 'Profils' }
  if (/^\/profils\/[^/]+\/modifier$/.test(pathname)) {
    return { to: pathname.replace(/\/modifier$/, ''), label: 'Fiche' }
  }
  if (/^\/profils\/[^/]+$/.test(pathname)) return { to: '/profils', label: 'Profils' }

  if (pathname === '/recherches/nouveau') return { to: '/recherches', label: 'Recherches' }
  if (/^\/recherches\/[^/]+\/modifier$/.test(pathname)) {
    return { to: pathname.replace(/\/modifier$/, ''), label: 'Fiche' }
  }
  if (/^\/recherches\/[^/]+$/.test(pathname)) return { to: '/recherches', label: 'Recherches' }

  return null
}
