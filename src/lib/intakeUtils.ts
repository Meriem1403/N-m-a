import { flattenDistrictLabels } from '../data/pacaLocations'
import type { ClientIntake, ParsedImport, PropertyType, SearchCriteria } from '../types'

const PROPERTY_TYPES: PropertyType[] = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5+', 'maison', 'loft', 'autre']

function defaultCriteria(): SearchCriteria {
  return {
    propertyTypes: [],
    cities: [],
    districts: [],
    terrace: { level: 'indifferent' },
    balcony: { level: 'indifferent' },
    garden: { level: 'indifferent' },
    parking: { level: 'indifferent' },
    garage: { level: 'indifferent' },
    cave: { level: 'indifferent' },
    elevator: { level: 'indifferent' },
    view: { level: 'indifferent' },
    works: { level: 'indifferent' },
  }
}

export function criteriaFromIntakeRecord(raw: Record<string, unknown>): Partial<SearchCriteria> {
  const cities = Array.isArray(raw.cities)
    ? (raw.cities as string[]).filter(Boolean)
    : typeof raw.cities === 'string'
      ? raw.cities.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      : []

  const districts = Array.isArray(raw.districts)
    ? (raw.districts as string[])
    : []

  const propertyTypes = Array.isArray(raw.propertyTypes)
    ? (raw.propertyTypes as string[]).filter((t): t is PropertyType => PROPERTY_TYPES.includes(t as PropertyType))
    : []

  const budgetMax = typeof raw.budgetMax === 'number' ? raw.budgetMax : undefined
  const surfaceMin = typeof raw.surfaceMin === 'number' ? raw.surfaceMin : undefined

  return {
    ...(cities.length ? { cities } : {}),
    ...(districts.length ? { districts: flattenDistrictLabels(districts) } : {}),
    ...(propertyTypes.length ? { propertyTypes } : {}),
    ...(budgetMax ? { budgetMax } : {}),
    ...(surfaceMin ? { surfaceMin } : {}),
    ...(typeof raw.otherCriteria === 'string' && raw.otherCriteria.trim()
      ? { otherCriteria: raw.otherCriteria.trim() }
      : {}),
  }
}

export function intakeToParsedImport(intake: ClientIntake): ParsedImport {
  const searchPartial = criteriaFromIntakeRecord(intake.criteria)
  const hasSearch = Object.keys(searchPartial).length > 0

  return {
    firstName: intake.firstName,
    lastName: intake.lastName,
    phone: intake.phone,
    email: intake.email,
    firstContactDate: intake.createdAt.split('T')[0],
    source: 'site_web',
    notes: [intake.message, intake.agentNotes].filter(Boolean).join('\n\n') || undefined,
    search: hasSearch ? searchPartial : undefined,
    rawText: intake.message ?? '',
    confidence: {},
  }
}

export { defaultCriteria }
