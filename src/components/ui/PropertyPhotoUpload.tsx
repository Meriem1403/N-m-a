import { useId, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'

const MAX_BYTES = 900_000

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.readAsDataURL(file)
  })
}

async function compressImage(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  if (file.size <= MAX_BYTES && file.type.startsWith('image/')) {
    return dataUrl
  }
  const img = new Image()
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej(new Error('Image invalide'))
    img.src = dataUrl
  })
  const maxW = 1280
  const scale = Math.min(1, maxW / img.width)
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.82)
}

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
        const url = await compressImage(file)
        if (url.length > 1_200_000) {
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
