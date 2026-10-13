import { useCallback, useId, useRef, useState } from 'react'
import { FileUp, Loader2, Sparkles } from 'lucide-react'
import { parsePropertyImportText } from '../../lib/parser'
import { importPropertyFromFile, isPropertyImportFile } from '../../lib/propertyDocumentImport'
import type { ParsedPropertyDraft } from '../../types'
import { SmartTextarea } from '../ui/SmartTextarea'

const EXAMPLE = `Mandat exclusif — Réf MAR-8-2847. T3 Marseille 8e, 72 m², 3 pièces, 385 000 €. Terrasse, parking, ascenseur. Bon état, DPE C. Disponible visite.`

interface PropertyPasteImportProps {
  onApply: (draft: ParsedPropertyDraft) => void
}

function hasRecognizedFields(property: ParsedPropertyDraft): boolean {
  return Boolean(
    property.reference ||
      property.price ||
      property.type ||
      property.city ||
      property.surface ||
      (property.photos?.length ?? 0) > 0,
  )
}

export function PropertyPasteImport({ onApply }: PropertyPasteImportProps) {
  const [text, setText] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const applyDraft = useCallback(
    (property: ParsedPropertyDraft, message: string) => {
      if (!hasRecognizedFields(property)) {
        setHint('Peu d’informations reconnues. Complétez le formulaire à la main.')
        return
      }
      setHint(message)
      onApply(property)
    },
    [onApply],
  )

  const analyzeText = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) {
      setHint('Collez du texte ou déposez un PDF brochure / une photo.')
      return
    }
    const { property } = parsePropertyImportText(trimmed)
    applyDraft(property, 'Formulaire prérempli — vérifiez les champs ci-dessous.')
  }, [applyDraft, text])

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(isPropertyImportFile)
      if (!list.length) {
        setHint('Formats acceptés : PDF (brochure agence), texte (.txt) ou image (JPEG, PNG…).')
        return
      }
      setLoading(true)
      setHint(null)
      try {
        const file = list[0]
        const result = await importPropertyFromFile(file)
        if (result.rawText.length > 40) {
          setText(result.rawText.length > 8000 ? `${result.rawText.slice(0, 7997)}…` : result.rawText)
        }
        const photoNote =
          result.photos.length > 0
            ? ` ${result.photos.length} photo(s) récupérée(s) depuis le document.`
            : ''
        applyDraft(
          result.property,
          `Import « ${file.name} » — champs préremplis.${photoNote} Vérifiez avant enregistrement.`,
        )
      } catch (err) {
        setHint(err instanceof Error ? err.message : 'Import impossible.')
      } finally {
        setLoading(false)
      }
    },
    [applyDraft],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (loading) return
    void handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="nemea-panel property-paste-import space-y-3">
      <div className="flex items-start gap-2">
        <Sparkles size={18} className="text-indigo-300 shrink-0 mt-0.5" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold text-white">Import rapide</h2>
          <p className="text-xs text-nemea-subtle mt-1 leading-relaxed">
            Brochure PDF agence (modèle Estate 919 / TCPDF), texte d’annonce ou photo : glissez-déposez ou
            choisissez un fichier — la fiche se remplit automatiquement.
          </p>
        </div>
      </div>

      <div
        className={`property-paste-import__dropzone${dragOver ? ' property-paste-import__dropzone--active' : ''}${loading ? ' property-paste-import__dropzone--busy' : ''}`}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          if (e.currentTarget.contains(e.relatedTarget as Node)) return
          setDragOver(false)
        }}
        onDrop={onDrop}
      >
        {loading ? (
          <Loader2 size={28} className="property-paste-import__drop-icon animate-spin" aria-hidden />
        ) : (
          <FileUp size={28} className="property-paste-import__drop-icon" aria-hidden />
        )}
        <p className="text-sm text-white font-medium">
          {loading ? 'Analyse du document…' : 'Glisser un PDF brochure ou une image ici'}
        </p>
        <p className="text-xs text-nemea-subtle mt-1">ou</p>
        <label htmlFor={fileInputId} className="btn-ghost !text-indigo-300 text-sm mt-2 cursor-pointer">
          Parcourir…
        </label>
        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept=".pdf,text/plain,image/*"
          onChange={(e) => {
            const files = e.target.files
            if (files?.length) void handleFiles(files)
            e.target.value = ''
          }}
        />
      </div>

      <SmartTextarea
        label="Texte extrait ou collé"
        value={text}
        onChange={setText}
        placeholder="Ex. référence, type, ville, surface, prix… (rempli automatiquement après import PDF)"
        minRows={4}
        showStats
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary !rounded-xl text-sm" onClick={analyzeText} disabled={loading}>
          Remplir le formulaire
        </button>
        <button
          type="button"
          className="btn-ghost !text-indigo-300 text-sm"
          onClick={() => setText(EXAMPLE)}
          disabled={loading}
        >
          Exemple texte
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
