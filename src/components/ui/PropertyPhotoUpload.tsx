import { useId, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { compressImageFile, isDataUrlWithinLimit } from '../../lib/imageCompress'

interface PropertyPhotoUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
}

export function PropertyPhotoUpload({ photos, onChange }: PropertyPhotoUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return
    const next = [...photos]
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        const url = await compressImageFile(file)
        if (!isDataUrlWithinLimit(url)) {
          alert('Photo trop lourde après compression. Essayez une image plus petite.')
          continue
        }
        next.push(url)
      } catch {
        alert(`Impossible d’ajouter ${file.name}`)
      }
    }
    onChange(next.slice(0, 8))
  }

  return (
    <div className="property-photo-upload">
      <label htmlFor={inputId} className="smart-field__label">Photos du bien</label>
      <p className="text-xs text-nemea-subtle mb-2">Jusqu’à 8 photos — reconnues dans les listes et fiches.</p>

      <div className="property-photo-upload__grid">
        {photos.map((src, i) => (
          <div key={`${i}-${src.slice(0, 32)}`} className="property-photo-upload__thumb">
            <img src={src} alt="" className="property-photo-upload__img" />
            <button
              type="button"
              className="property-photo-upload__remove"
              aria-label="Retirer la photo"
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {photos.length < 8 && (
          <button
            type="button"
            className="property-photo-upload__add"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus size={22} aria-hidden />
            <span>Ajouter</span>
          </button>
        )}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        multiple
        onChange={(e) => {
          void onPick(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
