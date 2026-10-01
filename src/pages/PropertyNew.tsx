import { useState } from 'react'
import { Home, MapPin, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageBackLink } from '../components/ui/PageBackLink'
import type { PropertyStatus, PropertyType } from '../types'
import { FormHero } from '../components/ui/FormHero'
import { FormSection } from '../components/ui/FormSection'
import { SmartCurrency } from '../components/ui/SmartCurrency'
import { SmartField } from '../components/ui/SmartField'
import { SmartSelect } from '../components/ui/SmartSelect'
import { formatBudgetDisplay, parseBudgetInput } from '../lib/smart'
import type { ParsedPropertyDraft } from '../types'
import { PropertyPasteImport } from '../components/forms/PropertyPasteImport'
import { statusLabels } from '../lib/utils'
import { PropertyPhotoUpload } from '../components/ui/PropertyPhotoUpload'
import { EquipmentToggle } from '../components/ui/EquipmentToggle'
import { PropertyLocationPicker } from '../components/forms/PropertyLocationPicker'
import { useApp } from '../store/AppContext'

const typeOptions = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5+', 'maison', 'loft'].map((t) => ({ value: t, label: t }))
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }))

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
  const [photos, setPhotos] = useState<string[]>([])

  const applyFromPaste = (draft: ParsedPropertyDraft) => {
    if (draft.reference) setReference(draft.reference)
    if (draft.price != null) setPriceStr(formatBudgetDisplay(draft.price))
    if (draft.city) setCity(draft.city)
    if (draft.district) setDistrict(draft.district)
    if (draft.type) setType(draft.type)
    if (draft.surface != null) setSurface(String(draft.surface))
    if (draft.rooms != null) setRooms(String(draft.rooms))
    if (draft.status) setStatus(draft.status)
    if (draft.description) setDescription(draft.description)
    if (draft.terrace) setTerrace(true)
    if (draft.balcony) setBalcony(true)
    if (draft.parking) setParking(true)
    if (draft.elevator) setElevator(true)
    if (draft.view) setView(true)
  }

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
      photos, status, description: description || undefined,
    })
    navigate(`/biens/${property.id}`)
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--wide">
      <PageBackLink to="/biens" label="Biens" />

      <FormHero
        variant="property"
        badge="Nouveau bien"
        title="Ajouter un bien immobilier"
        subtitle="Collez une annonce pour préremplir, ou saisissez à la main. Les correspondances utilisent surface et équipements."
      />

      <PropertyPasteImport onApply={applyFromPaste} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={Home} title="Caractéristiques" description="Référence, prix et typologie — ou saisie manuelle" step={1}>
          <SmartField label="Référence" value={reference} onChange={setReference} smartFormat={false} />
          <SmartCurrency label="Prix" value={priceStr} onChange={setPriceStr} required placeholder="450 000" hint="Montant en euros" />
          <div className="responsive-grid-form">
            <SmartSelect label="Type" value={type} onChange={(v) => setType(v as PropertyType)} options={typeOptions} />
            <SmartSelect label="Statut" value={status} onChange={(v) => setStatus(v as PropertyStatus)} options={statusOptions} />
          </div>
          <div className="responsive-grid-form">
            <SmartField label="Surface (m²)" value={surface} onChange={setSurface} smartFormat suffix="m²" inputMode="decimal" placeholder="75" />
            <SmartField label="Pièces" value={rooms} onChange={setRooms} smartFormat={false} inputMode="numeric" />
          </div>
        </FormSection>

        <FormSection icon={MapPin} title="Localisation" description="Même liste PACA que recherches et formulaires client" step={2} className="stagger-2">
          <PropertyLocationPicker
            city={city}
            district={district}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
          />
          <SmartField label="Description" value={description} onChange={setDescription} smartFormat={false} placeholder="Atouts, état, visite…" />
          <PropertyPhotoUpload photos={photos} onChange={setPhotos} />
        </FormSection>

        <FormSection icon={Sparkles} title="Équipements" description="Critères pris en compte pour les matchs" step={3} className="stagger-3">
          <div className="responsive-grid-form">
            <EquipmentToggle label="Terrasse" checked={terrace} onChange={setTerrace} activeScale />
            <EquipmentToggle label="Balcon" checked={balcony} onChange={setBalcony} activeScale />
            <EquipmentToggle label="Parking" checked={parking} onChange={setParking} activeScale />
            <EquipmentToggle label="Ascenseur" checked={elevator} onChange={setElevator} activeScale />
            <EquipmentToggle label="Vue" checked={view} onChange={setView} activeScale />
          </div>
        </FormSection>

        <button type="submit" className="btn-primary w-full !rounded-xl animate-fade-up stagger-4">Enregistrer le bien</button>
      </form>
    </div>
  )
}
