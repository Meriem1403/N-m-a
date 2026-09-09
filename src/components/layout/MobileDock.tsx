import { LayoutDashboard, Users, Search, Building2, Sparkles, MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil', end: true },
  { to: '/profils', icon: Users, label: 'Profils' },
  { to: '/recherches', icon: Search, label: 'Recherches' },
  { to: '/biens', icon: Building2, label: 'Biens' },
  { to: '/correspondances', icon: Sparkles, label: 'Matchs' },
]

interface MobileDockProps {
  onOpenMenu?: () => void
}

export function MobileDock({ onOpenMenu }: MobileDockProps) {
  return (
    <nav className="mobile-dock" aria-label="Navigation mobile">
      <div className="mobile-dock-inner">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) => `mobile-dock-link ${isActive ? 'mobile-dock-link--active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden />
            <span className="mobile-dock-label">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="mobile-dock-link mobile-dock-link--menu"
          aria-label="Plus d'options"
          onClick={onOpenMenu}
        >
          <MoreHorizontal size={20} strokeWidth={1.75} aria-hidden />
          <span className="mobile-dock-label">Plus</span>
        </button>
      </div>
    </nav>
  )
}
