import { demoProfiles, demoProperties, demoSearches } from '../data/demo'
import { supabase } from './supabase'
import {
  exchangeToInsert,
  historyToInsert,
  mapProfile,
  mapProperty,
  mapSearch,
  profileToInsert,
  profileToUpdate,
  propertyToInsert,
  propertyToUpdate,
  searchToInsert,
  searchToUpdate,
  type ExchangeRow,
  type ProfileRow,
  type PropertyRow,
  type SearchHistoryRow,
  type SearchRow,
} from './supabaseMappers'
import type { Exchange, Profile, Property, Search, SearchHistoryEntry } from '../types'

function assertSupabase() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

export async function fetchAllData(): Promise<{ profiles: Profile[]; searches: Search[]; properties: Property[] }> {
  const client = assertSupabase()

  const [profilesRes, exchangesRes, searchesRes, historyRes, propertiesRes] = await Promise.all([
    client.from('profiles').select('*').order('created_at', { ascending: false }),
    client.from('exchanges').select('*').order('date', { ascending: false }),
    client.from('searches').select('*').order('created_at', { ascending: false }),
    client.from('search_history').select('*').order('date', { ascending: false }),
    client.from('properties').select('*').order('created_at', { ascending: false }),
  ])

  const firstError = profilesRes.error ?? exchangesRes.error ?? searchesRes.error ?? historyRes.error ?? propertiesRes.error
  if (firstError) throw firstError

  const profileRows = (profilesRes.data ?? []) as ProfileRow[]
  const exchangeRows = (exchangesRes.data ?? []) as ExchangeRow[]
  const searchRows = (searchesRes.data ?? []) as SearchRow[]
  const historyRows = (historyRes.data ?? []) as SearchHistoryRow[]
  const propertyRows = (propertiesRes.data ?? []) as PropertyRow[]

  const exchangesByProfile = new Map<string, ExchangeRow[]>()
  for (const row of exchangeRows) {
    const list = exchangesByProfile.get(row.profile_id) ?? []
    list.push(row)
    exchangesByProfile.set(row.profile_id, list)
  }

  const historyBySearch = new Map<string, SearchHistoryRow[]>()
  for (const row of historyRows) {
    const list = historyBySearch.get(row.search_id) ?? []
    list.push(row)
    historyBySearch.set(row.search_id, list)
  }

  return {
    profiles: profileRows.map((row) => mapProfile(row, exchangesByProfile.get(row.id) ?? [])),
    searches: searchRows.map((row) => mapSearch(row, historyBySearch.get(row.id) ?? [])),
    properties: propertyRows.map(mapProperty),
  }
}

export async function seedSupabaseFromDemo(): Promise<void> {
  const client = assertSupabase()
  const profileIdMap = new Map<string, string>()

  for (const profile of demoProfiles) {
    const { data, error } = await client
      .from('profiles')
      .insert(profileToInsert(profile))
      .select('id')
      .single()
    if (error) throw error
    profileIdMap.set(profile.id, data.id as string)

    if (profile.exchanges.length > 0) {
      const { error: exError } = await client.from('exchanges').insert(
        profile.exchanges.map((ex) => exchangeToInsert(data.id as string, ex)),
      )
      if (exError) throw exError
    }
  }

  for (const search of demoSearches) {
    const profileId = profileIdMap.get(search.profileId)
    if (!profileId) continue

    const { data, error } = await client
      .from('searches')
      .insert(searchToInsert({ ...search, profileId }))
      .select('id')
      .single()
    if (error) throw error

    if (search.history.length > 0) {
      const { error: histError } = await client.from('search_history').insert(
        search.history.map((entry) => historyToInsert(data.id as string, entry)),
      )
      if (histError) throw histError
    }
  }

  const { error: propError } = await client.from('properties').insert(
    demoProperties.map((property) => propertyToInsert(property)),
  )
  if (propError) throw propError
}

export async function syncInsertProfile(id: string, data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('profiles').insert({ id, ...profileToInsert(data) })
  if (error) throw error

  if (data.exchanges.length > 0) {
    const rows = data.exchanges.map((ex) => ({ id: ex.id, ...exchangeToInsert(id, ex) }))
    const { error: exError } = await client.from('exchanges').insert(rows)
    if (exError) throw exError
  }
}

export async function syncPatchProfile(id: string, data: Partial<Omit<Profile, 'id' | 'createdAt' | 'exchanges'>>): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('profiles').update(profileToUpdate(data)).eq('id', id)
  if (error) throw error
}

export async function syncRemoveProfile(id: string): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('profiles').delete().eq('id', id)
  if (error) throw error
}

export async function syncInsertExchange(id: string, profileId: string, data: Omit<Exchange, 'id'>): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('exchanges').insert({ id, ...exchangeToInsert(profileId, data) })
  if (error) throw error
}

export async function syncInsertSearch(id: string, data: Omit<Search, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('searches').insert({ id, ...searchToInsert(data) })
  if (error) throw error
}

export async function syncPatchSearch(
  id: string,
  data: Partial<Omit<Search, 'id' | 'createdAt' | 'history'>>,
  historyEntry?: SearchHistoryEntry,
): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('searches').update(searchToUpdate(data)).eq('id', id)
  if (error) throw error

  if (historyEntry) {
    const { error: histError } = await client
      .from('search_history')
      .insert({ id: historyEntry.id, ...historyToInsert(id, historyEntry) })
    if (histError) throw histError
  }
}

export async function syncRemoveSearch(id: string): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('searches').delete().eq('id', id)
  if (error) throw error
}

export async function syncInsertProperty(id: string, data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('properties').insert({ id, ...propertyToInsert(data) })
  if (error) throw error
}

export async function syncPatchProperty(id: string, data: Partial<Omit<Property, 'id' | 'createdAt'>>): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('properties').update(propertyToUpdate(data)).eq('id', id)
  if (error) throw error
}

export async function syncRemoveProperty(id: string): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('properties').delete().eq('id', id)
  if (error) throw error
}
