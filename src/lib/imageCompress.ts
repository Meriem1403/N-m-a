const MAX_BYTES = 900_000

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.readAsDataURL(file)
  })
}

/** Réduit une data URL (JPEG) pour le stockage local / démo. */
export async function compressDataUrl(dataUrl: string, maxWidth = 1280, quality = 0.82): Promise<string> {
  const img = new Image()
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej(new Error('Image invalide'))
    img.src = dataUrl
  })
  const scale = Math.min(1, maxWidth / img.width)
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

export async function compressImageFile(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  if (file.size <= MAX_BYTES && file.type.startsWith('image/')) {
    return dataUrl
  }
  return compressDataUrl(dataUrl)
}

export function isDataUrlWithinLimit(dataUrl: string, maxChars = 1_200_000): boolean {
  return dataUrl.length <= maxChars
}
