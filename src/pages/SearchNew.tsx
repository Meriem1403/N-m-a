import { useState } from 'react'
import { ArrowLeft, User, Search } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SearchCriteriaForm } from '../components/forms/SearchCriteriaForm'
import { FormHero } from '../components/ui/FormHero'
import { FormSection } from '../components/ui/FormSection'
import { SmartField } from '../components/ui/SmartField'
import { SmartSelect } from '../components/ui/SmartSelect'
import { buildSearchLabel, parseBudgetInput } from '../lib/smart'
import type { SearchCriteria } from '../types'
import { useApp } from '../store/AppContext'

const defaultCriteria = (): SearchCriteria => ({
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

export function SearchNew() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { profiles, addSearch } = useApp()
  const [profileId, setProfileId] = useState(params.get('profileId') ?? profiles[0]?.id ?? '')
  const [label, setLabel] = useState('')
  const [autoLabel, setAutoLabel] = useState(true)
  const [criteria, setCriteria] = useState<SearchCriteria>(defaultCriteria())
  const [budgetMaxStr, setBudgetMaxStr] = useState('')
  const [surfaceMinStr, setSurfaceMinStr] = useState('')

  const profileOptions = profiles.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))

  const handleCriteriaChange = (next: SearchCriteria) => {
    setCriteria(next)
    if (autoLabel) setLabel(buildSearchLabel(next.propertyTypes, next.cities, next.districts))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const search = addSearch({
      profileId,
      label: label.trim() || buildSearchLabel(criteria.propertyTypes, criteria.cities, criteria.districts),
      active: true,
      criteria: {
        ...criteria,
        budgetMax: parseBudgetInput(budgetMaxStr),
        surfaceMin: parseBudgetInput(surfaceMinStr),
      },
    })
    navigate(`/recherches/${search.id}`)
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--narrow">
      <Link to="/recherches" className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Recherches</Link>

      <FormHero
        variant="search"
        badge="Nouvelle recherche"
        title="Créer une recherche"
        subtitle="Définissez les critères. Les correspondances se calculent dès l'enregistrement."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection icon={User} title="Prospect" description="Associez la recherche à un profil existant" step={1}>
          <SmartSelect label="Prospect associé" value={profileId} onChange={setProfileId} options={profileOptions} />
          <div>
            <SmartField label="Libellé" value={label} onChange={(v) => { setLabel(v); setAutoLabel(false) }} smartFormat={false} placeholder="T3 Marseille 8e" />
            <label className="mt-2 flex items-center gap-2 text-xs text-nemea-subtle cursor-pointer">
              <input type="checkbox" checked={autoLabel} onChange={(e) => setAutoLabel(e.target.checked)} className="accent-indigo-500" />
              Générer automatiquement le libellé
            </label>
          </div>
        </FormSection>

        <FormSection icon={Search} title="Critères" description="Types, budget, localisation et équipements" step={2} className="stagger-2">
          <SearchCriteriaForm
            criteria={criteria}
            onChange={handleCriteriaChange}
            budgetMaxStr={budgetMaxStr}
            onBudgetMaxStrChange={setBudgetMaxStr}
            surfaceMinStr={surfaceMinStr}
            onSurfaceMinStrChange={setSurfaceMinStr}
          />
        </FormSection>

        <button type="submit" className="btn-primary w-full !rounded-xl animate-fade-up stagger-3">Créer la recherche</button>
      </form>
    </div>
  )
}
