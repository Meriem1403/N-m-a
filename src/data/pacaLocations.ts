/** Villes principales PACA + arrondissements / secteurs pour la recherche multi-zones */

function arrondissements(city: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const suffix = n === 1 ? 'er' : 'e'
    return `${city} — ${n}${suffix} arrondissement`
  })
}

export const PACA_CITIES = [
  'Marseille',
  'Aix-en-Provence',
  'Nice',
  'Toulon',
  'Avignon',
  'Cannes',
  'Antibes',
  'Grasse',
  'Hyères',
  'Fréjus',
  'Arles',
  'Martigues',
  'Salon-de-Provence',
  'La Ciotat',
  'Aubagne',
  'Istres',
  'Gap',
  'Digne-les-Bains',
  'Manosque',
  'Draguignan',
] as const

export type PacaCity = (typeof PACA_CITIES)[number]

/** Arrondissements ou secteurs cliquables par ville */
export const DISTRICTS_BY_CITY: Record<string, string[]> = {
  Marseille: arrondissements('Marseille', 16),
  Nice: arrondissements('Nice', 7),
  Toulon: [
    'Toulon — Centre-ville',
    'Toulon — Mourillon',
    'Toulon — Port',
    'Toulon — Le Las',
    'Toulon — Sainte-Musse',
  ],
  'Aix-en-Provence': [
    'Aix — Centre',
    'Aix — Jas de Bouffan',
    'Aix — Sextius',
    'Aix — Puyricard',
    'Aix — Les Milles',
  ],
  Avignon: ['Avignon — Intra-muros', 'Avignon — Grand Avignon', 'Avignon — Montfavet'],
  Cannes: ['Cannes — Centre', 'Cannes — Californie', 'Cannes — La Bocca', 'Cannes — Palm Beach'],
  Antibes: ['Antibes — Centre', 'Antibes — Juan-les-Pins', 'Antibes — Cap d\'Antibes'],
}

export function districtsForCities(cities: string[]): string[] {
  const out: string[] = []
  for (const city of cities) {
    const list = DISTRICTS_BY_CITY[city]
    if (list) out.push(...list)
  }
  return out
}

export function flattenDistrictLabel(label: string): string {
  const m = label.match(/—\s*(.+)$/)
  return m ? m[1].trim() : label
}

export function flattenDistrictLabels(selected: string[]): string[] {
  return selected.map(flattenDistrictLabel)
}

/** Retrouve le libellé complet (ville — secteur) à partir de la valeur en base */
export function expandDistrictForCity(city: string, stored?: string): string | null {
  if (!stored?.trim()) return null
  const list = DISTRICTS_BY_CITY[city] ?? []
  const hit = list.find(
    (d) => flattenDistrictLabel(d) === stored.trim() || d === stored.trim(),
  )
  return hit ?? null
}

export function expandDistrictsForPicker(cities: string[], stored: string[]): string[] {
  const out: string[] = []
  for (const s of stored) {
    let matched = false
    for (const city of cities) {
      const full = expandDistrictForCity(city, s)
      if (full && !out.includes(full)) {
        out.push(full)
        matched = true
        break
      }
    }
    if (!matched && s.includes('—')) out.push(s)
  }
  return out
}
