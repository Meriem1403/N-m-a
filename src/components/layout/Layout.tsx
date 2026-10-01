import { useEffect, useState } from 'react'
import { ChevronLeft, Menu } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { getMobileBackNav } from '../../lib/mobileNav'
import { AmbientLayer } from './AmbientLayer'
import { SidebarNav } from './SidebarNav'
import { PageTransition } from './PageTransition'
import { MobileDock } from './MobileDock'
import { ErrorBoundary } from '../ui/ErrorBoundary'

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
  '/formulaires': 'Formulaires client',
}

export function Layout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  const pageTitle = pageTitles[location.pathname]
    ?? (location.pathname.endsWith('/modifier') ? 'Modification'
      : location.pathname.startsWith('/profils/') ? 'Profil'
      : location.pathname.startsWith('/recherches/') ? 'Recherche'
      : location.pathname.startsWith('/biens/') ? 'Bien' : 'Néméa')

  const mobileBack = getMobileBackNav(location.pathname)

  useEffect(() => {
    setNavOpen(false)
    document.querySelector('.app-scroll-area')?.scrollTo(0, 0)
  }, [location.pathname])

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
                <div className="workspace-mobile-bar__start">
                  {mobileBack ? (
                    <Link to={mobileBack.to} className="workspace-mobile-back" aria-label={`Retour : ${mobileBack.label}`}>
                      <ChevronLeft size={20} strokeWidth={2} aria-hidden />
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="workspace-mobile-menu-btn"
                    onClick={() => setNavOpen(true)}
                    aria-expanded={navOpen}
                    aria-controls="sidebar-nav"
                  >
                    <Menu size={18} strokeWidth={2} aria-hidden />
                    {!mobileBack && <span>Menu</span>}
                  </button>
                </div>
                <h1 className="workspace-mobile-title truncate">{pageTitle}</h1>
                <div className="workspace-mobile-bar__end" aria-hidden />
              </div>

              <PageTransition>
                <div className="content-wrap">
                  <ErrorBoundary label="Impossible d'afficher les correspondances.">
                    <Outlet />
                  </ErrorBoundary>
                </div>
              </PageTransition>
            </main>
          </div>
        </div>
      </div>

      <MobileDock onOpenMenu={() => setNavOpen(true)} />
    </div>
  )
}
