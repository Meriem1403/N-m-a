import { useState } from 'react'
import { ArrowLeft, User, Contact, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchCriteriaForm } from '../components/forms/SearchCriteriaForm'
import type { ContactSource, SearchCriteria } from '../types'
import { FormHero } from '../components/ui/FormHero'
import { FormSection } from '../components/ui/FormSection'
import { SmartField } from '../components/ui/SmartField'
import { SmartSelect } from '../components/ui/SmartSelect'
import { buildSearchLabel, parseBudgetInput } from '../lib/smart'
import { sourceLabels } from '../lib/utils'
import { useApp } from '../store/AppContext'

const sourceOptions = Object.entries(sourceLabels).map(([value, label]) => ({ value, label }))

const defaultSearchCriteria = (): SearchCriteria => ({
  propertyTypes: ['T3'],
  cities: ['Marseille'],
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

export function ProfileNew() {
  const navigate = useNavigate()
  const { addProfile, addSearch } = useApp()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [firstContactDate, setFirstContactDate] = useState(new Date().toISOString().split('T')[0])
  const [source, setSource] = useState<ContactSource>('autre')
  const [notes, setNotes] = useState('')
  const [addSearchToo, setAddSearchToo] = useState(true)
  const [criteria, setCriteria] = useState<SearchCriteria>(defaultSearchCriteria())
  const [budgetMaxStr, setBudgetMaxStr] = useState('')
  const [surfaceMinStr, setSurfaceMinStr] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const profile = addProfile({
      firstName: firstName.trim() || 'Prénom',
      lastName: lastName.trim() || 'Nom',
      phone: phone || undefined,
      email: email || undefined,
      firstContactDate,
      source,
      notes: notes || undefined,
      exchanges: [],
    })
    if (addSearchToo) {
      addSearch({
        profileId: profile.id,
        label: buildSearchLabel(criteria.propertyTypes, criteria.cities, criteria.districts),
        active: true,
        criteria: {
          ...criteria,
          budgetMax: parseBudgetInput(budgetMaxStr),
          surfaceMin: parseBudgetInput(surfaceMinStr),
        },
      })
    }
    navigate(`/profils/${profile.id}`)
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--narrow">
      <Link to="/profils" className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Profils</Link>

      <FormHero
        variant="profile"
        badge="Nouveau profil"
        title="Ajouter une personne"
        subtitle="Email et téléphone sont détectés et formatés en temps réel."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={User} title="Identité" description="Nom et coordonnées du prospect" step={1}>
          <div className="responsive-grid-form">
            <SmartField label="Prénom" value={firstName} onChange={setFirstName} required />
            <SmartField label="Nom" value={lastName} onChange={setLastName} required />
          </div>
          <SmartField label="Téléphone" value={phone} onChange={setPhone} type="tel" placeholder="06 12 34 56 78" />
          <SmartField label="Email" value={email} onChange={setEmail} type="email" />
        </FormSection>

        <FormSection icon={Contact} title="Contact & source" description="Origine et historique du premier échange" step={2} className="stagger-2">
          <div className="responsive-grid-form">
            <SmartField label="Date de contact" value={firstContactDate} onChange={setFirstContactDate} type="date" smartFormat={false} />
            <SmartSelect label="Source" value={source} onChange={(v) => setSource(v as ContactSource)} options={sourceOptions} />
          </div>
          <SmartField label="Notes" value={notes} onChange={setNotes} smartFormat={false} placeholder="Contexte, préférences, rappels…" />
        </FormSection>

        <FormSection icon={Search} title="Recherche associée" description="Optionnel. Créez une recherche dès l'enregistrement." step={3} className="stagger-3">
          <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition-colors hover:border-indigo-400/20">
            <input type="checkbox" checked={addSearchToo} onChange={(e) => setAddSearchToo(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
            <span className="text-sm font-medium text-white">Créer une recherche associée</span>
          </label>
          {addSearchToo && (
            <SearchCriteriaForm
              criteria={criteria}
              onChange={setCriteria}
              budgetMaxStr={budgetMaxStr}
              onBudgetMaxStrChange={setBudgetMaxStr}
              surfaceMinStr={surfaceMinStr}
              onSurfaceMinStrChange={setSurfaceMinStr}
            />
          )}
        </FormSection>

        <button type="submit" className="btn-primary w-full !rounded-xl animate-fade-up stagger-4">Enregistrer le profil</button>
      </form>
    </div>
  )
}
