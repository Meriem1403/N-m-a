import { GlobalWorkerOptions, OPS, getDocument, type PDFDocumentProxy, type PDFPageProxy } from 'pdfjs-dist'
import { compressDataUrl } from './imageCompress'

let workerReady = false

function ensurePdfWorker(): void {
  if (workerReady) return
  GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href
  workerReady = true
}

function clonePdfBytes(data: ArrayBuffer | Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? data.slice() : new Uint8Array(data).slice()
}

async function loadPdf(data: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  ensurePdfWorker()
  return getDocument({ data: clonePdfBytes(data), useSystemFonts: true }).promise
}

/** Une seule ouverture du PDF (évite ArrayBuffer detached si texte + photos en parallèle). */
export async function parsePdfPropertyDocument(
  data: ArrayBuffer,
  maxPhotos = 3,
): Promise<{ text: string; photos: string[] }> {
  const doc = await loadPdf(data)
  const parts: string[] = []
  const collected: string[] = []

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    parts.push(pageText)

    if (collected.length < maxPhotos) {
      const embedded = await extractEmbeddedPhotosFromPage(page)
      for (const url of embedded) {
        if (collected.length >= maxPhotos) break
        if (!collected.includes(url)) collected.push(url)
      }
    }
  }

  if (collected.length === 0 && doc.numPages > 0) {
    const page = await doc.getPage(1)
    collected.push(await renderPagePreview(page))
  }

  const text = parts.join('\n\n').replace(/\s+/g, ' ').trim()
  return { text, photos: collected.slice(0, maxPhotos) }
}

export async function extractTextFromPdf(data: ArrayBuffer): Promise<string> {
  const { text } = await parsePdfPropertyDocument(data, 0)
  return text
}

type PdfImageBitmap = {
  width: number
  height: number
  data: Uint8ClampedArray | Uint8Array
}

function pdfImageToDataUrl(img: PdfImageBitmap): string | null {
  if (!img?.width || !img?.height || !img.data?.length) return null
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const imageData = ctx.createImageData(img.width, img.height)
  const expected = img.width * img.height * 4
  if (img.data.length === expected) {
    imageData.data.set(img.data)
  } else if (img.data.length === img.width * img.height * 3) {
    for (let i = 0, j = 0; i < img.data.length; i += 3, j += 4) {
      imageData.data[j] = img.data[i]
      imageData.data[j + 1] = img.data[i + 1]
      imageData.data[j + 2] = img.data[i + 2]
      imageData.data[j + 3] = 255
    }
  } else {
    return null
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.88)
}

async function extractEmbeddedPhotosFromPage(page: PDFPageProxy): Promise<string[]> {
  const ops = await page.getOperatorList()
  const urls: { area: number; url: string }[] = []

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] !== OPS.paintImageXObject) continue
    const name = ops.argsArray[i]?.[0]
    if (typeof name !== 'string') continue
    try {
      const img = (await page.objs.get(name)) as PdfImageBitmap | null
      if (!img?.width || !img?.height) continue
      const ratio = img.width / img.height
      if (ratio > 2.8 || img.width < 240 || img.height < 240) continue
      const raw = pdfImageToDataUrl(img)
      if (!raw) continue
      const compressed = await compressDataUrl(raw)
      urls.push({ area: img.width * img.height, url: compressed })
    } catch {
      /* objet image parfois indisponible */
    }
  }

  urls.sort((a, b) => b.area - a.area)
  return urls.map((u) => u.url)
}

async function renderPagePreview(page: PDFPageProxy, scale = 1.35): Promise<string> {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponible')
  await page.render({ canvasContext: ctx, viewport }).promise
  return compressDataUrl(canvas.toDataURL('image/jpeg', 0.85))
}

export async function extractPhotosFromPdf(data: ArrayBuffer, maxPhotos = 3): Promise<string[]> {
  const { photos } = await parsePdfPropertyDocument(data, maxPhotos)
  return photos
}
