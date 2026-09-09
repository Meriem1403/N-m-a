import { ChevronRight, Phone, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Profile } from '../../types'
import { getProfileAvatar } from '../../lib/demoImages'
import { formatShortDate, sourceLabels } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'

interface ProfileCardProps {
  profile: Profile
  searchCount?: number
  delay?: number
}

export function ProfileCard({ profile, searchCount = 0 }: ProfileCardProps) {
  return (
    <Link
      to={`/profils/${profile.id}`}
      className="nemea-card nemea-card--link nemea-card--shine interactive-card profile-card block w-full min-w-0"
      aria-label={`Profil de ${profile.firstName} ${profile.lastName}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="profile-card__avatar-wrap">
          <Avatar
            src={getProfileAvatar(profile.id, profile.firstName, profile.lastName)}
            firstName={profile.firstName}
            lastName={profile.lastName}
            size="md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-white truncate">{profile.firstName} {profile.lastName}</h3>
            <ChevronRight size={16} className="text-white/40 flex-shrink-0 profile-card__arrow" aria-hidden />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant="muted">{sourceLabels[profile.source]}</Badge>
            {searchCount > 0 && <Badge variant="accent">{searchCount} recherche{searchCount > 1 ? 's' : ''}</Badge>}
          </div>
          <div className="mt-2.5 flex flex-col sm:flex-row gap-2 text-sm text-[var(--color-nemea-muted)]">
            {profile.phone && <span className="flex items-center gap-1.5 min-w-0"><Phone size={14} className="text-indigo-300 flex-shrink-0" aria-hidden />{profile.phone}</span>}
            {profile.email && <span className="flex items-center gap-1.5 truncate min-w-0"><Mail size={14} className="text-indigo-300 flex-shrink-0" aria-hidden />{profile.email}</span>}
          </div>
          <p className="mt-2 text-xs text-[var(--color-nemea-subtle)]">Contact · {formatShortDate(profile.firstContactDate)}</p>
        </div>
      </div>
    </Link>
  )
}
