import type { Exchange, Profile, Property, Search, SearchCriteria, SearchHistoryEntry } from '../types'

export interface ProfileRow {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  first_contact_date: string
  source: Profile['source']
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ExchangeRow {
  id: string
  profile_id: string
  date: string
  type: Exchange['type']
  content: string
  created_at: string
}

export interface SearchRow {
  id: string
  profile_id: string
  label: string
  active: boolean
  criteria: SearchCriteria
  created_at: string
  updated_at: string
}

export interface SearchHistoryRow {
  id: string
  search_id: string
  date: string
  changes: Partial<SearchCriteria>
  note: string | null
  created_at: string
}

export interface PropertyRow {
  id: string
  reference: string
  price: number
  city: string
  district: string | null
  type: Property['type']
  surface: number
  rooms: number
  bedrooms: number | null
  terrace: boolean
  balcony: boolean
  garden: boolean
  parking: boolean
  garage: boolean
  cave: boolean
  elevator: boolean
  floor: number | null
  view: boolean
  works: boolean
  photos: string[]
  status: Property['status']
  description: string | null
  created_at: string
  updated_at: string
}

export function mapProfile(row: ProfileRow, exchanges: ExchangeRow[]): Profile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    firstContactDate: row.first_contact_date,
    source: row.source,
    notes: row.notes ?? undefined,
    exchanges: exchanges.map(mapExchange),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapExchange(row: ExchangeRow): Exchange {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    content: row.content,
  }
}

export function mapSearch(row: SearchRow, history: SearchHistoryRow[]): Search {
  return {
    id: row.id,
    profileId: row.profile_id,
    label: row.label,
    active: row.active,
    criteria: row.criteria,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    history: history.map(mapHistoryEntry),
  }
}

function mapHistoryEntry(row: SearchHistoryRow): SearchHistoryEntry {
  return {
    id: row.id,
    date: row.date,
    changes: row.changes ?? {},
    note: row.note ?? undefined,
  }
}

export function mapProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    reference: row.reference,
    price: row.price,
    city: row.city,
    district: row.district ?? undefined,
    type: row.type,
    surface: Number(row.surface),
    rooms: row.rooms,
    bedrooms: row.bedrooms ?? undefined,
    terrace: row.terrace,
    balcony: row.balcony,
    garden: row.garden,
    parking: row.parking,
    garage: row.garage,
    cave: row.cave,
    elevator: row.elevator,
    floor: row.floor ?? undefined,
    view: row.view,
    works: row.works,
    photos: row.photos ?? [],
    status: row.status,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function profileToInsert(data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'exchanges'>) {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone ?? null,
    email: data.email ?? null,
    first_contact_date: data.firstContactDate,
    source: data.source,
    notes: data.notes ?? null,
  }
}

export function profileToUpdate(data: Partial<Omit<Profile, 'id' | 'createdAt' | 'exchanges'>>) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.firstName !== undefined) row.first_name = data.firstName
  if (data.lastName !== undefined) row.last_name = data.lastName
  if (data.phone !== undefined) row.phone = data.phone ?? null
  if (data.email !== undefined) row.email = data.email ?? null
  if (data.firstContactDate !== undefined) row.first_contact_date = data.firstContactDate
  if (data.source !== undefined) row.source = data.source
  if (data.notes !== undefined) row.notes = data.notes ?? null
  return row
}

export function exchangeToInsert(profileId: string, data: Omit<Exchange, 'id'>) {
  return {
    profile_id: profileId,
    date: data.date,
    type: data.type,
    content: data.content,
  }
}

export function searchToInsert(data: Omit<Search, 'id' | 'createdAt' | 'updatedAt' | 'history'>) {
  return {
    profile_id: data.profileId,
    label: data.label,
    active: data.active,
    criteria: data.criteria,
  }
}

export function searchToUpdate(data: Partial<Omit<Search, 'id' | 'createdAt' | 'history'>>) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.profileId !== undefined) row.profile_id = data.profileId
  if (data.label !== undefined) row.label = data.label
  if (data.active !== undefined) row.active = data.active
  if (data.criteria !== undefined) row.criteria = data.criteria
  return row
}

export function historyToInsert(searchId: string, entry: Omit<SearchHistoryEntry, 'id'>) {
  return {
    search_id: searchId,
    date: entry.date,
    changes: entry.changes,
    note: entry.note ?? null,
  }
}

export function propertyToInsert(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    reference: data.reference,
    price: data.price,
    city: data.city,
    district: data.district ?? null,
    type: data.type,
    surface: data.surface,
    rooms: data.rooms,
    bedrooms: data.bedrooms ?? null,
    terrace: data.terrace,
    balcony: data.balcony,
    garden: data.garden,
    parking: data.parking,
    garage: data.garage,
    cave: data.cave,
    elevator: data.elevator,
    floor: data.floor ?? null,
    view: data.view,
    works: data.works,
    photos: data.photos,
    status: data.status,
    description: data.description ?? null,
  }
}

export function propertyToUpdate(data: Partial<Omit<Property, 'id' | 'createdAt'>>) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.reference !== undefined) row.reference = data.reference
  if (data.price !== undefined) row.price = data.price
  if (data.city !== undefined) row.city = data.city
  if (data.district !== undefined) row.district = data.district ?? null
  if (data.type !== undefined) row.type = data.type
  if (data.surface !== undefined) row.surface = data.surface
  if (data.rooms !== undefined) row.rooms = data.rooms
  if (data.bedrooms !== undefined) row.bedrooms = data.bedrooms ?? null
  if (data.terrace !== undefined) row.terrace = data.terrace
  if (data.balcony !== undefined) row.balcony = data.balcony
  if (data.garden !== undefined) row.garden = data.garden
  if (data.parking !== undefined) row.parking = data.parking
  if (data.garage !== undefined) row.garage = data.garage
  if (data.cave !== undefined) row.cave = data.cave
  if (data.elevator !== undefined) row.elevator = data.elevator
  if (data.floor !== undefined) row.floor = data.floor ?? null
  if (data.view !== undefined) row.view = data.view
  if (data.works !== undefined) row.works = data.works
  if (data.photos !== undefined) row.photos = data.photos
  if (data.status !== undefined) row.status = data.status
  if (data.description !== undefined) row.description = data.description ?? null
  return row
}
