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

type PdfImageObject = {
  width?: number
  height?: number
  kind?: number
  data?: Uint8Array | Uint8ClampedArray
  bitmap?: ImageBitmap
}

async function getPdfImageObject(page: PDFPageProxy, name: string): Promise<PdfImageObject | null> {
  try {
    return (await page.objs.get(name)) as PdfImageObject
  } catch {
    try {
      return (await page.commonObjs.get(name)) as PdfImageObject
    } catch {
      return null
    }
  }
}

async function bitmapToDataUrl(bitmap: ImageBitmap): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponible')
  ctx.drawImage(bitmap, 0, 0)
  if (typeof bitmap.close === 'function') bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.88)
}

function rawPixelsToDataUrl(
  data: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  kind: number,
): string | null {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const imageData = ctx.createImageData(width, height)
  const rgba = imageData.data
  const px = width * height

  if (kind === 1 && data.length >= px) {
    for (let i = 0; i < px; i++) {
      const g = data[i]
      rgba[i * 4] = g
      rgba[i * 4 + 1] = g
      rgba[i * 4 + 2] = g
      rgba[i * 4 + 3] = 255
    }
  } else if (data.length === px * 4) {
    rgba.set(data)
  } else if (data.length === px * 3) {
    for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
      rgba[j] = data[i]
      rgba[j + 1] = data[i + 1]
      rgba[j + 2] = data[i + 2]
      rgba[j + 3] = 255
    }
  } else {
    return null
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.88)
}

async function pdfImageObjectToDataUrl(raw: PdfImageObject | null): Promise<string | null> {
  if (!raw?.width || !raw.height) return null

  if (raw.bitmap instanceof ImageBitmap) {
    return bitmapToDataUrl(raw.bitmap)
  }

  if (raw.data?.length) {
    if (raw.data[0] === 0xff && raw.data[1] === 0xd8) {
      const blob = new Blob([raw.data.slice()], { type: 'image/jpeg' })
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('JPEG brochure'))
        reader.readAsDataURL(blob)
      })
    }
    const copy = new Uint8ClampedArray(raw.data)
    return rawPixelsToDataUrl(copy, raw.width, raw.height, raw.kind ?? 2)
  }

  return null
}

function isBannerImage(width: number, height: number): boolean {
  if (width < 200 || height < 200) return true
  return width / height > 2.8
}

async function extractEmbeddedPhotosFromPage(page: PDFPageProxy): Promise<string[]> {
  const ops = await page.getOperatorList()
  const urls: { area: number; url: string }[] = []

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i]
    if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) continue
    const name = ops.argsArray[i]?.[0]
    if (typeof name !== 'string') continue
    try {
      const img = await getPdfImageObject(page, name)
      if (!img?.width || !img?.height || isBannerImage(img.width, img.height)) continue
      const raw = await pdfImageObjectToDataUrl(img)
      if (!raw) continue
      const compressed = await compressDataUrl(raw, 1280, 0.84)
      urls.push({ area: img.width * img.height, url: compressed })
    } catch {
      /* ignore single image */
    }
  }

  urls.sort((a, b) => b.area - a.area)
  return urls.map((u) => u.url)
}

async function renderPageToCanvas(page: PDFPageProxy, scale: number): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponible')
  const task = page.render({
    canvasContext: ctx,
    viewport,
  })
  await task.promise
  return canvas
}

/** Photo principale : zone haute de la page 1 (brochures TCPDF / agence). */
async function renderBrochureHeroPhoto(page: PDFPageProxy): Promise<string> {
  const canvas = await renderPageToCanvas(page, 2)
  const cropH = Math.min(canvas.height, Math.max(Math.floor(canvas.height * 0.55), 280))
  const crop = document.createElement('canvas')
  crop.width = canvas.width
  crop.height = cropH
  const ctx = crop.getContext('2d')
  if (!ctx) return compressDataUrl(canvas.toDataURL('image/jpeg', 0.85), 1280, 0.82)
  ctx.drawImage(canvas, 0, 0, canvas.width, cropH, 0, 0, canvas.width, cropH)
  return compressDataUrl(crop.toDataURL('image/jpeg', 0.85), 1280, 0.82)
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

    if (maxPhotos > 0 && collected.length < maxPhotos) {
      const embedded = await extractEmbeddedPhotosFromPage(page)
      for (const url of embedded) {
        if (collected.length >= maxPhotos) break
        if (!collected.includes(url)) collected.push(url)
      }
    }

    if (maxPhotos > 0 && pageNum === 1 && collected.length === 0) {
      try {
        collected.push(await renderBrochureHeroPhoto(page))
      } catch {
        /* fallback below */
      }
    }
  }

  if (collected.length === 0 && doc.numPages > 0 && maxPhotos > 0) {
    const page = await doc.getPage(1)
    const canvas = await renderPageToCanvas(page, 1.5)
    collected.push(await compressDataUrl(canvas.toDataURL('image/jpeg', 0.85), 1280, 0.82))
  }

  const text = parts.join('\n\n').replace(/\s+/g, ' ').trim()
  return { text, photos: collected.slice(0, maxPhotos) }
}

export async function extractTextFromPdf(data: ArrayBuffer): Promise<string> {
  const { text } = await parsePdfPropertyDocument(data, 0)
  return text
}

export async function extractPhotosFromPdf(data: ArrayBuffer, maxPhotos = 3): Promise<string[]> {
  const { photos } = await parsePdfPropertyDocument(data, maxPhotos)
  return photos
}
