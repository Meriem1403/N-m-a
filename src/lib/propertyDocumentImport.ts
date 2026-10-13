import { parsePropertyImportText } from './parser'
import { compressImageFile, isDataUrlWithinLimit } from './imageCompress'
import { parsePdfPropertyDocument } from './pdfPropertyImport'
import type { ParsedPropertyDraft } from '../types'

export function friendlyPropertyImportError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk/i.test(msg)) {
    return 'L’application doit être rechargée (nouvelle version). Actualisez la page (Cmd+Shift+R ou tirez pour rafraîchir), puis réimportez le PDF.'
  }
  if (/pdf\.worker|GlobalWorkerOptions/i.test(msg)) {
    return 'Lecteur PDF indisponible. Rechargez la page ; si le problème persiste, réessayez depuis Chrome/Safari (pas un onglet trop ancien).'
  }
  if (/Invalid PDF|Missing PDF/i.test(msg)) {
    return 'Fichier PDF illisible ou protégé. Exportez la brochure en PDF standard ou collez le texte de l’annonce.'
  }
  if (/ArrayBuffer.*detached|already detached/i.test(msg)) {
    return 'Lecture PDF interrompue. Réessayez une fois ; si besoin, rechargez la page puis réimportez le fichier.'
  }
  return msg || 'Import impossible.'
}

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
    const { text, photos: pdfPhotos } = await parsePdfPropertyDocument(buffer, 3)
    if (!text.trim()) {
      throw new Error('Aucun texte lisible dans ce PDF (scan ou image). Collez le texte de l’annonce ou utilisez un PDF généré (brochure agence).')
    }
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
