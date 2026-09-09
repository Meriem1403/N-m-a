import { Link } from 'react-router-dom'
import { ArrowUpRight, History as HistoryIcon } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { formatDate, formatPrice } from '../lib/utils'
import { useApp } from '../store/AppContext'

export function History() {
  const { getAllHistory } = useApp()
  const entries = getAllHistory()

  return (
    <div className="space-y-5 nemea-page">
      <PageHeader
        eyebrow="Historique"
        title="Évolution des recherches"
        subtitle="Suivez l'évolution des critères et budgets au fil du temps."
        icon={<HistoryIcon size={22} className="text-violet-300 hidden sm:block" />}
      />

      {entries.length === 0 ? (
        <div className="nemea-panel text-center py-12"><p className="text-sm text-white/40">Aucun historique.</p></div>
      ) : (
        <div className="relative max-w-3xl">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/40 to-transparent hidden sm:block" />
          <div className="space-y-3">
            {entries.map(({ profile, search, entry }, i) => (
              <Link
                key={entry.id}
                to={`/recherches/${search.id}`}
                className="relative block pl-0 sm:pl-10 animate-fade-up group"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full bg-indigo-400 border-2 border-[#141820] shadow-[0_0_8px_rgba(129,140,248,0.5)] hidden sm:block" />
                <div className="nemea-card interactive-card group-hover:border-indigo-400/30">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/35">{formatDate(entry.date)}</p>
                      <h3 className="text-base font-semibold text-white truncate">{profile.firstName} {profile.lastName}</h3>
                      <p className="text-sm text-white/40 truncate">{search.label}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-sky-300/60 group-hover:text-sky-300 flex-shrink-0 transition-colors" />
                  </div>
                  {entry.note && <p className="mt-2 text-sm text-white/40 italic line-clamp-2">{entry.note}</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {entry.changes.budgetMax !== undefined && <span className="nemea-badge nemea-badge--accent">Budget: {formatPrice(entry.changes.budgetMax)}</span>}
                    {entry.changes.surfaceMin !== undefined && <span className="nemea-badge nemea-badge--accent">≥ {entry.changes.surfaceMin} m²</span>}
                    {entry.changes.propertyTypes && <span className="nemea-badge nemea-badge--muted">{entry.changes.propertyTypes.join('/')}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
