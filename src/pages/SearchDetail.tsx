import { useState } from 'react'
import { ArrowLeft, History, Sparkles, User } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PropertyCard } from '../components/cards/PropertyCard'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DetailActions } from '../components/ui/DetailActions'
import { criterionLabels, formatDate, formatPrice } from '../lib/utils'
import { useApp } from '../store/AppContext'

export function SearchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSearch, getProfile, getMatchesForSearch, deleteSearch } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const search = getSearch(id!)
  const profile = search ? getProfile(search.profileId) : undefined
  const matches = search ? getMatchesForSearch(search.id) : []

  if (!search) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40">Recherche introuvable</p>
        <Link to="/recherches" className="text-indigo-300 text-sm mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  const c = search.criteria

  return (
    <div className="space-y-5 nemea-page">
      <Link to="/recherches" className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Recherches</Link>

      <div className="nemea-panel animate-fade-up">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={search.active ? 'success' : 'muted'}>{search.active ? 'Active' : 'Inactive'}</Badge>
              {matches[0] && <Badge variant="accent"><Sparkles size={10} className="mr-1 inline" />Meilleur match {matches[0].match.score}%</Badge>}
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold glow-text break-words">{search.label}</h1>
            {profile && (
              <Link to={`/profils/${profile.id}`} className="mt-2 inline-flex items-center gap-2 text-sm text-white/45 hover:text-indigo-300">
                <User size={14} />{profile.firstName} {profile.lastName}
              </Link>
            )}
          </div>
          <DetailActions
            editPath={`/recherches/${search.id}/modifier`}
            onDelete={() => setConfirmDelete(true)}
          />
        </div>
      </div>

      <div className="nemea-grid-2">
        <section className="nemea-panel animate-fade-up stagger-1">
          <h2 className="nemea-panel-title">Critères</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {c.propertyTypes.map((t) => <Badge key={t} variant="accent">{t}</Badge>)}
              {c.cities.map((city) => <Badge key={city} variant="muted">{city}</Badge>)}
            </div>
            {c.districts.length > 0 && (
              <p className="text-sm text-white/45">{c.districts.map((d) => d.replace(' arrondissement', '')).join(', ')}</p>
            )}
            <div className="responsive-grid-2">
              {c.budgetMax && <Stat label="Budget max" value={formatPrice(c.budgetMax)} />}
              {c.surfaceMin && <Stat label="Surface min" value={`${c.surfaceMin} m²`} />}
              {c.rooms && <Stat label="Pièces min" value={String(c.rooms)} />}
            </div>
            <div className="pt-3 border-t border-white/6 space-y-1.5">
              {(['terrace', 'balcony', 'garden', 'parking', 'garage', 'cave', 'elevator', 'view', 'works'] as const).map((key) => {
                const level = c[key].level
                if (level === 'indifferent') return null
                const labels: Record<string, string> = {
                  terrace: 'Terrasse', balcony: 'Balcon', garden: 'Jardin', parking: 'Parking',
                  garage: 'Garage', cave: 'Cave', elevator: 'Ascenseur', view: 'Vue', works: 'Travaux',
                }
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-white/45">{labels[key]}</span>
                    <span className="text-indigo-200/90">{criterionLabels[level]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="nemea-panel animate-fade-up stagger-2">
          <h2 className="nemea-panel-title flex items-center gap-2"><History size={16} /> Historique</h2>
          {search.history.length === 0 ? (
            <p className="text-sm text-white/35">Aucune modification enregistrée.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
              {search.history.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/6 bg-white/[0.02] p-3">
                  <p className="text-xs text-white/35">{formatDate(entry.date)}</p>
                  {entry.note && <p className="text-sm text-white/70 mt-1">{entry.note}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.changes.budgetMax !== undefined && <Badge variant="accent">Budget: {formatPrice(entry.changes.budgetMax)}</Badge>}
                    {entry.changes.surfaceMin !== undefined && <Badge variant="accent">{entry.changes.surfaceMin} m²</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {matches.length > 0 && (
        <section className="nemea-panel animate-fade-up stagger-3">
          <h2 className="nemea-panel-title">Biens correspondants ({matches.length})</h2>
          <div className="nemea-grid-cards">
            {matches.map(({ property, match }, i) => (
              <PropertyCard key={property.id} property={property} topMatchScore={match.score} delay={i * 40} />
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer cette recherche ?"
        message="Cette action est irréversible. L'historique associé sera perdu."
        onConfirm={() => { deleteSearch(search.id); navigate('/recherches') }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/6 p-3">
      <p className="text-[10px] uppercase tracking-wide text-white/35">{label}</p>
      <p className="text-base font-semibold text-white mt-0.5 tabular-nums">{value}</p>
    </div>
  )
}
