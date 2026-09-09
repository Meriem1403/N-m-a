import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { SmartCurrency } from '../components/ui/SmartCurrency'
import { SmartField } from '../components/ui/SmartField'
import { SmartSelect } from '../components/ui/SmartSelect'
import { formatBudgetDisplay, parseBudgetInput } from '../lib/smart'
import { statusLabels } from '../lib/utils'
import type { PropertyStatus, PropertyType } from '../types'
import { useApp } from '../store/AppContext'

const typeOptions = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5+', 'maison', 'loft'].map((t) => ({ value: t, label: t }))
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }))

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between w-full rounded-xl border px-4 py-3 text-sm transition-all ${checked ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200' : 'border-white/8 bg-white/3 text-white/45'}`}>
      <span>{label}</span>
      <span className={`w-10 h-5 rounded-full relative flex-shrink-0 ${checked ? 'bg-indigo-500' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  )
}

export function PropertyEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProperty, updateProperty } = useApp()
  const property = getProperty(id!)

  const [reference, setReference] = useState(property?.reference ?? '')
  const [priceStr, setPriceStr] = useState(property ? formatBudgetDisplay(property.price) : '')
  const [city, setCity] = useState(property?.city ?? '')
  const [district, setDistrict] = useState(property?.district ?? '')
  const [type, setType] = useState<PropertyType>(property?.type ?? 'T3')
  const [surface, setSurface] = useState(property?.surface.toString() ?? '')
  const [rooms, setRooms] = useState(property?.rooms.toString() ?? '')
  const [status, setStatus] = useState<PropertyStatus>(property?.status ?? 'disponible')
  const [description, setDescription] = useState(property?.description ?? '')
  const [terrace, setTerrace] = useState(property?.terrace ?? false)
  const [balcony, setBalcony] = useState(property?.balcony ?? false)
  const [parking, setParking] = useState(property?.parking ?? false)
  const [elevator, setElevator] = useState(property?.elevator ?? false)
  const [view, setView] = useState(property?.view ?? false)

  if (!property) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40">Bien introuvable</p>
        <Link to="/biens" className="text-indigo-300 text-sm mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProperty(property.id, {
      reference: reference.trim() || property.reference,
      price: parseBudgetInput(priceStr) ?? property.price,
      city: city.trim() || property.city,
      district: district || undefined,
      type, surface: parseBudgetInput(surface) ?? property.surface,
      rooms: parseInt(rooms, 10) || property.rooms,
      status, description: description || undefined,
      terrace, balcony, parking, elevator, view,
    })
    navigate(`/biens/${property.id}`)
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--narrow">
      <Link to={`/biens/${property.id}`} className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Retour</Link>
      <PageHeader eyebrow="Modifier" title={property.reference} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="nemea-panel space-y-3 animate-fade-up">
          <SmartField label="Référence" value={reference} onChange={setReference} smartFormat={false} />
          <SmartCurrency label="Prix" value={priceStr} onChange={setPriceStr} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmartSelect label="Type" value={type} onChange={(v) => setType(v as PropertyType)} options={typeOptions} />
            <SmartSelect label="Statut" value={status} onChange={(v) => setStatus(v as PropertyStatus)} options={statusOptions} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmartField label="Ville" value={city} onChange={setCity} smartFormat={false} />
            <SmartField label="Quartier" value={district} onChange={setDistrict} smartFormat={false} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmartField label="Surface (m²)" value={surface} onChange={setSurface} smartFormat={false} suffix="m²" />
            <SmartField label="Pièces" value={rooms} onChange={setRooms} smartFormat={false} inputMode="numeric" />
          </div>
          <SmartField label="Description" value={description} onChange={setDescription} smartFormat={false} />
        </section>

        <section className="nemea-panel space-y-2.5 animate-fade-up stagger-2">
          <h2 className="nemea-panel-title !mb-0">Équipements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Toggle label="Terrasse" checked={terrace} onChange={setTerrace} />
            <Toggle label="Balcon" checked={balcony} onChange={setBalcony} />
            <Toggle label="Parking" checked={parking} onChange={setParking} />
            <Toggle label="Ascenseur" checked={elevator} onChange={setElevator} />
            <Toggle label="Vue" checked={view} onChange={setView} />
          </div>
        </section>

        <button type="submit" className="btn-primary w-full !rounded-xl">Enregistrer</button>
      </form>
    </div>
  )
}
