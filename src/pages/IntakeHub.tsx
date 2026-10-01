import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Bell, Copy, Link2, Plus, UserPlus, X } from 'lucide-react'
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
    intakeLoadError,
    createShareLink,
    deactivateShareLink,
    processClientIntake,
    dismissClientIntake,
    updateIntakeNotes,
    refreshIntakes,
  } = useApp()

  const [label, setLabel] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

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

  const pending = clientIntakes.filter((i) => i.status === 'pending')

  return (
    <div className="content-page space-y-6 nemea-page nemea-page--wide">
      <PageHeader
        eyebrow="Acquisition"
        title="Formulaires client"
        subtitle="Générez un lien à envoyer par SMS ou email. La cliente remplit le formulaire ; vous recevez la demande ici."
      />

      {storageMode === 'demo' && (
        <div className="nemea-panel intake-setup-hint" role="status">
          <p className="text-sm text-white font-medium">Mode démo (sans Supabase)</p>
          <p className="text-xs text-nemea-subtle mt-2 leading-relaxed">
            Les liens et demandes sont enregistrés dans <strong className="text-white/90">ce navigateur</strong> uniquement.
            Pour la prod (Netlify), connectez-vous avec Supabase et exécutez <code className="text-indigo-200">supabase/intake_forms.sql</code>.
          </p>
        </div>
      )}

      {intakeLoadError && (
        <div className="nemea-panel intake-setup-hint intake-setup-hint--error" role="alert">
          <AlertTriangle className="text-amber-300 shrink-0" size={20} aria-hidden />
          <div>
            <p className="text-sm text-white font-medium">Formulaires cloud indisponibles</p>
            <p className="text-xs text-nemea-subtle mt-1">{intakeLoadError}</p>
            <p className="text-xs text-nemea-muted mt-2">
              Supabase → SQL Editor → exécuter le fichier <strong>supabase/intake_forms.sql</strong>, puis rechargez la page.
            </p>
            <button type="button" className="btn-ghost !text-xs mt-2" onClick={() => void refreshIntakes()}>
              Réessayer
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <p className="app-login-form__error" role="alert">{actionError}</p>
      )}

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
        <p className="text-xs text-nemea-subtle">
          Cliquez ci-dessous : le lien est copié automatiquement (ex.{' '}
          <span className="text-nemea-muted">{typeof window !== 'undefined' ? window.location.origin : ''}/f/…</span>).
        </p>
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
          disabled={Boolean(intakeLoadError && storageMode === 'cloud')}
          onClick={() => {
            setActionError(null)
            void createShareLink(label)
              .then((t) => copyLink(t.id))
              .catch((err) => setActionError(err instanceof Error ? err.message : 'Impossible de créer le lien'))
          }}
        >
          <Plus size={18} aria-hidden />
          Générer et copier le lien
        </button>
      </section>

      <section className="nemea-panel space-y-3">
        <h2 className="nemea-panel-title text-base">Liens actifs</h2>
        {intakeTokens.filter((t) => t.active).length === 0 ? (
          <p className="text-sm text-nemea-subtle">Aucun lien pour l’instant — utilisez le bouton ci-dessus.</p>
        ) : (
          <ul className="space-y-2">
            {intakeTokens.filter((t) => t.active).map((t) => (
              <li key={t.id} className="intake-link-row">
                <Link2 size={16} className="text-indigo-300 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{t.label || 'Lien sans libellé'}</p>
                  <p className="text-xs text-nemea-subtle truncate break-all">{buildIntakeShareUrl(t.id)}</p>
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
        )}
      </section>

      <section className="nemea-panel space-y-4">
        <h2 className="nemea-panel-title text-base">Demandes reçues</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-nemea-subtle">Aucune demande en attente. Envoyez un lien à un client pour tester.</p>
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
