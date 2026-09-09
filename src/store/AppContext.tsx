import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { demoProfiles, demoProperties, demoSearches } from '../data/demo'
import { matchPropertyToAllSearches, matchPropertyToSearch } from '../lib/matching'
import type { Exchange, MatchResult, ParsedImport, Profile, Property, Search, SearchCriteria, SearchHistoryEntry } from '../types'

interface AppState {
  profiles: Profile[]
  searches: Search[]
  properties: Property[]
}

interface AppContextValue extends AppState {
  addProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Profile
  updateProfile: (id: string, data: Partial<Omit<Profile, 'id' | 'createdAt'>>) => Profile | undefined
  deleteProfile: (id: string) => void
  addExchange: (profileId: string, exchange: Omit<Exchange, 'id'>) => Exchange | undefined
  addSearch: (search: Omit<Search, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Search
  updateSearch: (id: string, data: Partial<Omit<Search, 'id' | 'createdAt'>>, historyNote?: string) => Search | undefined
  deleteSearch: (id: string) => void
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Property
  updateProperty: (id: string, data: Partial<Omit<Property, 'id' | 'createdAt'>>) => Property | undefined
  deleteProperty: (id: string) => void
  importFromParsed: (parsed: ParsedImport) => { profile: Profile; search?: Search }
  getProfile: (id: string) => Profile | undefined
  getSearch: (id: string) => Search | undefined
  getProperty: (id: string) => Property | undefined
  getSearchesForProfile: (profileId: string) => Search[]
  getMatchesForProperty: (propertyId: string) => MatchResult[]
  getMatchesForSearch: (searchId: string) => { property: Property; match: MatchResult }[]
  getAllMatches: () => { property: Property; matches: MatchResult[] }[]
  getAllHistory: () => { profile: Profile; search: Search; entry: SearchHistoryEntry }[]
}

const AppContext = createContext<AppContextValue | null>(null)

function generateId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

const defaultCriteria = (): SearchCriteria => ({
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
})

function diffCriteria(before: SearchCriteria, after: SearchCriteria): Partial<SearchCriteria> {
  const changes: Partial<SearchCriteria> = {}
  if (before.budgetMin !== after.budgetMin) changes.budgetMin = after.budgetMin
  if (before.budgetMax !== after.budgetMax) changes.budgetMax = after.budgetMax
  if (before.surfaceMin !== after.surfaceMin) changes.surfaceMin = after.surfaceMin
  if (before.surfaceMax !== after.surfaceMax) changes.surfaceMax = after.surfaceMax
  if (before.rooms !== after.rooms) changes.rooms = after.rooms
  if (before.bedrooms !== after.bedrooms) changes.bedrooms = after.bedrooms
  if (before.floor !== after.floor) changes.floor = after.floor
  if (before.floorMin !== after.floorMin) changes.floorMin = after.floorMin
  if (before.otherCriteria !== after.otherCriteria) changes.otherCriteria = after.otherCriteria
  if (JSON.stringify(before.propertyTypes) !== JSON.stringify(after.propertyTypes)) changes.propertyTypes = after.propertyTypes
  if (JSON.stringify(before.cities) !== JSON.stringify(after.cities)) changes.cities = after.cities
  if (JSON.stringify(before.districts) !== JSON.stringify(after.districts)) changes.districts = after.districts
  const criterionKeys = ['terrace', 'balcony', 'garden', 'parking', 'garage', 'cave', 'elevator', 'view', 'works'] as const
  for (const key of criterionKeys) {
    if (before[key].level !== after[key].level) changes[key] = after[key]
  }
  return changes
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(demoProfiles)
  const [searches, setSearches] = useState<Search[]>(demoSearches)
  const [properties, setProperties] = useState<Property[]>(demoProperties)

  const addProfile = useCallback((data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const profile: Profile = { ...data, id: generateId('p'), createdAt: now, updatedAt: now }
    setProfiles((prev) => [...prev, profile])
    return profile
  }, [])

  const updateProfile = useCallback((id: string, data: Partial<Omit<Profile, 'id' | 'createdAt'>>) => {
    let updated: Profile | undefined
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, ...data, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    setSearches((prev) => prev.filter((s) => s.profileId !== id))
  }, [])

  const addExchange = useCallback((profileId: string, data: Omit<Exchange, 'id'>) => {
    let created: Exchange | undefined
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== profileId) return p
        created = { ...data, id: generateId('e') }
        return { ...p, exchanges: [created, ...p.exchanges], updatedAt: new Date().toISOString() }
      }),
    )
    return created
  }, [])

  const addSearch = useCallback((data: Omit<Search, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const now = new Date().toISOString()
    const search: Search = { ...data, id: generateId('s'), createdAt: now, updatedAt: now, history: [] }
    setSearches((prev) => [...prev, search])
    return search
  }, [])

  const updateSearch = useCallback((id: string, data: Partial<Omit<Search, 'id' | 'createdAt'>>, historyNote?: string) => {
    let updated: Search | undefined
    setSearches((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const nextCriteria = data.criteria ? { ...s.criteria, ...data.criteria } : s.criteria
        const changes = data.criteria ? diffCriteria(s.criteria, nextCriteria) : {}
        const hasChanges = Object.keys(changes).length > 0
        const historyEntry: SearchHistoryEntry | null =
          hasChanges || historyNote
            ? { id: generateId('h'), date: new Date().toISOString().split('T')[0], changes, note: historyNote }
            : null
        updated = {
          ...s,
          ...data,
          criteria: nextCriteria,
          updatedAt: new Date().toISOString(),
          history: historyEntry ? [historyEntry, ...s.history] : s.history,
        }
        return updated
      }),
    )
    return updated
  }, [])

  const deleteSearch = useCallback((id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addProperty = useCallback((data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const property: Property = { ...data, id: generateId('b'), createdAt: now, updatedAt: now }
    setProperties((prev) => [...prev, property])
    return property
  }, [])

  const updateProperty = useCallback((id: string, data: Partial<Omit<Property, 'id' | 'createdAt'>>) => {
    let updated: Property | undefined
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, ...data, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const importFromParsed = useCallback((parsed: ParsedImport) => {
    const profile = addProfile({
      firstName: parsed.firstName || 'Prénom',
      lastName: parsed.lastName || 'Nom',
      phone: parsed.phone,
      email: parsed.email,
      firstContactDate: parsed.firstContactDate || new Date().toISOString().split('T')[0],
      source: parsed.source || 'autre',
      notes: parsed.notes,
      exchanges: parsed.rawText
        ? [{ id: generateId('e'), date: new Date().toISOString().split('T')[0], type: 'note', content: `Import : ${parsed.rawText.slice(0, 200)}` }]
        : [],
    })

    let search: Search | undefined
    if (parsed.search) {
      const criteria = { ...defaultCriteria(), ...parsed.search }
      const label = [criteria.propertyTypes?.join('/') || 'Recherche', criteria.cities?.join(', ') || ''].filter(Boolean).join(' · ')
      search = addSearch({ profileId: profile.id, label, active: true, criteria })
    }

    return { profile, search }
  }, [addProfile, addSearch])

  const getProfile = useCallback((id: string) => profiles.find((p) => p.id === id), [profiles])
  const getSearch = useCallback((id: string) => searches.find((s) => s.id === id), [searches])
  const getProperty = useCallback((id: string) => properties.find((p) => p.id === id), [properties])

  const getSearchesForProfile = useCallback(
    (profileId: string) => searches.filter((s) => s.profileId === profileId),
    [searches],
  )

  const getMatchesForProperty = useCallback(
    (propertyId: string) => {
      const property = properties.find((p) => p.id === propertyId)
      if (!property) return []
      return matchPropertyToAllSearches(property, searches, profiles)
    },
    [properties, searches, profiles],
  )

  const getMatchesForSearch = useCallback(
    (searchId: string) => {
      const search = searches.find((s) => s.id === searchId)
      const profile = search ? profiles.find((p) => p.id === search.profileId) : undefined
      if (!search || !profile) return []
      return properties
        .filter((p) => p.status === 'disponible')
        .map((property) => ({ property, match: matchPropertyToSearch(property, search, profile) }))
        .filter(({ match }) => match.score >= 40)
        .sort((a, b) => b.match.score - a.match.score)
    },
    [properties, searches, profiles],
  )

  const getAllMatches = useCallback(() => {
    return properties
      .filter((p) => p.status === 'disponible')
      .map((property) => ({ property, matches: matchPropertyToAllSearches(property, searches, profiles) }))
      .filter((item) => item.matches.length > 0)
      .sort((a, b) => (b.matches[0]?.score ?? 0) - (a.matches[0]?.score ?? 0))
  }, [properties, searches, profiles])

  const getAllHistory = useCallback(() => {
    const entries: { profile: Profile; search: Search; entry: SearchHistoryEntry }[] = []
    for (const search of searches) {
      const profile = profiles.find((p) => p.id === search.profileId)
      if (!profile) continue
      for (const entry of search.history) entries.push({ profile, search, entry })
    }
    return entries.sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime())
  }, [searches, profiles])

  const value = useMemo(
    () => ({
      profiles, searches, properties,
      addProfile, updateProfile, deleteProfile, addExchange,
      addSearch, updateSearch, deleteSearch,
      addProperty, updateProperty, deleteProperty,
      importFromParsed,
      getProfile, getSearch, getProperty, getSearchesForProfile,
      getMatchesForProperty, getMatchesForSearch, getAllMatches, getAllHistory,
    }),
    [
      profiles, searches, properties,
      addProfile, updateProfile, deleteProfile, addExchange,
      addSearch, updateSearch, deleteSearch,
      addProperty, updateProperty, deleteProperty,
      importFromParsed,
      getProfile, getSearch, getProperty, getSearchesForProfile,
      getMatchesForProperty, getMatchesForSearch, getAllMatches, getAllHistory,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
