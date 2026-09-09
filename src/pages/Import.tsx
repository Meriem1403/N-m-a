import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Check, AlertCircle, User, Search } from 'lucide-react'
import { parseImportText } from '../lib/parser'
import { getConfidenceLevel } from '../lib/smart'
import { formatPrice } from '../lib/utils'
import { useApp } from '../store/AppContext'
import type { ParsedImport } from '../types'
import { FormHero } from '../components/ui/FormHero'
import { FormSection } from '../components/ui/FormSection'
import { SmartField } from '../components/ui/SmartField'
import { SmartTextarea } from '../components/ui/SmartTextarea'

const EXAMPLE = `Jean Dupont 06 12 34 56 78, jean@gmail.com, contacté le 12 mai. Il cherche un T3 ou T4 à Marseille 8 ou 9, minimum 70 m², budget maximum 450 000 €, terrasse obligatoire et parking souhaité.`

export function Import() {
  const [text, setText] = useState('')
  const [fields, setFields] = useState({ firstName: '', lastName: '', phone: '', email: '', firstContactDate: '' })
  const navigate = useNavigate()
  const { importFromParsed } = useApp()
  const parsed = useMemo(() => text.trim() ? parseImportText(text) : null, [text])

  useEffect(() => {
    if (parsed) setFields({
      firstName: parsed.firstName ?? '', lastName: parsed.lastName ?? '',
      phone: parsed.phone ?? '', email: parsed.email ?? '', firstContactDate: parsed.firstContactDate ?? '',
    })
  }, [parsed])

  const handleConfirm = () => {
    const payload: ParsedImport = {
      ...(parsed ?? { rawText: text, confidence: {} }),
      firstName: fields.firstName || 'Prénom', lastName: fields.lastName || 'Nom',
      phone: fields.phone || undefined, email: fields.email || undefined,
      firstContactDate: fields.firstContactDate || new Date().toISOString().split('T')[0],
    }
    const { profile } = importFromParsed(payload)
    navigate(`/profils/${profile.id}`)
  }

  return (
    <div className="space-y-5 max-w-2xl nemea-page">
      <FormHero
        variant="import"
        badge="Import rapide"
        title="Coller & détecter"
        subtitle="Collez un email, un SMS ou une note. Néméa en extrait le contact et les critères de recherche."
      />

      <FormSection icon={Sparkles} title="Texte à analyser" description="Collez ou tapez le message brut du prospect">
        <SmartTextarea
          value={text}
          onChange={setText}
          placeholder="Collez votre texte ici… Un email, un SMS, une note de visite…"
          minRows={5}
          showStats
        />
        <button type="button" onClick={() => setText(EXAMPLE)} className="btn-ghost !text-indigo-300 w-full sm:w-auto">
          ✦ Utiliser l'exemple
        </button>
      </FormSection>

      {parsed && (
        <div className="import-detected-panel space-y-5">
          <FormSection icon={User} title="Informations détectées" description="Vérifiez et corrigez si besoin. Les badges indiquent le niveau de confiance.">
            <div className="responsive-grid-form">
              <SmartField label="Prénom" value={fields.firstName} onChange={(v) => setFields((f) => ({ ...f, firstName: v }))} confidence={parsed.confidence.name} />
              <SmartField label="Nom" value={fields.lastName} onChange={(v) => setFields((f) => ({ ...f, lastName: v }))} confidence={parsed.confidence.name} />
            </div>
            <SmartField label="Téléphone" value={fields.phone} onChange={(v) => setFields((f) => ({ ...f, phone: v }))} confidence={parsed.confidence.phone} type="tel" />
            <SmartField label="Email" value={fields.email} onChange={(v) => setFields((f) => ({ ...f, email: v }))} confidence={parsed.confidence.email} type="email" />
            <SmartField label="Date de contact" value={fields.firstContactDate} onChange={(v) => setFields((f) => ({ ...f, firstContactDate: v }))} confidence={parsed.confidence.date} type="date" smartFormat={false} />
          </FormSection>

          {parsed.search && (
            <FormSection icon={Search} title="Recherche détectée" description="Critères extraits du texte">
              <div className="import-chip-grid">
                {parsed.search.propertyTypes?.length ? <Chip label="Types" value={parsed.search.propertyTypes.join(', ')} c={parsed.confidence.types} /> : null}
                {parsed.search.cities?.length ? <Chip label="Localisation" value={[...parsed.search.cities, ...(parsed.search.districts || [])].join(', ')} c={parsed.confidence.location} /> : null}
                {parsed.search.surfaceMin ? <Chip label="Surface min" value={`${parsed.search.surfaceMin} m²`} c={parsed.confidence.surface} /> : null}
                {parsed.search.budgetMax ? <Chip label="Budget max" value={formatPrice(parsed.search.budgetMax)} c={parsed.confidence.budget} /> : null}
              </div>
            </FormSection>
          )}

          <button type="button" onClick={handleConfirm} className="btn-primary w-full !rounded-xl animate-fade-up">
            Enregistrer le profil
          </button>
        </div>
      )}
    </div>
  )
}

function Chip({ label, value, c }: { label: string; value: string; c?: number }) {
  const level = getConfidenceLevel(c)
  return (
    <div className="nemea-card !p-3 transition-transform hover:scale-[1.02]">
      <div className="flex justify-between gap-2">
        <p className="section-label !text-[9px]">{label}</p>
        {level === 'high' && <Check size={10} className="text-emerald-400 smart-icon-pop" />}
        {level === 'medium' && <Sparkles size={10} className="text-indigo-300 smart-icon-pulse" />}
        {level === 'low' && <AlertCircle size={10} className="text-red-400" />}
      </div>
      <p className="text-sm font-medium text-white mt-1">{value}</p>
    </div>
  )
}
