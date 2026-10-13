import { useCallback, useId, useRef, useState } from 'react'
import { ChevronDown, FileUp, Loader2 } from 'lucide-react'
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
  const [showTextFallback, setShowTextFallback] = useState(false)
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

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <section
      id="import-brochure"
      className="nemea-panel nemea-panel--glow property-paste-import space-y-4 scroll-mt-24"
      aria-labelledby="property-import-title"
    >
      <div className="property-paste-import__head">
        <span className="property-paste-import__step">Étape 1</span>
        <div>
          <h2 id="property-import-title" className="text-base sm:text-lg font-semibold text-white">
            Importer une brochure PDF
          </h2>
          <p className="text-xs sm:text-sm text-nemea-subtle mt-1 leading-relaxed max-w-xl">
            Modèle agence (Estate 919, TCPDF…) : déposez le fichier ou choisissez-le — prix, surface, ville,
            photos et description se remplissent automatiquement.
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
          <Loader2 size={32} className="property-paste-import__drop-icon animate-spin" aria-hidden />
        ) : (
          <FileUp size={32} className="property-paste-import__drop-icon" aria-hidden />
        )}
        <p className="text-sm sm:text-base text-white font-medium">
          {loading ? 'Analyse du PDF en cours…' : 'Glisser-déposer votre PDF ici'}
        </p>
        <p className="text-xs text-nemea-subtle mt-1 hidden sm:block">
          Sur ordinateur · fichiers .pdf acceptés
        </p>
        <button
          type="button"
          className="btn-primary !rounded-xl text-sm mt-3"
          onClick={openFilePicker}
          disabled={loading}
        >
          Choisir un PDF ou une photo
        </button>
        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="application/pdf,.pdf,text/plain,image/*"
          onChange={(e) => {
            const files = e.target.files
            if (files?.length) void handleFiles(files)
            e.target.value = ''
          }}
        />
      </div>

      <button
        type="button"
        className="property-paste-import__toggle"
        onClick={() => setShowTextFallback((v) => !v)}
        aria-expanded={showTextFallback}
      >
        <ChevronDown
          size={16}
          className={`property-paste-import__chevron${showTextFallback ? ' property-paste-import__chevron--open' : ''}`}
          aria-hidden
        />
        Coller du texte d’annonce à la place
      </button>

      {showTextFallback && (
        <div className="space-y-3 pt-1">
          <SmartTextarea
            label="Texte du bien"
            value={text}
            onChange={setText}
            placeholder="Ex. référence, type, ville, surface, prix, équipements…"
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
        </div>
      )}

      {hint && (
        <p className="text-xs sm:text-sm text-indigo-200/90" role="status">
          {hint}
        </p>
      )}
    </section>
  )
}
