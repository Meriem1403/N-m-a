import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Send } from 'lucide-react'
import { AmbientLayer } from '../components/layout/AmbientLayer'
import { SmartField } from '../components/ui/SmartField'
import { SmartTextarea } from '../components/ui/SmartTextarea'
import { isSupabaseConfigured } from '../lib/supabase'
import { checkIntakeLinkOpen, submitPublicIntake } from '../lib/intakeRepo'
import { parseBudgetInput } from '../lib/smart'
import type { PropertyType } from '../types'

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
  { value: 'T4', label: 'T4' },
  { value: 'T5+', label: 'T5+' },
  { value: 'maison', label: 'Maison' },
  { value: 'autre', label: 'Autre' },
]

export function PublicIntakeForm() {
  const { token } = useParams<{ token: string }>()
  const [linkOk, setLinkOk] = useState<boolean | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [cities, setCities] = useState('')
  const [budgetStr, setBudgetStr] = useState('')
  const [surfaceStr, setSurfaceStr] = useState('')
  const [types, setTypes] = useState<PropertyType[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token || !isSupabaseConfigured()) {
      setLinkOk(false)
      return
    }
    checkIntakeLinkOpen(token)
      .then(setLinkOk)
      .catch(() => setLinkOk(false))
  }, [token])

  const toggleType = (value: PropertyType) => {
    setTypes((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError(null)
    setSubmitting(true)
    try {
      await submitPublicIntake(token, {
        firstName,
        lastName,
        phone: phone || undefined,
        email: email || undefined,
        message: message || undefined,
        criteria: {
          cities: cities.trim(),
          propertyTypes: types,
          budgetMax: budgetStr.trim() ? parseBudgetInput(budgetStr) : undefined,
          surfaceMin: surfaceStr.trim() ? parseInt(surfaceStr.replace(/\s/g, ''), 10) || undefined : undefined,
          otherCriteria: message.trim() || undefined,
        },
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="public-intake-screen">
        <p className="text-sm text-nemea-subtle text-center">Formulaire indisponible (configuration manquante).</p>
      </div>
    )
  }

  if (linkOk === null) {
    return (
      <div className="public-intake-screen">
        <p className="text-sm text-white">Chargement…</p>
      </div>
    )
  }

  if (!linkOk) {
    return (
      <div className="public-intake-screen">
        <div className="public-intake-card nemea-panel">
          <h1 className="text-lg font-semibold text-white">Lien expiré ou invalide</h1>
          <p className="text-sm text-nemea-subtle mt-2">Contactez votre conseiller pour recevoir un nouveau formulaire.</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="public-intake-root">
        <div className="bg-layer"><AmbientLayer /></div>
        <div className="public-intake-screen foreground-layer">
          <div className="public-intake-card nemea-panel nemea-panel--glow text-center">
            <CheckCircle2 className="mx-auto text-emerald-400" size={40} aria-hidden />
            <h1 className="text-lg font-semibold text-white mt-4">Merci !</h1>
            <p className="text-sm text-nemea-subtle mt-2">Votre demande a bien été transmise. Votre conseiller vous recontactera.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-intake-root">
      <div className="bg-layer"><AmbientLayer /></div>
      <div className="public-intake-screen foreground-layer">
        <div className="public-intake-card nemea-panel nemea-panel--glow">
          <p className="workspace-sidebar-mark glow-text text-center">NÉMÉA</p>
          <h1 className="public-intake-title">Votre projet immobilier</h1>
          <p className="public-intake-subtitle">Quelques informations pour que votre conseiller vous propose les biens adaptés.</p>

          <form onSubmit={handleSubmit} className="public-intake-form">
            <div className="responsive-grid-form">
              <SmartField label="Prénom" value={firstName} onChange={setFirstName} required smartFormat={false} />
              <SmartField label="Nom" value={lastName} onChange={setLastName} required smartFormat={false} />
            </div>
            <SmartField label="Téléphone" type="tel" value={phone} onChange={setPhone} />
            <SmartField label="Email" type="email" value={email} onChange={setEmail} />
            <SmartField label="Ville(s) recherchée(s)" value={cities} onChange={setCities} placeholder="Ex. Marseille, Aix-en-Provence" smartFormat={false} />

            <fieldset className="public-intake-types">
              <legend className="smart-field__label">Type de bien</legend>
              <div className="public-intake-types__grid">
                {TYPE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`filter-chip ${types.includes(value) ? 'filter-chip--active' : ''}`}
                    onClick={() => toggleType(value)}
                    aria-pressed={types.includes(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="responsive-grid-form">
              <SmartField label="Budget max (€)" value={budgetStr} onChange={setBudgetStr} inputMode="numeric" smartFormat={false} />
              <SmartField label="Surface min (m²)" value={surfaceStr} onChange={setSurfaceStr} inputMode="numeric" smartFormat={false} />
            </div>

            <SmartTextarea
              label="Détails de votre recherche"
              value={message}
              onChange={setMessage}
              placeholder="Ex. terrasse, quartier, délai, situation familiale…"
              minRows={4}
            />

            {error && <p className="app-login-form__error" role="alert">{error}</p>}

            <button type="submit" className="btn-primary w-full !rounded-xl inline-flex items-center justify-center gap-2 public-intake-submit" disabled={submitting}>
              <Send size={18} aria-hidden />
              {submitting ? 'Envoi…' : 'Envoyer ma demande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
