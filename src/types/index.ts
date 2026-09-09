export type CriterionLevel = 'required' | 'wanted' | 'indifferent' | 'refused'

export type PropertyType = 'studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5+' | 'maison' | 'loft' | 'autre'

export type PropertyStatus = 'disponible' | 'option' | 'compromis' | 'vendu' | 'retire'

export type ContactSource =
  | 'telephone'
  | 'email'
  | 'site_web'
  | 'leboncoin'
  | 'seloger'
  | 'bienici'
  | 'recommandation'
  | 'salon'
  | 'autre'

export interface CriterionValue {
  level: CriterionLevel
}

export interface SearchCriteria {
  propertyTypes: PropertyType[]
  cities: string[]
  districts: string[]
  budgetMin?: number
  budgetMax?: number
  surfaceMin?: number
  surfaceMax?: number
  rooms?: number
  bedrooms?: number
  terrace: CriterionValue
  balcony: CriterionValue
  garden: CriterionValue
  parking: CriterionValue
  garage: CriterionValue
  cave: CriterionValue
  elevator: CriterionValue
  floor?: number
  floorMin?: number
  view: CriterionValue
  works: CriterionValue
  otherCriteria?: string
}

export interface SearchHistoryEntry {
  id: string
  date: string
  changes: Partial<SearchCriteria>
  note?: string
}

export interface Search {
  id: string
  profileId: string
  label: string
  criteria: SearchCriteria
  active: boolean
  createdAt: string
  updatedAt: string
  history: SearchHistoryEntry[]
}

export interface Exchange {
  id: string
  date: string
  type: 'appel' | 'email' | 'sms' | 'visite' | 'note'
  content: string
}

export interface Profile {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  firstContactDate: string
  source: ContactSource
  notes?: string
  exchanges: Exchange[]
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  reference: string
  price: number
  city: string
  district?: string
  type: PropertyType
  surface: number
  rooms: number
  bedrooms?: number
  terrace: boolean
  balcony: boolean
  garden: boolean
  parking: boolean
  garage: boolean
  cave: boolean
  elevator: boolean
  floor?: number
  view: boolean
  works: boolean
  photos: string[]
  status: PropertyStatus
  description?: string
  createdAt: string
  updatedAt: string
}

export interface MatchDetail {
  criterion: string
  status: 'match' | 'partial' | 'miss' | 'bonus'
  message: string
}

export interface MatchResult {
  profileId: string
  searchId: string
  profile: Profile
  search: Search
  score: number
  details: MatchDetail[]
}

export interface ParsedImport {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  firstContactDate?: string
  source?: ContactSource
  notes?: string
  search?: Partial<SearchCriteria>
  rawText: string
  confidence: Record<string, number>
}
