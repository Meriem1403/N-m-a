import { parsePropertyImportText } from './parser'
import { compressImageFile, isDataUrlWithinLimit } from './imageCompress'
import type { ParsedPropertyDraft } from '../types'

export interface PropertyDocumentImportResult {
  sourceName: string
  rawText: string
  property: ParsedPropertyDraft
  photos: string[]
}

const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

export function isPropertyImportFile(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true
  const lower = file.name.toLowerCase()
  return lower.endsWith('.pdf') || lower.endsWith('.txt')
}

async function readPlainText(file: File): Promise<string> {
  return file.text()
}

export async function importPropertyFromFile(file: File): Promise<PropertyDocumentImportResult> {
  const sourceName = file.name
  let rawText = ''
  let photos: string[] = []

  const lower = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf')
  const isText = file.type === 'text/plain' || lower.endsWith('.txt')
  const isImage = file.type.startsWith('image/')

  if (isPdf) {
    const buffer = await file.arrayBuffer()
    const { extractPhotosFromPdf, extractTextFromPdf } = await import('./pdfPropertyImport')
    const [text, pdfPhotos] = await Promise.all([
      extractTextFromPdf(buffer),
      extractPhotosFromPdf(buffer, 3),
    ])
    rawText = text
    photos = pdfPhotos.filter(isDataUrlWithinLimit)
  } else if (isText) {
    rawText = await readPlainText(file)
  } else if (isImage) {
    const url = await compressImageFile(file)
    if (isDataUrlWithinLimit(url)) photos = [url]
    rawText = file.name
  } else {
    throw new Error('Format non pris en charge. Utilisez un PDF brochure, un fichier texte ou une photo.')
  }

  const { property } = parsePropertyImportText(rawText, { fileName: sourceName })
  const draft: ParsedPropertyDraft = { ...property }
  if (photos.length) draft.photos = photos

  return { sourceName, rawText, property: draft, photos }
}
