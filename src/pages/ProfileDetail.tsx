import { useState } from 'react'
import { ArrowLeft, Phone, Mail, Calendar, MessageSquare, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SearchCard } from '../components/cards/SearchCard'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DetailActions } from '../components/ui/DetailActions'
import { getProfileAvatar } from '../lib/demoImages'
import { Avatar } from '../components/ui/Avatar'
import { ProHeading } from '../components/ui/ProHeading'
import { SectionHeader } from '../components/ui/SectionHeader'
import { formatDate, sourceLabels } from '../lib/utils'
import { useApp } from '../store/AppContext'

export function ProfileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProfile, getSearchesForProfile, getMatchesForSearch, deleteProfile } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const profile = getProfile(id!)
  const searches = profile ? getSearchesForProfile(profile.id) : []

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40">Profil introuvable</p>
        <Link to="/profils" className="text-indigo-300 text-sm mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 nemea-page">
      <Link to="/profils" className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Profils</Link>

      <div className="nemea-panel animate-fade-up">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <Avatar
            src={getProfileAvatar(profile.id, profile.firstName, profile.lastName)}
            firstName={profile.firstName}
            lastName={profile.lastName}
            size="xl"
            className="!rounded-2xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <ProHeading
                  variant="page"
                  eyebrow="Profil client"
                  title={`${profile.firstName} ${profile.lastName}`}
                  className="pro-heading--compact"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge>{sourceLabels[profile.source]}</Badge>
                  <Badge variant="muted"><Calendar size={10} className="mr-1 inline" />{formatDate(profile.firstContactDate)}</Badge>
                  <Badge variant="accent">{searches.length} recherche{searches.length > 1 ? 's' : ''}</Badge>
                </div>
              </div>
              <DetailActions
                editPath={`/profils/${profile.id}/modifier`}
                onDelete={() => setConfirmDelete(true)}
                extra={
                  <Link to={`/recherches/nouveau?profileId=${profile.id}`} className="btn-ghost">
                    <Plus size={14} /> Recherche
                  </Link>
                }
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm">
              {profile.phone && (
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-white/45 hover:text-sky-300">
                  <Phone size={16} />{profile.phone}
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-white/45 hover:text-sky-300 truncate max-w-full">
                  <Mail size={16} />{profile.email}
                </a>
              )}
            </div>
            {profile.notes && <p className="mt-4 text-sm text-white/45 leading-relaxed">{profile.notes}</p>}
          </div>
        </div>
      </div>

      <section>
        <SectionHeader
          title="Recherches"
          subtitle="Critères actifs et correspondances associées"
          href={`/recherches/nouveau?profileId=${profile.id}`}
          linkLabel="+ Ajouter"
        />
        {searches.length > 0 ? (
          <div className="responsive-stack">
            {searches.map((s, i) => {
              const matches = getMatchesForSearch(s.id)
              return <SearchCard key={s.id} search={s} topMatchScore={matches[0]?.match.score} delay={i * 50} />
            })}
          </div>
        ) : (
          <div className="nemea-panel text-center py-8">
            <p className="text-sm text-white/40">Aucune recherche associée.</p>
            <Link to={`/recherches/nouveau?profileId=${profile.id}`} className="btn-ghost mt-3 inline-flex">Créer une recherche</Link>
          </div>
        )}
      </section>

      {profile.exchanges.length > 0 && (
        <section>
          <SectionHeader title={`Échanges (${profile.exchanges.length})`} subtitle="Historique des interactions" />
          <div className="responsive-stack">
            {profile.exchanges.map((ex) => (
              <div key={ex.id} className="nemea-card flex gap-3">
                <MessageSquare size={16} className="text-sky-300 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/35">{formatDate(ex.date)} · {ex.type}</p>
                  <p className="text-sm text-white/80 mt-1 break-words">{ex.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce profil ?"
        message="Le profil et toutes ses recherches seront supprimés définitivement."
        onConfirm={() => { deleteProfile(profile.id); navigate('/profils') }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
