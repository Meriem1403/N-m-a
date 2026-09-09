import type { CriterionLevel, ContactSource, ParsedImport, PropertyType, SearchCriteria } from '../types'

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

  // Name - try "Prénom Nom" at start or before phone/email
  const namePatterns = [
    /^([A-ZÀ-Ÿ][a-zà-ÿ]+)\s+([A-ZÀ-Ÿ][a-zà-ÿ-]+)/,
    /(?:M\.|Mme|Monsieur|Madame)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)\s+([A-ZÀ-Ÿ][a-zà-ÿ-]+)/i,
  ]
  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match) {
      result.firstName = match[1]
      result.lastName = match[2]
      confidence.name = 0.85
      break
    }
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

  // Marseille districts
  const marseilleMatch = text.match(/marseille\s*(\d{1,2}(?:\s*(?:ou|\/|,)\s*\d{1,2})*)/i)
  if (marseilleMatch) {
    search.cities = ['Marseille']
    const districts = marseilleMatch[1].match(/\d{1,2}/g) || []
    search.districts = districts.map((d) => `${d}e arrondissement`)
    confidence.location = 0.85
  } else {
    const cityMatch = text.match(/(?:à|a)\s+([A-ZÀ-Ÿ][a-zà-ÿ\s-]+?)(?:\s+\d|$|,|\.|\s+(?:budget|minimum|max|m²|m2))/i)
    if (cityMatch) {
      search.cities = [cityMatch[1].trim()]
      confidence.location = 0.7
    }
  }

  // Surface
  const surfaceMatch = text.match(/(?:minimum|min\.?|au moins|>=?\s*)?\s*(\d+)\s*m[²2]/i)
  if (surfaceMatch) {
    search.surfaceMin = parseInt(surfaceMatch[1], 10)
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
