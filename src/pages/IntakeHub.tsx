import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Copy, Link2, Plus, UserPlus, X } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { useApp } from '../store/AppContext'
import { buildIntakeShareUrl } from '../lib/intakeRepo'
import { criteriaFromIntakeRecord } from '../lib/intakeUtils'
import { formatPrice } from '../lib/utils'

export function IntakeHub() {
  const navigate = useNavigate()
  const {
    storageMode,
    intakeTokens,
    clientIntakes,
    pendingIntakeCount,
    createShareLink,
    deactivateShareLink,
    processClientIntake,
    dismissClientIntake,
    updateIntakeNotes,
  } = useApp()

  const [label, setLabel] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})

  const copyLink = useCallback(async (tokenId: string) => {
    const url = buildIntakeShareUrl(tokenId)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(tokenId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      window.prompt('Copiez ce lien :', url)
    }
  }, [])

  if (storageMode !== 'cloud') {
    return (
      <div className="nemea-page">
        <PageHeader eyebrow="Cloud" title="Formulaires client" subtitle="Disponible avec Supabase (mode cloud)." />
      </div>
    )
  }

  const pending = clientIntakes.filter((i) => i.status === 'pending')

  return (
    <div className="content-page space-y-6 nemea-page max-w-3xl">
      <PageHeader
        eyebrow="Acquisition"
        title="Formulaires client"
        subtitle="Générez un lien à envoyer par SMS ou email. La cliente remplit le formulaire ; vous recevez la demande ici."
      />

      {pendingIntakeCount > 0 && (
        <div className="intake-alert nemea-panel" role="status">
          <Bell size={20} className="text-amber-300 shrink-0" aria-hidden />
          <p className="text-sm text-white">
            <strong>{pendingIntakeCount}</strong> nouvelle{pendingIntakeCount > 1 ? 's' : ''} demande{pendingIntakeCount > 1 ? 's' : ''} à traiter
          </p>
        </div>
      )}

      <section className="nemea-panel space-y-4">
        <h2 className="nemea-panel-title text-base">Créer un lien</h2>
        <label className="smart-field">
          <span className="smart-field__label">Libellé (optionnel)</span>
          <input
            className="nemea-input w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. Mme Dupont — appel du 30/09"
          />
        </label>
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2 !rounded-xl"
          onClick={() => void createShareLink(label).then((t) => copyLink(t.id))}
        >
          <Plus size={18} aria-hidden />
          Générer et copier le lien
        </button>
      </section>

      {intakeTokens.length > 0 && (
        <section className="nemea-panel space-y-3">
          <h2 className="nemea-panel-title text-base">Liens actifs</h2>
          <ul className="space-y-2">
            {intakeTokens.filter((t) => t.active).map((t) => (
              <li key={t.id} className="intake-link-row">
                <Link2 size={16} className="text-indigo-300 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{t.label || 'Lien sans libellé'}</p>
                  <p className="text-xs text-nemea-subtle truncate">{buildIntakeShareUrl(t.id)}</p>
                </div>
                <button type="button" className="btn-ghost !text-xs" onClick={() => void copyLink(t.id)}>
                  <Copy size={14} aria-hidden />
                  {copiedId === t.id ? 'Copié' : 'Copier'}
                </button>
                <button type="button" className="btn-ghost !text-xs text-red-300" onClick={() => void deactivateShareLink(t.id)} title="Désactiver">
                  <X size={14} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="nemea-panel space-y-4">
        <h2 className="nemea-panel-title text-base">Demandes reçues</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-nemea-subtle">Aucune demande en attente.</p>
        ) : (
          <ul className="space-y-4">
            {pending.map((intake) => {
              const crit = criteriaFromIntakeRecord(intake.criteria)
              const noteKey = intake.id
              const notes = notesDraft[noteKey] ?? intake.agentNotes ?? ''
              return (
                <li key={intake.id} className="intake-request-card">
                  <div>
                    <p className="font-medium text-white">
                      {intake.firstName} {intake.lastName}
                    </p>
                    <p className="text-xs text-nemea-subtle mt-1">
                      {[intake.phone, intake.email].filter(Boolean).join(' · ') || 'Contact non renseigné'}
                    </p>
                    {crit.cities?.length ? <p className="text-xs text-nemea-muted mt-2">Ville : {crit.cities.join(', ')}</p> : null}
                    {crit.propertyTypes?.length ? <p className="text-xs text-nemea-muted">Types : {crit.propertyTypes.join(', ')}</p> : null}
                    {crit.budgetMax ? <p className="text-xs text-nemea-muted">Budget max : {formatPrice(crit.budgetMax)}</p> : null}
                    {intake.message ? <p className="text-sm text-nemea-subtle mt-2 whitespace-pre-wrap">{intake.message}</p> : null}
                  </div>
                  <label className="smart-field mt-3">
                    <span className="smart-field__label">Notes internes (avant création profil)</span>
                    <textarea
                      className="nemea-input w-full min-h-[4rem]"
                      value={notes}
                      onChange={(e) => setNotesDraft((d) => ({ ...d, [noteKey]: e.target.value }))}
                      onBlur={() => {
                        if (notes !== (intake.agentNotes ?? '')) {
                          void updateIntakeNotes(intake.id, notes)
                        }
                      }}
                      placeholder="Commentaires, rappel d’appel, précisions…"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      className="btn-primary !rounded-xl inline-flex items-center gap-2 text-sm"
                      onClick={() => {
                        void processClientIntake(intake.id, notes).then((profileId) => {
                          navigate(`/profils/${profileId}`)
                        })
                      }}
                    >
                      <UserPlus size={16} aria-hidden />
                      Créer le profil
                    </button>
                    <button type="button" className="btn-ghost text-sm" onClick={() => void dismissClientIntake(intake.id)}>
                      Ignorer
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {clientIntakes.some((i) => i.status !== 'pending') && (
          <p className="text-xs text-nemea-subtle pt-2">
            <Link to="/profils" className="text-indigo-300 underline">Voir les profils</Link> pour les demandes déjà traitées.
          </p>
        )}
      </section>
    </div>
  )
}
