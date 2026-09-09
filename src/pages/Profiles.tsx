import { useMemo, useState } from 'react'
import { ProfileCard } from '../components/cards/ProfileCard'
import { PageHeader } from '../components/ui/PageHeader'
import { SmartSearch } from '../components/ui/SmartSearch'
import { useApp } from '../store/AppContext'

export function Profiles() {
  const { profiles, searches } = useApp()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return profiles
    return profiles.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q),
    )
  }, [profiles, query])

  return (
    <div className="content-page space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Profils"
        title={`${profiles.length} prospect${profiles.length > 1 ? 's' : ''}`}
      />

      <SmartSearch
        value={query}
        onChange={setQuery}
        placeholder="Nom, email, téléphone…"
        resultCount={query ? filtered.length : undefined}
      />

      <div className="responsive-stack">
        {filtered.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            searchCount={searches.filter((s) => s.profileId === profile.id).length}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm text-white/40">Aucun profil trouvé</p>
        )}
      </div>
    </div>
  )
}
