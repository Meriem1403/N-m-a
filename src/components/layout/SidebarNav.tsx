import { LayoutDashboard, Users, Search, Building2, Sparkles, History, Import } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/profils', icon: Users, label: 'Profils' },
  { to: '/recherches', icon: Search, label: 'Recherches' },
  { to: '/biens', icon: Building2, label: 'Biens' },
  { to: '/correspondances', icon: Sparkles, label: 'Correspondances' },
  { to: '/historique', icon: History, label: 'Historique' },
  { to: '/import', icon: Import, label: 'Import rapide' },
]

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <aside id="sidebar-nav" className="workspace-sidebar" aria-label="Navigation principale">
      <div className="workspace-sidebar-brand">
        <span className="workspace-sidebar-mark glow-text">NÉMÉA</span>
        <span className="workspace-sidebar-zone">Intelligence immobilière</span>
      </div>

      <nav>
        <p className="workspace-nav-label">Navigation</p>
        <div className="flex flex-col gap-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-engine mt-auto">
        <p>Moteur actif</p>
        <p>Correspondances calculées en temps réel sur vos biens et recherches.</p>
      </div>
    </aside>
  )
}
