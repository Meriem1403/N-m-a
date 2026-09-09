import { LayoutDashboard, Users, Search, Building2, Sparkles, History, FileInput } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil', short: 'Acc.', end: true },
  { to: '/profils', icon: Users, label: 'Profils', short: 'Prof.' },
  { to: '/recherches', icon: Search, label: 'Recherches', short: 'Rech.' },
  { to: '/biens', icon: Building2, label: 'Biens', short: 'Biens' },
  { to: '/correspondances', icon: Sparkles, label: 'Matchs', short: 'Match' },
  { to: '/import', icon: FileInput, label: 'Import', short: 'Imp.' },
  { to: '/historique', icon: History, label: 'Historique', short: 'Hist.' },
]

export function MobileDock() {
  return (
    <nav className="mobile-dock" aria-label="Navigation mobile">
      <div className="mobile-dock-inner scrollbar-hide">
        {items.map(({ to, icon: Icon, label, short, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) => `mobile-dock-link ${isActive ? 'mobile-dock-link--active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden />
            <span className="mobile-dock-label-full">{label}</span>
            <span className="mobile-dock-label-short">{short}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
