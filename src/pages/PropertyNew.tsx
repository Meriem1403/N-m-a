import { useState } from 'react'
import { ArrowLeft, Home, MapPin, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { PropertyStatus, PropertyType } from '../types'
import { FormHero } from '../components/ui/FormHero'
import { FormSection } from '../components/ui/FormSection'
import { SmartCurrency } from '../components/ui/SmartCurrency'
import { SmartField } from '../components/ui/SmartField'
import { SmartSelect } from '../components/ui/SmartSelect'
import { parseBudgetInput } from '../lib/smart'
import { statusLabels } from '../lib/utils'
import { useApp } from '../store/AppContext'

const typeOptions = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5+', 'maison', 'loft'].map((t) => ({ value: t, label: t }))
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }))

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between w-full rounded-xl border px-4 py-3 text-sm transition-all ${checked ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200 scale-[1.01]' : 'border-white/8 bg-white/3 text-nemea-muted hover:border-white/12'}`}>
      <span>{label}</span>
      <span className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors ${checked ? 'bg-indigo-500' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  )
}

export function PropertyNew() {
  const navigate = useNavigate()
  const { addProperty } = useApp()
  const [reference, setReference] = useState(`MAR-${Date.now().toString().slice(-4)}`)
  const [priceStr, setPriceStr] = useState('')
  const [city, setCity] = useState('Marseille')
  const [district, setDistrict] = useState('')
  const [type, setType] = useState<PropertyType>('T3')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('3')
  const [status, setStatus] = useState<PropertyStatus>('disponible')
  const [description, setDescription] = useState('')
  const [terrace, setTerrace] = useState(false)
  const [balcony, setBalcony] = useState(false)
  const [parking, setParking] = useState(false)
  const [elevator, setElevator] = useState(false)
  const [view, setView] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const property = addProperty({
      reference: reference.trim() || `REF-${Date.now()}`,
      price: parseBudgetInput(priceStr) ?? 0,
      city: city.trim() || 'Marseille',
      district: district || undefined,
      type,
      surface: parseBudgetInput(surface) ?? 0,
      rooms: parseInt(rooms, 10) || 3,
      terrace, balcony, garden: false, parking, garage: false, cave: false, elevator, view, works: false,
      photos: [], status, description: description || undefined,
    })
    navigate(`/biens/${property.id}`)
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--narrow">
      <Link to="/biens" className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Biens</Link>

      <FormHero
        variant="property"
        badge="Nouveau bien"
        title="Ajouter un bien immobilier"
        subtitle="Prix formaté en direct. Surface et équipements alimentent les correspondances."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Home} title="Caractéristiques" description="Référence, prix et typologie" step={1}>
          <SmartField label="Référence" value={reference} onChange={setReference} smartFormat={false} />
          <SmartCurrency label="Prix" value={priceStr} onChange={setPriceStr} required placeholder="450 000" hint="Montant en euros" />
          <div className="responsive-grid-form">
            <SmartSelect label="Type" value={type} onChange={(v) => setType(v as PropertyType)} options={typeOptions} />
            <SmartSelect label="Statut" value={status} onChange={(v) => setStatus(v as PropertyStatus)} options={statusOptions} />
          </div>
          <div className="responsive-grid-form">
            <SmartField label="Surface" value={surface} onChange={setSurface} suffix="m²" inputMode="decimal" placeholder="75" />
            <SmartField label="Pièces" value={rooms} onChange={setRooms} inputMode="numeric" />
          </div>
        </FormSection>

        <FormSection icon={MapPin} title="Localisation" description="Ville et quartier du bien" step={2} className="stagger-2">
          <div className="responsive-grid-form">
            <SmartField label="Ville" value={city} onChange={setCity} smartFormat={false} />
            <SmartField label="Quartier" value={district} onChange={setDistrict} smartFormat={false} placeholder="8e arrondissement" />
          </div>
          <SmartField label="Description" value={description} onChange={setDescription} smartFormat={false} placeholder="Atouts, état, visite…" />
        </FormSection>

        <FormSection icon={Sparkles} title="Équipements" description="Critères pris en compte pour les matchs" step={3} className="stagger-3">
          <div className="responsive-grid-form">
            <Toggle label="Terrasse" checked={terrace} onChange={setTerrace} />
            <Toggle label="Balcon" checked={balcony} onChange={setBalcony} />
            <Toggle label="Parking" checked={parking} onChange={setParking} />
            <Toggle label="Ascenseur" checked={elevator} onChange={setElevator} />
            <Toggle label="Vue" checked={view} onChange={setView} />
          </div>
        </FormSection>

        <button type="submit" className="btn-primary w-full !rounded-xl animate-fade-up stagger-4">Enregistrer le bien</button>
      </form>
    </div>
  )
}
