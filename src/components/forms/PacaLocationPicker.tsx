import { SmartChips } from '../ui/SmartChips'
import { PACA_CITIES, DISTRICTS_BY_CITY, flattenDistrictLabel } from '../../data/pacaLocations'

interface PacaLocationPickerProps {
  cities: string[]
  districts: string[]
  onCitiesChange: (cities: string[]) => void
  onDistrictsChange: (districts: string[]) => void
}

export function PacaLocationPicker({
  cities,
  districts,
  onCitiesChange,
  onDistrictsChange,
}: PacaLocationPickerProps) {
  const cityOptions = PACA_CITIES.map((c) => ({ value: c, label: c }))

  const isDistrictActive = (fullLabel: string) =>
    districts.some((d) => flattenDistrictLabel(d) === flattenDistrictLabel(fullLabel))

  const toggleDistrict = (fullLabel: string) => {
    const flat = flattenDistrictLabel(fullLabel)
    if (isDistrictActive(fullLabel)) {
      onDistrictsChange(districts.filter((d) => flattenDistrictLabel(d) !== flat))
    } else {
      onDistrictsChange([...districts, flat])
    }
  }

  const citiesWithDistricts = cities.filter((c) => DISTRICTS_BY_CITY[c]?.length)

  return (
    <div className="space-y-4">
      <SmartChips
        label="Villes (PACA) — plusieurs choix possibles"
        options={cityOptions}
        selected={cities}
        onChange={(next) => {
          onCitiesChange(next)
          const allowed = new Set(
            next.flatMap((c) => (DISTRICTS_BY_CITY[c] ?? []).map(flattenDistrictLabel)),
          )
          onDistrictsChange(districts.filter((d) => allowed.has(flattenDistrictLabel(d))))
        }}
      />

      {citiesWithDistricts.map((city) => (
        <fieldset key={city} className="paca-districts-block">
          <legend className="smart-field__label">{city} — arrondissements / secteurs</legend>
          <div className="paca-districts-block__grid">
            {(DISTRICTS_BY_CITY[city] ?? []).map((label) => (
              <button
                key={label}
                type="button"
                className={`filter-chip ${isDistrictActive(label) ? 'filter-chip--active' : ''}`}
                aria-pressed={isDistrictActive(label)}
                onClick={() => toggleDistrict(label)}
              >
                {label.replace(`${city} — `, '')}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
