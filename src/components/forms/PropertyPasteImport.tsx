import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { parsePropertyImportText } from '../../lib/parser'
import type { ParsedPropertyDraft } from '../../types'
import { SmartTextarea } from '../ui/SmartTextarea'

const EXAMPLE = `Mandat exclusif — Réf MAR-8-2847. T3 Marseille 8e, 72 m², 3 pièces, 385 000 €. Terrasse, parking, ascenseur. Bon état, DPE C. Disponible visite.`

interface PropertyPasteImportProps {
  onApply: (draft: ParsedPropertyDraft) => void
}

export function PropertyPasteImport({ onApply }: PropertyPasteImportProps) {
  const [text, setText] = useState('')
  const [hint, setHint] = useState<string | null>(null)

  const analyze = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setHint('Collez d’abord le texte de l’annonce ou du mandat.')
      return
    }
    const { property } = parsePropertyImportText(trimmed)
    const found =
      property.reference ||
      property.price ||
      property.type ||
      property.city ||
      property.surface
    if (!found) {
      setHint('Peu d’informations reconnues. Complétez le formulaire à la main.')
      return
    }
    setHint('Formulaire prérempli — vérifiez les champs ci-dessous.')
    onApply(property)
  }

  return (
    <div className="nemea-panel property-paste-import space-y-3">
      <div className="flex items-start gap-2">
        <Sparkles size={18} className="text-indigo-300 shrink-0 mt-0.5" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold text-white">Coller une annonce</h2>
          <p className="text-xs text-nemea-subtle mt-1 leading-relaxed">
            Texte portail, mandat ou note interne : analyse automatique puis complétez si besoin avant enregistrement.
          </p>
        </div>
      </div>
      <SmartTextarea
        label="Texte du bien"
        value={text}
        onChange={setText}
        placeholder="Ex. référence, type, ville, arrondissement, surface, prix, équipements…"
        minRows={4}
        showStats
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary !rounded-xl text-sm" onClick={analyze}>
          Remplir le formulaire
        </button>
        <button type="button" className="btn-ghost !text-indigo-300 text-sm" onClick={() => setText(EXAMPLE)}>
          Exemple
        </button>
      </div>
      {hint && (
        <p className="text-xs text-nemea-muted" role="status">
          {hint}
        </p>
      )}
    </div>
  )
}
