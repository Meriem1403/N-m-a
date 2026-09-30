import { LayoutDashboard, Users, Search, Building2, Sparkles, History, Import, LogOut, ClipboardList } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../store/AuthContext'
import { useApp } from '../../store/AppContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/profils', icon: Users, label: 'Profils' },
  { to: '/recherches', icon: Search, label: 'Recherches' },
  { to: '/biens', icon: Building2, label: 'Biens' },
  { to: '/correspondances', icon: Sparkles, label: 'Correspondances' },
  { to: '/historique', icon: History, label: 'Historique' },
  { to: '/import', icon: Import, label: 'Import rapide' },
  { to: '/formulaires', icon: ClipboardList, label: 'Formulaires client' },
]

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const cloud = isSupabaseConfigured()
  const { userEmail, signOut } = useAuth()
  const { pendingIntakeCount, storageMode } = useApp()

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
              {to === '/formulaires' && storageMode === 'cloud' && pendingIntakeCount > 0 && (
                <span className="sidebar-link__badge" aria-label={`${pendingIntakeCount} en attente`}>
                  {pendingIntakeCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {cloud && userEmail && (
        <div className="sidebar-auth mt-auto">
          <p className="sidebar-auth__email truncate" title={userEmail}>
            {userEmail}
          </p>
          <button
            type="button"
            className="sidebar-auth__logout"
            onClick={() => {
              void signOut()
              onNavigate?.()
            }}
          >
            <LogOut size={16} aria-hidden />
            Déconnexion
          </button>
        </div>
      )}

      <div className={`sidebar-engine ${cloud && userEmail ? '' : 'mt-auto'}`}>
        <p>Moteur actif</p>
        <p>Correspondances calculées en temps réel sur vos biens et recherches.</p>
      </div>
    </aside>
  )
}
