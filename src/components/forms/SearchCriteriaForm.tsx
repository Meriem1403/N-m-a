import type { CriterionLevel, PropertyType, SearchCriteria } from '../../types'
import { SmartChips } from '../ui/SmartChips'
import { SmartCriterion } from '../ui/SmartCriterion'
import { SmartCurrency } from '../ui/SmartCurrency'
import { SmartField } from '../ui/SmartField'
import { SmartTags } from '../ui/SmartTags'
import { PROPERTY_TYPE_OPTIONS } from '../../lib/smart'
import { parseBudgetInput } from '../../lib/smart'

interface SearchCriteriaFormProps {
  criteria: SearchCriteria
  onChange: (criteria: SearchCriteria) => void
  budgetMaxStr: string
  onBudgetMaxStrChange: (v: string) => void
  surfaceMinStr: string
  onSurfaceMinStrChange: (v: string) => void
}

const CRITERION_FIELDS: { key: keyof Pick<SearchCriteria, 'terrace' | 'balcony' | 'garden' | 'parking' | 'garage' | 'cave' | 'elevator' | 'view' | 'works'>; label: string }[] = [
  { key: 'terrace', label: 'Terrasse' },
  { key: 'balcony', label: 'Balcon' },
  { key: 'garden', label: 'Jardin' },
  { key: 'parking', label: 'Parking' },
  { key: 'garage', label: 'Garage' },
  { key: 'cave', label: 'Cave' },
  { key: 'elevator', label: 'Ascenseur' },
  { key: 'view', label: 'Vue' },
  { key: 'works', label: 'Travaux acceptés' },
]

export function SearchCriteriaForm({
  criteria, onChange, budgetMaxStr, onBudgetMaxStrChange, surfaceMinStr, onSurfaceMinStrChange,
}: SearchCriteriaFormProps) {
  const setCriterion = (key: typeof CRITERION_FIELDS[0]['key'], level: CriterionLevel) => {
    onChange({ ...criteria, [key]: { level } })
  }

  return (
    <div className="space-y-5">
      <SmartChips<PropertyType>
        label="Types de bien"
        options={PROPERTY_TYPE_OPTIONS}
        selected={criteria.propertyTypes}
        onChange={(types) => onChange({ ...criteria, propertyTypes: types })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SmartField
          label="Ville"
          value={criteria.cities[0] ?? ''}
          onChange={(v) => onChange({ ...criteria, cities: v ? [v] : [] })}
          smartFormat={false}
        />
        <SmartCurrency label="Budget max" value={budgetMaxStr} onChange={onBudgetMaxStrChange} />
      </div>

      <SmartTags
        label="Quartiers / arrondissements"
        tags={criteria.districts}
        onChange={(districts) => onChange({ ...criteria, districts })}
        placeholder="Ex: 8e, Bonneveine…"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SmartField
          label="Surface min (m²)"
          value={surfaceMinStr}
          onChange={onSurfaceMinStrChange}
          smartFormat={false}
          hint={surfaceMinStr && parseBudgetInput(surfaceMinStr) ? `≥ ${parseBudgetInput(surfaceMinStr)} m²` : undefined}
        />
        <SmartField
          label="Pièces min"
          value={criteria.rooms?.toString() ?? ''}
          onChange={(v) => onChange({ ...criteria, rooms: parseBudgetInput(v) })}
          smartFormat={false}
        />
      </div>

      <div className="nemea-panel !p-4 space-y-1">
        <p className="section-label mb-3">Critères détaillés</p>
        {CRITERION_FIELDS.map(({ key, label }) => (
          <SmartCriterion
            key={key}
            label={label}
            value={criteria[key].level}
            onChange={(level) => setCriterion(key, level)}
          />
        ))}
      </div>

      <SmartField
        label="Autres critères"
        value={criteria.otherCriteria ?? ''}
        onChange={(v) => onChange({ ...criteria, otherCriteria: v || undefined })}
        smartFormat={false}
      />
    </div>
  )
}
