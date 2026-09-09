import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { AmbientLayer } from './AmbientLayer'
import { SidebarNav } from './SidebarNav'
import { PageTransition } from './PageTransition'
import { MobileDock } from './MobileDock'

const pageTitles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/profils': 'Profils',
  '/profils/nouveau': 'Nouveau profil',
  '/recherches': 'Recherches',
  '/recherches/nouveau': 'Nouvelle recherche',
  '/biens': 'Biens',
  '/biens/nouveau': 'Nouveau bien',
  '/correspondances': 'Correspondances',
  '/historique': 'Historique',
  '/import': 'Import rapide',
}

export function Layout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  const pageTitle = pageTitles[location.pathname]
    ?? (location.pathname.startsWith('/profils/') ? 'Profil'
      : location.pathname.startsWith('/recherches/') ? 'Recherche'
      : location.pathname.startsWith('/biens/') ? 'Bien' : 'Néméa')

  useEffect(() => { setNavOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [navOpen])

  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>

      <div className="bg-layer">
        <AmbientLayer />
      </div>

      <div className="app-scroll-area foreground-layer">
        <div className="app-shell-padding">
          <div className="section-inner workspace-shell-inner">
            <div className={`workspace-sidebar-aside ${navOpen ? 'workspace-sidebar-aside--open' : ''}`}>
              <button type="button" className="workspace-sidebar-backdrop" aria-label="Fermer le menu" onClick={() => setNavOpen(false)} />
              <div className="workspace-sidebar-slot">
                <SidebarNav onNavigate={() => setNavOpen(false)} />
              </div>
            </div>

            <main id="main-content" className="main-content" tabIndex={-1}>
              <div className="workspace-mobile-bar">
                <button
                  type="button"
                  className="workspace-mobile-menu-btn"
                  onClick={() => setNavOpen(true)}
                  aria-expanded={navOpen}
                  aria-controls="sidebar-nav"
                >
                  <Menu size={20} strokeWidth={1.75} aria-hidden />
                  <span>Menu</span>
                </button>
                <p className="workspace-mobile-zone truncate">{pageTitle}</p>
              </div>

              <PageTransition>
                <div className="content-wrap">
                  <Outlet />
                </div>
              </PageTransition>
            </main>
          </div>
        </div>
      </div>

      <MobileDock />
    </div>
  )
}
