import { useState } from 'react'
import { ArrowLeft, MapPin, Maximize } from 'lucide-react'
import { PropertyImage } from '../components/ui/PropertyImage'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MatchCard } from '../components/cards/MatchCard'
import { Badge } from '../components/ui/Badge'
import { ProHeading } from '../components/ui/ProHeading'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DetailActions } from '../components/ui/DetailActions'
import { formatPrice, statusColors, statusLabels } from '../lib/utils'
import { useApp } from '../store/AppContext'

const features = [
  { key: 'terrace', label: 'Terrasse' }, { key: 'balcony', label: 'Balcon' },
  { key: 'parking', label: 'Parking' }, { key: 'elevator', label: 'Ascenseur' }, { key: 'view', label: 'Vue' },
  { key: 'garden', label: 'Jardin' }, { key: 'garage', label: 'Garage' }, { key: 'cave', label: 'Cave' },
] as const

export function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProperty, getMatchesForProperty, deleteProperty } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const property = getProperty(id!)
  const matches = property ? getMatchesForProperty(property.id) : []

  if (!property) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40">Bien introuvable</p>
        <Link to="/biens" className="text-indigo-300 text-sm mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 nemea-page">
      <Link to="/biens" className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Biens</Link>

      <div className="nemea-panel overflow-hidden !p-0 animate-fade-up">
        <div className="relative border-b border-white/10">
          <PropertyImage property={property} aspect="hero" />
          <div className="absolute bottom-4 left-4 sm:left-5 right-4">
            <ProHeading
              variant="detail"
              eyebrow={property.reference}
              title={<span className="tabular-nums">{formatPrice(property.price)}</span>}
              animated={false}
            />
          </div>
          <div className="absolute top-4 right-4"><Badge className={statusColors[property.status]}>{statusLabels[property.status]}</Badge></div>
        </div>
        <div className="p-4 sm:p-6">
          <DetailActions editPath={`/biens/${property.id}/modifier`} onDelete={() => setConfirmDelete(true)} />
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Badge variant="accent">{property.type}</Badge>
            <Badge variant="muted"><MapPin size={10} className="mr-1 inline" />{property.city}{property.district && ` · ${property.district}`}</Badge>
            <Badge variant="muted"><Maximize size={10} className="mr-1 inline" />{property.surface} m² · {property.rooms} pièces</Badge>
          </div>
          {property.description && <p className="mt-4 text-sm text-white/45 leading-relaxed">{property.description}</p>}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {features.filter((f) => property[f.key]).map(({ key, label }) => (
              <span key={key} className="nemea-badge nemea-badge--success">✓ {label}</span>
            ))}
          </div>
        </div>
      </div>

      {matches.length > 0 && (
        <section className="nemea-panel">
          <h2 className="nemea-panel-title">Personnes à contacter ({matches.length})</h2>
          <div className="space-y-3">
            {matches.map((m, i) => (
              <MatchCard key={`${m.profileId}-${m.searchId}`} match={m} property={property} rank={i + 1} delay={i * 50} />
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce bien ?"
        message="Ce bien sera retiré de la base et n'apparaîtra plus dans les correspondances."
        onConfirm={() => { deleteProperty(property.id); navigate('/biens') }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
