import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageBackLink } from '../components/ui/PageBackLink'
import { PageHeader } from '../components/ui/PageHeader'
import { SmartCurrency } from '../components/ui/SmartCurrency'
import { SmartField } from '../components/ui/SmartField'
import { SmartSelect } from '../components/ui/SmartSelect'
import { formatBudgetDisplay, parseBudgetInput } from '../lib/smart'
import { statusLabels } from '../lib/utils'
import type { PropertyStatus, PropertyType } from '../types'
import { PropertyPhotoUpload } from '../components/ui/PropertyPhotoUpload'
import { EquipmentToggle } from '../components/ui/EquipmentToggle'
import { PropertyLocationPicker } from '../components/forms/PropertyLocationPicker'
import { useApp } from '../store/AppContext'

const typeOptions = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5+', 'maison', 'loft'].map((t) => ({ value: t, label: t }))
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }))

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
  const [photos, setPhotos] = useState<string[]>(property?.photos ?? [])

  if (!property) {
    return (
      <div className="text-center py-16">
        <p className="text-nemea-subtle">Bien introuvable</p>
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
      terrace, balcony, parking, elevator, view, photos,
    })
    navigate(`/biens/${property.id}`)
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--wide">
      <PageBackLink to={`/biens/${property.id}`} label="Retour à la fiche" />
      <PageHeader eyebrow="Modifier" title={property.reference} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="nemea-panel space-y-3 animate-fade-up">
          <SmartField label="Référence" value={reference} onChange={setReference} smartFormat={false} />
          <SmartCurrency label="Prix" value={priceStr} onChange={setPriceStr} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmartSelect label="Type" value={type} onChange={(v) => setType(v as PropertyType)} options={typeOptions} />
            <SmartSelect label="Statut" value={status} onChange={(v) => setStatus(v as PropertyStatus)} options={statusOptions} />
          </div>
          <PropertyLocationPicker
            city={city}
            district={district}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmartField label="Surface (m²)" value={surface} onChange={setSurface} smartFormat suffix="m²" />
            <SmartField label="Pièces" value={rooms} onChange={setRooms} smartFormat={false} inputMode="numeric" />
          </div>
          <SmartField label="Description" value={description} onChange={setDescription} smartFormat={false} />
          <PropertyPhotoUpload photos={photos} onChange={setPhotos} />
        </section>

        <section className="nemea-panel space-y-2.5 animate-fade-up stagger-2">
          <h2 className="nemea-panel-title !mb-0">Équipements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <EquipmentToggle label="Terrasse" checked={terrace} onChange={setTerrace} />
            <EquipmentToggle label="Balcon" checked={balcony} onChange={setBalcony} />
            <EquipmentToggle label="Parking" checked={parking} onChange={setParking} />
            <EquipmentToggle label="Ascenseur" checked={elevator} onChange={setElevator} />
            <EquipmentToggle label="Vue" checked={view} onChange={setView} />
          </div>
        </section>

        <button type="submit" className="btn-primary w-full !rounded-xl">Enregistrer</button>
      </form>
    </div>
  )
}
