import { useMemo } from 'react'
import { SmartSelect } from '../ui/SmartSelect'
import {
  DISTRICTS_BY_CITY,
  PACA_CITIES,
  type PacaCity,
  expandDistrictForCity,
  flattenDistrictLabel,
} from '../../data/pacaLocations'

interface PropertyLocationPickerProps {
  city: string
  district: string
  onCityChange: (city: string) => void
  onDistrictChange: (district: string) => void
}

export function PropertyLocationPicker({
  city,
  district,
  onCityChange,
  onDistrictChange,
}: PropertyLocationPickerProps) {
  const cityOptions = useMemo(() => {
    const base = PACA_CITIES.map((c) => ({ value: c, label: c }))
    if (city && !PACA_CITIES.includes(city as PacaCity)) {
      return [{ value: city, label: city }, ...base]
    }
    return base
  }, [city])

  const districtOptions = DISTRICTS_BY_CITY[city] ?? []
  const selectedFull = expandDistrictForCity(city, district)

  const pickDistrict = (fullLabel: string) => {
    onDistrictChange(flattenDistrictLabel(fullLabel))
  }

  return (
    <div className="space-y-4">
      <SmartSelect
        label="Ville (PACA)"
        value={city || PACA_CITIES[0]}
        onChange={(next) => {
          onCityChange(next)
          const stillValid = expandDistrictForCity(next, district)
          if (!stillValid) onDistrictChange('')
        }}
        options={cityOptions}
      />

      {districtOptions.length > 0 ? (
        <fieldset className="paca-districts-block">
          <legend className="smart-field__label">{city} — arrondissement / secteur</legend>
          <div className="paca-districts-block__grid">
            {districtOptions.map((label) => (
              <button
                key={label}
                type="button"
                className={`filter-chip ${selectedFull === label ? 'filter-chip--active' : ''}`}
                aria-pressed={selectedFull === label}
                onClick={() => {
                  if (selectedFull === label) onDistrictChange('')
                  else pickDistrict(label)
                }}
              >
                {label.replace(`${city} — `, '').replace(/^[^:]+:\s*/, '')}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-xs text-nemea-subtle">
          Pas de secteurs prédéfinis pour cette ville — précisez le quartier dans la description si besoin.
        </p>
      )}
    </div>
  )
}
