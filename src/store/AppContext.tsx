import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoProfiles, demoProperties, demoSearches } from '../data/demo'
import { matchPropertyToAllSearches, matchPropertyToSearch } from '../lib/matching'
import { formatSupabaseError } from '../lib/supabaseErrors'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './AuthContext'
import {
  fetchAllData,
  seedSupabaseFromDemo,
  syncInsertExchange,
  syncInsertProfile,
  syncInsertProperty,
  syncInsertSearch,
  syncPatchProfile,
  syncPatchProperty,
  syncPatchSearch,
  syncRemoveProfile,
  syncRemoveProperty,
  syncRemoveSearch,
} from '../lib/supabaseRepo'
import {
  createIntakeToken,
  fetchClientIntakes,
  fetchIntakeTokens,
  patchClientIntake,
  setIntakeTokenActive,
} from '../lib/intakeRepo'
import {
  demoCreateIntakeToken,
  demoFetchClientIntakes,
  demoFetchIntakeTokens,
  demoPatchIntake,
  demoSetTokenActive,
} from '../lib/demoIntakeStore'
import { intakeToParsedImport } from '../lib/intakeUtils'
import type {
  ClientIntake,
  Exchange,
  IntakeToken,
  MatchResult,
  ParsedImport,
  Profile,
  Property,
  Search,
  SearchCriteria,
  SearchHistoryEntry,
} from '../types'

interface AppState {
  profiles: Profile[]
  searches: Search[]
  properties: Property[]
}

export type StorageMode = 'demo' | 'cloud'

interface AppContextValue extends AppState {
  ready: boolean
  storageMode: StorageMode
  syncError: string | null
  clearSyncError: () => void
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
  intakeTokens: IntakeToken[]
  clientIntakes: ClientIntake[]
  pendingIntakeCount: number
  intakeLoadError: string | null
  refreshIntakes: () => Promise<void>
  createShareLink: (label?: string) => Promise<IntakeToken>
  deactivateShareLink: (tokenId: string) => Promise<void>
  processClientIntake: (intakeId: string, agentNotes?: string) => Promise<string>
  dismissClientIntake: (intakeId: string) => Promise<void>
  updateIntakeNotes: (intakeId: string, notes: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

function generateId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function newEntityId(cloud: boolean, prefix: string) {
  return cloud ? crypto.randomUUID() : generateId(prefix)
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
  const cloud = isSupabaseConfigured()
  const { session } = useAuth()
  const [ready, setReady] = useState(!cloud)
  const [storageMode] = useState<StorageMode>(cloud ? 'cloud' : 'demo')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>(cloud ? [] : demoProfiles)
  const [searches, setSearches] = useState<Search[]>(cloud ? [] : demoSearches)
  const [properties, setProperties] = useState<Property[]>(cloud ? [] : demoProperties)
  const [intakeTokens, setIntakeTokens] = useState<IntakeToken[]>([])
  const [clientIntakes, setClientIntakes] = useState<ClientIntake[]>([])
  const [intakeLoadError, setIntakeLoadError] = useState<string | null>(null)

  const refreshIntakes = useCallback(async () => {
    if (!cloud) {
      setIntakeTokens(demoFetchIntakeTokens())
      setClientIntakes(demoFetchClientIntakes())
      setIntakeLoadError(null)
      return
    }
    try {
      const [tokens, intakes] = await Promise.all([fetchIntakeTokens(), fetchClientIntakes()])
      setIntakeTokens(tokens)
      setClientIntakes(intakes)
      setIntakeLoadError(null)
    } catch (err) {
      console.error(err)
      setIntakeLoadError(formatSupabaseError(err))
    }
  }, [cloud])

  const runSync = useCallback((task: () => Promise<void>) => {
    void task().catch((err: unknown) => {
      console.error(err)
      setSyncError(formatSupabaseError(err))
    })
  }, [])

  useEffect(() => {
    if (!cloud) return

    if (!session) {
      setProfiles([])
      setSearches([])
      setProperties([])
      setReady(true)
      return
    }

    let cancelled = false
    setReady(false)

    ;(async () => {
      try {
        let data = await fetchAllData()
        if (data.profiles.length === 0 && data.properties.length === 0) {
          await seedSupabaseFromDemo()
          data = await fetchAllData()
        }
        if (cancelled) return
        setProfiles(data.profiles)
        setSearches(data.searches)
        setProperties(data.properties)
        await refreshIntakes()
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setSyncError(formatSupabaseError(err))
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [cloud, session?.user.id, refreshIntakes])

  useEffect(() => {
    if (!cloud && ready) void refreshIntakes()
  }, [cloud, ready, refreshIntakes])

  useEffect(() => {
    if (!cloud || !session) return
    const id = window.setInterval(() => {
      void refreshIntakes()
    }, 45_000)
    const onFocus = () => void refreshIntakes()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [cloud, session, refreshIntakes])

  const addProfile = useCallback((data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const id = newEntityId(cloud, 'p')
    const profile: Profile = { ...data, id, createdAt: now, updatedAt: now }
    setProfiles((prev) => [...prev, profile])
    if (cloud) runSync(() => syncInsertProfile(id, data))
    return profile
  }, [cloud, runSync])

  const updateProfile = useCallback((id: string, data: Partial<Omit<Profile, 'id' | 'createdAt'>>) => {
    let updated: Profile | undefined
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, ...data, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    if (cloud && updated) runSync(() => syncPatchProfile(id, data))
    return updated
  }, [cloud, runSync])

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    setSearches((prev) => prev.filter((s) => s.profileId !== id))
    if (cloud) runSync(() => syncRemoveProfile(id))
  }, [cloud, runSync])

  const addExchange = useCallback((profileId: string, data: Omit<Exchange, 'id'>) => {
    const id = newEntityId(cloud, 'e')
    let created: Exchange | undefined
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== profileId) return p
        created = { ...data, id }
        return { ...p, exchanges: [created, ...p.exchanges], updatedAt: new Date().toISOString() }
      }),
    )
    if (cloud) runSync(() => syncInsertExchange(id, profileId, data))
    return created
  }, [cloud, runSync])

  const addSearch = useCallback((data: Omit<Search, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const now = new Date().toISOString()
    const id = newEntityId(cloud, 's')
    const search: Search = { ...data, id, createdAt: now, updatedAt: now, history: [] }
    setSearches((prev) => [...prev, search])
    if (cloud) runSync(() => syncInsertSearch(id, data))
    return search
  }, [cloud, runSync])

  const updateSearch = useCallback((id: string, data: Partial<Omit<Search, 'id' | 'createdAt'>>, historyNote?: string) => {
    let updated: Search | undefined
    let historyEntry: SearchHistoryEntry | undefined

    setSearches((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const nextCriteria = data.criteria ? { ...s.criteria, ...data.criteria } : s.criteria
        const changes = data.criteria ? diffCriteria(s.criteria, nextCriteria) : {}
        const hasChanges = Object.keys(changes).length > 0
        historyEntry =
          hasChanges || historyNote
            ? { id: newEntityId(cloud, 'h'), date: new Date().toISOString().split('T')[0], changes, note: historyNote }
            : undefined
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

    if (cloud && updated) {
      runSync(() => syncPatchSearch(id, data, historyEntry))
    }
    return updated
  }, [cloud, runSync])

  const deleteSearch = useCallback((id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id))
    if (cloud) runSync(() => syncRemoveSearch(id))
  }, [cloud, runSync])

  const addProperty = useCallback((data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const id = newEntityId(cloud, 'b')
    const property: Property = { ...data, id, createdAt: now, updatedAt: now }
    setProperties((prev) => [...prev, property])
    if (cloud) runSync(() => syncInsertProperty(id, data))
    return property
  }, [cloud, runSync])

  const updateProperty = useCallback((id: string, data: Partial<Omit<Property, 'id' | 'createdAt'>>) => {
    let updated: Property | undefined
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, ...data, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    if (cloud && updated) runSync(() => syncPatchProperty(id, data))
    return updated
  }, [cloud, runSync])

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id))
    if (cloud) runSync(() => syncRemoveProperty(id))
  }, [cloud, runSync])

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
        ? [{ id: newEntityId(cloud, 'e'), date: new Date().toISOString().split('T')[0], type: 'note', content: `Import : ${parsed.rawText.slice(0, 200)}` }]
        : [],
    })

    let search: Search | undefined
    if (parsed.search) {
      const criteria = { ...defaultCriteria(), ...parsed.search }
      const label = [criteria.propertyTypes?.join('/') || 'Recherche', criteria.cities?.join(', ') || ''].filter(Boolean).join(' · ')
      search = addSearch({ profileId: profile.id, label, active: true, criteria })
    }

    return { profile, search }
  }, [addProfile, addSearch, cloud])

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

  const clearSyncError = useCallback(() => setSyncError(null), [])

  const pendingIntakeCount = useMemo(
    () => clientIntakes.filter((i) => i.status === 'pending').length,
    [clientIntakes],
  )

  const createShareLink = useCallback(async (label?: string) => {
    if (!cloud) {
      const token = demoCreateIntakeToken(label)
      await refreshIntakes()
      return token
    }
    const token = await createIntakeToken(label)
    await refreshIntakes()
    return token
  }, [cloud, refreshIntakes])

  const deactivateShareLink = useCallback(async (tokenId: string) => {
    if (!cloud) demoSetTokenActive(tokenId, false)
    else await setIntakeTokenActive(tokenId, false)
    await refreshIntakes()
  }, [cloud, refreshIntakes])

  const updateIntakeNotes = useCallback(async (intakeId: string, notes: string) => {
    if (!cloud) demoPatchIntake(intakeId, { agentNotes: notes })
    else await patchClientIntake(intakeId, { agentNotes: notes })
    await refreshIntakes()
  }, [cloud, refreshIntakes])

  const processClientIntake = useCallback(async (intakeId: string, agentNotes?: string) => {
    const intake = clientIntakes.find((i) => i.id === intakeId)
    if (!intake) throw new Error('Demande introuvable')
    const parsed = intakeToParsedImport(intake)
    if (agentNotes?.trim()) {
      parsed.notes = [parsed.notes, agentNotes.trim()].filter(Boolean).join('\n\n')
    }
    const { profile } = importFromParsed(parsed)
    const patch = {
      status: 'processed' as const,
      processedProfileId: profile.id,
      agentNotes: agentNotes?.trim() || intake.agentNotes,
    }
    if (!cloud) demoPatchIntake(intakeId, patch)
    else await patchClientIntake(intakeId, patch)
    await refreshIntakes()
    return profile.id
  }, [clientIntakes, cloud, importFromParsed, refreshIntakes])

  const dismissClientIntake = useCallback(async (intakeId: string) => {
    if (!cloud) demoPatchIntake(intakeId, { status: 'dismissed' })
    else await patchClientIntake(intakeId, { status: 'dismissed' })
    await refreshIntakes()
  }, [cloud, refreshIntakes])

  const value = useMemo(
    () => ({
      profiles, searches, properties,
      ready, storageMode, syncError, clearSyncError,
      addProfile, updateProfile, deleteProfile, addExchange,
      addSearch, updateSearch, deleteSearch,
      addProperty, updateProperty, deleteProperty,
      importFromParsed,
      getProfile, getSearch, getProperty, getSearchesForProfile,
      getMatchesForProperty, getMatchesForSearch, getAllMatches, getAllHistory,
      intakeTokens, clientIntakes, pendingIntakeCount, intakeLoadError, refreshIntakes,
      createShareLink, deactivateShareLink, processClientIntake, dismissClientIntake, updateIntakeNotes,
    }),
    [
      profiles, searches, properties,
      ready, storageMode, syncError, clearSyncError,
      addProfile, updateProfile, deleteProfile, addExchange,
      addSearch, updateSearch, deleteSearch,
      addProperty, updateProperty, deleteProperty,
      importFromParsed,
      getProfile, getSearch, getProperty, getSearchesForProfile,
      getMatchesForProperty, getMatchesForSearch, getAllMatches, getAllHistory,
      intakeTokens, clientIntakes, pendingIntakeCount, intakeLoadError, refreshIntakes,
      createShareLink, deactivateShareLink, processClientIntake, dismissClientIntake, updateIntakeNotes,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
