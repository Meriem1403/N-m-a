import { PACA_CITIES } from '../data/pacaLocations'
import type {
  CriterionLevel,
  ContactSource,
  ParsedImport,
  ParsedPropertyDraft,
  ParsedPropertyImport,
  PropertyStatus,
  PropertyType,
  SearchCriteria,
} from '../types'

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const defaultCriterion = (level: CriterionLevel = 'indifferent') => ({ level })

const defaultSearchCriteria = (): Partial<SearchCriteria> => ({
  propertyTypes: [],
  cities: [],
  districts: [],
  terrace: defaultCriterion(),
  balcony: defaultCriterion(),
  garden: defaultCriterion(),
  parking: defaultCriterion(),
  garage: defaultCriterion(),
  cave: defaultCriterion(),
  elevator: defaultCriterion(),
  view: defaultCriterion(),
  works: defaultCriterion(),
})

const MONTHS: Record<string, number> = {
  janvier: 0, jan: 0,
  fevrier: 1, février: 1, fev: 1, fév: 1,
  mars: 2, mar: 2,
  avril: 3, avr: 3,
  mai: 4,
  juin: 5,
  juillet: 6, juil: 6,
  aout: 7, août: 7,
  septembre: 8, sept: 8,
  octobre: 9, oct: 9,
  novembre: 10, nov: 10,
  decembre: 11, décembre: 11, dec: 11, déc: 11,
}

function parseFrenchDate(text: string): string | undefined {
  const now = new Date()
  const year = now.getFullYear()

  const fullMatch = text.match(/(\d{1,2})\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre|jan|fév|fev|mar|avr|juil|sept|oct|nov|déc|dec)(?:\s+(\d{4}))?/i)
  if (fullMatch) {
    const day = parseInt(fullMatch[1], 10)
    const monthKey = fullMatch[2].toLowerCase()
    const month = MONTHS[monthKey]
    const y = fullMatch[3] ? parseInt(fullMatch[3], 10) : year
    if (month !== undefined) {
      return `${y}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  const slashMatch = text.match(/(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?/)
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10)
    const month = parseInt(slashMatch[2], 10)
    let y = slashMatch[3] ? parseInt(slashMatch[3], 10) : year
    if (y < 100) y += 2000
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return undefined
}

function parseCriterionLevel(text: string, keyword: string): CriterionLevel | undefined {
  const patterns: { level: CriterionLevel; regex: RegExp }[] = [
    { level: 'required', regex: new RegExp(`${keyword}\\s+(obligatoire|indispensable|impératif|must)`, 'i') },
    { level: 'refused', regex: new RegExp(`${keyword}\\s+(refusé|refuse|non|sans)`, 'i') },
    { level: 'wanted', regex: new RegExp(`${keyword}\\s+(souhaité|souhaite|prefer|préféré|ideal|idéal)`, 'i') },
    { level: 'required', regex: new RegExp(`(obligatoire|indispensable).*${keyword}`, 'i') },
    { level: 'wanted', regex: new RegExp(`(souhaité|souhaite).*${keyword}`, 'i') },
  ]

  for (const { level, regex } of patterns) {
    if (regex.test(text)) return level
  }

  if (new RegExp(keyword, 'i').test(text)) return 'wanted'
  return undefined
}

export function parseImportText(rawText: string): ParsedImport {
  const text = rawText.trim()
  const confidence: Record<string, number> = {}
  const result: ParsedImport = { rawText: text, confidence }

  // Email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/i)
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase()
    confidence.email = 0.95
  }

  // Phone
  const phoneMatch = text.match(/(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/)
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/[\s.-]/g, ' ').trim()
    confidence.phone = 0.9
  }

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

  // Segment avant téléphone / email / virgule (souvent "Nom Prénom, ...")
  const head = text.split(/(?:,|\s+(?=(?:\+33|0)\s*[1-9])|[\w.+-]+@)/)[0]?.trim() ?? text

  const civilityTwo = head.match(
    /(?:M\.|Mme\.?|Mlle\.?|Madame|Monsieur)\s+([A-Za-zÀ-ÿ'-]+)\s+([A-Za-zÀ-ÿ'-]+)/i,
  )
  const civilityOne = head.match(/(?:M\.|Mme\.?|Mlle\.?|Madame|Monsieur)\s+([A-Za-zÀ-ÿ'-]+)/i)
  const twoWords = head.match(/\b([A-Za-zÀ-ÿ'-]{2,})\s+([A-Za-zÀ-ÿ'-]{2,})\b/)
  const jeMatch = text.match(/\b(?:je\s+m['’]?appelle|c['’]est)\s+([A-Za-zÀ-ÿ'-]+)(?:\s+([A-Za-zÀ-ÿ'-]+))?/i)

  if (civilityTwo) {
    result.firstName = cap(civilityTwo[1])
    result.lastName = cap(civilityTwo[2])
    confidence.name = 0.9
  } else if (jeMatch?.[2]) {
    result.firstName = cap(jeMatch[1])
    result.lastName = cap(jeMatch[2])
    confidence.name = 0.88
  } else if (twoWords && !/^(je|il|elle|nous|vous|they|cherche|budget|minimum)/i.test(twoWords[1])) {
    result.firstName = cap(twoWords[1])
    result.lastName = cap(twoWords[2])
    confidence.name = 0.82
  } else if (civilityOne) {
    result.lastName = cap(civilityOne[1])
    result.firstName = result.firstName ?? ''
    confidence.name = 0.75
  }

  // Contact date
  const datePatterns = [
    /contact[ée]?\s+(?:le\s+)?(\d{1,2}\s+\w+)/i,
    /(?:le\s+)?(\d{1,2}\s+(?:janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre))/i,
    /(\d{1,2}[/.]\d{1,2}(?:[/.]\d{2,4})?)/,
  ]
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const date = parseFrenchDate(match[1] || match[0])
      if (date) {
        result.firstContactDate = date
        confidence.date = 0.8
        break
      }
    }
  }

  // Source detection
  const sourceMap: { source: ContactSource; keywords: string[] }[] = [
    { source: 'leboncoin', keywords: ['leboncoin', 'lbc'] },
    { source: 'seloger', keywords: ['seloger', 'se loger'] },
    { source: 'bienici', keywords: ['bienici', 'bien ici'] },
    { source: 'site_web', keywords: ['site', 'web', 'internet'] },
    { source: 'recommandation', keywords: ['recommand', 'conseill', 'parrain'] },
    { source: 'salon', keywords: ['salon', 'foire'] },
  ]
  for (const { source, keywords } of sourceMap) {
    if (keywords.some((k) => text.toLowerCase().includes(k))) {
      result.source = source
      confidence.source = 0.7
      break
    }
  }

  const search = defaultSearchCriteria()

  // Property types
  const typeMatches = text.match(/\b(studio|T[1-5](?:\+)?|maison|loft)\b/gi)
  if (typeMatches) {
    search.propertyTypes = [...new Set(typeMatches.map((t) => t.toUpperCase() as PropertyType))]
    confidence.types = 0.9
  }

  const foundCities: string[] = []
  for (const city of PACA_CITIES) {
    if (new RegExp(`\\b${escapeRegex(city)}\\b`, 'i').test(text)) {
      foundCities.push(city)
    }
  }
  if (foundCities.length) {
    search.cities = foundCities
    confidence.location = 0.85
  }

  if (/\bmarseille\b/i.test(text)) {
    const marseilleMatch = text.match(/marseille\s*(\d{1,2}(?:\s*(?:ou|\/|,|-)\s*\d{1,2})*)/i)
    if (marseilleMatch) {
      const districts = marseilleMatch[1].match(/\d{1,2}/g) || []
      search.districts = districts.map((d) => `${d}e arrondissement`)
    } else {
      const arrondissements = [...text.matchAll(/\b(\d{1,2})(?:e|er)\s*(?:arrondissement|arr\.?)?/gi)]
      const nums = [...new Set(arrondissements.map((m) => m[1]))]
      if (nums.length) {
        search.districts = nums.map((d) => `${d}e arrondissement`)
      }
    }
  }

  const surfaceMin = parseSurfaceSqm(text, 'searchMin')
  if (surfaceMin != null) {
    search.surfaceMin = Math.round(surfaceMin)
    confidence.surface = 0.9
  }

  // Budget
  const budgetMaxMatch = text.match(/(?:budget\s+)?(?:max(?:imum|\.?)?|jusqu['']?à|<=?\s*)\s*(\d[\d\s.]*)\s*€/i)
  const budgetMinMatch = text.match(/(?:budget\s+)?(?:min(?:imum|\.?)?|à partir de|>=?\s*)\s*(\d[\d\s.]*)\s*€/i)
  const simpleBudget = text.match(/(\d{3}[\d\s.]*)\s*€/g)

  if (budgetMaxMatch) {
    search.budgetMax = parseInt(budgetMaxMatch[1].replace(/[\s.]/g, ''), 10)
    confidence.budget = 0.9
  } else if (simpleBudget?.length) {
    const amounts = simpleBudget.map((b) => parseInt(b.replace(/[\s.€]/g, ''), 10))
    search.budgetMax = Math.max(...amounts)
    confidence.budget = 0.75
  }
  if (budgetMinMatch) {
    search.budgetMin = parseInt(budgetMinMatch[1].replace(/[\s.]/g, ''), 10)
  }

  // Criteria
  const criteriaMap: { key: keyof Pick<SearchCriteria, 'terrace' | 'balcony' | 'garden' | 'parking' | 'garage' | 'cave' | 'elevator' | 'view'>; keyword: string }[] = [
    { key: 'terrace', keyword: 'terrasse' },
    { key: 'balcony', keyword: 'balcon' },
    { key: 'garden', keyword: 'jardin' },
    { key: 'parking', keyword: 'parking' },
    { key: 'garage', keyword: 'garage' },
    { key: 'cave', keyword: 'cave' },
    { key: 'elevator', keyword: 'ascenseur' },
    { key: 'view', keyword: 'vue' },
  ]

  for (const { key, keyword } of criteriaMap) {
    const level = parseCriterionLevel(text, keyword)
    if (level) {
      search[key] = { level }
      confidence[key] = 0.85
    }
  }

  // Rooms
  const roomsMatch = text.match(/(\d+)\s*pi[èe]ce/i)
  if (roomsMatch) {
    search.rooms = parseInt(roomsMatch[1], 10)
  }

  if (Object.keys(search).some((k) => {
    const val = search[k as keyof SearchCriteria]
    return val !== undefined && (Array.isArray(val) ? val.length > 0 : true)
  })) {
    result.search = search
  }

  return result
}

function parsePacaCity(text: string): string | undefined {
  for (const city of PACA_CITIES) {
    if (new RegExp(`\\b${escapeRegex(city)}\\b`, 'i').test(text)) return city
  }
  return undefined
}

function parseMarseilleDistrict(text: string): string | undefined {
  if (!/\bmarseille\b/i.test(text)) return undefined
  const marseilleMatch = text.match(/marseille\s*(\d{1,2})/i)
  if (marseilleMatch) return `${marseilleMatch[1]}e arrondissement`
  const arr = text.match(/\b(\d{1,2})(?:e|er)\s*(?:arrondissement|arr\.?)?/i)
  if (arr) return `${arr[1]}e arrondissement`
  return undefined
}

function parsePropertyType(text: string): PropertyType | undefined {
  const m = text.match(/\b(studio|T[1-5](?:\+)?|maison|loft)\b/i)
  return m ? (m[1].toUpperCase() as PropertyType) : undefined
}

function parseEuroAmounts(text: string): number[] {
  const matches = text.match(/(\d[\d\s.]{2,})\s*€/g)
  if (!matches) return []
  return matches.map((b) => parseInt(b.replace(/[\s.€]/g, ''), 10)).filter((n) => !Number.isNaN(n))
}

/** Surface en m² — ne pas utiliser \\b après ² (bug JS). */
function parseSurfaceSqm(text: string, mode: 'listing' | 'searchMin'): number | undefined {
  const re = /(\d{1,3}(?:[.,]\d+)?)\s*(?:m²|m2|m\s*²)/gi
  const candidates: number[] = []

  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0
    const before = text.slice(Math.max(0, idx - 28), idx).toLowerCase()
    if (mode === 'searchMin' && /(?:minimum|min\.?|au moins)\s*$/i.test(before)) {
      candidates.push(parseFloat(m[1].replace(',', '.')))
      continue
    }
    if (mode === 'listing' && /(?:minimum|min\.?|au moins)\s*$/i.test(before)) {
      continue
    }
    const val = parseFloat(m[1].replace(',', '.'))
    if (!Number.isNaN(val) && val >= 9 && val <= 2000) candidates.push(val)
  }

  if (!candidates.length) return undefined
  return mode === 'listing' ? candidates[0] : candidates[candidates.length - 1]
}

export function parsePropertyImportText(rawText: string): ParsedPropertyImport {
  const text = rawText.trim()
  const confidence: Record<string, number> = {}
  const property: ParsedPropertyDraft = {}

  const refMatch = text.match(/\b((?:MAR|REF)-[\dA-Z-]+)\b/i)
    ?? text.match(/réf(?:érence)?\.?\s*[:.]?\s*([A-Z0-9-]+)/i)
  if (refMatch) {
    property.reference = refMatch[1].toUpperCase()
    confidence.reference = 0.9
  }

  const type = parsePropertyType(text)
  if (type) {
    property.type = type
    confidence.types = 0.9
  }

  const city = parsePacaCity(text)
  if (city) {
    property.city = city
    confidence.location = 0.85
  }

  const district = parseMarseilleDistrict(text)
  if (district) {
    property.district = district
    confidence.location = 0.85
  }

  const surface = parseSurfaceSqm(text, 'listing')
  if (surface != null) {
    property.surface = Math.round(surface)
    confidence.surface = 0.9
  }

  const roomsMatch = text.match(/(\d+)\s*pi[èe]ce/i)
  if (roomsMatch) {
    property.rooms = parseInt(roomsMatch[1], 10)
    confidence.rooms = 0.85
  }

  const priceMatch = text.match(/(?:prix|vente|honoraires inclus)?\s*[:.]?\s*(\d[\d\s.]*)\s*€/i)
  const amounts = parseEuroAmounts(text)
  if (priceMatch) {
    property.price = parseInt(priceMatch[1].replace(/[\s.]/g, ''), 10)
    confidence.budget = 0.9
  } else if (amounts.length) {
    property.price = amounts[0]
    confidence.budget = 0.8
  }

  if (/\bterrasse\b/i.test(text)) property.terrace = true
  if (/\bbalcon\b/i.test(text)) property.balcony = true
  if (/\bparking\b/i.test(text)) property.parking = true
  if (/\bascenseur\b/i.test(text)) property.elevator = true
  if (/\bvue\b/i.test(text)) property.view = true

  let status: PropertyStatus = 'disponible'
  if (/\bvendu\b/i.test(text)) status = 'vendu'
  else if (/\bcompromis\b/i.test(text)) status = 'compromis'
  else if (/\boption\b/i.test(text)) status = 'option'
  else if (/\bretir/i.test(text)) status = 'retire'
  property.status = status
  confidence.status = 0.7

  const descStart = text.match(/(?:description|atouts|bon état|visite)[:\s]/i)
  if (descStart || text.length > 80) {
    property.description = text.length > 400 ? `${text.slice(0, 397)}…` : text
    confidence.description = 0.5
  }

  return { rawText: text, confidence, property }
}
