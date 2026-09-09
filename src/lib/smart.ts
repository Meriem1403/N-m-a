import type { PropertyType } from '../types'

export function detectInputType(value: string, label?: string): 'email' | 'tel' | 'date' | 'number' | 'text' {
  const l = (label ?? '').toLowerCase()
  if (l.includes('email') || l.includes('mail') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email'
  if (l.includes('téléphone') || l.includes('telephone') || l.includes('phone') || /^[\d\s+().-]{8,}$/.test(value)) return 'tel'
  if (l.includes('date')) return 'date'
  if (l.includes('budget') || l.includes('prix') || l.includes('surface') || l.includes('pièce') || /^\d[\d\s.]*$/.test(value)) return 'number'
  return 'text'
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10
}

export function parseBudgetInput(value: string): number | undefined {
  const num = parseInt(value.replace(/[\s.€]/g, ''), 10)
  return isNaN(num) ? undefined : num
}

export function formatBudgetDisplay(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('fr-FR').format(parseInt(digits, 10))
}

export function formatSurfaceInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('')
  return cleaned
}

export function getConfidenceLevel(confidence?: number): 'high' | 'medium' | 'low' | 'none' {
  if (confidence === undefined) return 'none'
  if (confidence >= 0.85) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

export function suggestFromQuery<T extends Record<string, string>>(
  items: T[],
  query: string,
  fields: (keyof T)[],
  limit = 6,
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return items.slice(0, limit)
  return items.filter((item) => fields.some((f) => String(item[f]).toLowerCase().includes(q))).slice(0, limit)
}

export const MARSEILLE_DISTRICTS = [
  '1er arrondissement', '2e arrondissement', '3e arrondissement', '4e arrondissement',
  '5e arrondissement', '6e arrondissement', '7e arrondissement', '8e arrondissement',
  '9e arrondissement', '10e arrondissement', '11e arrondissement', '12e arrondissement',
  '13e arrondissement', '14e arrondissement', '15e arrondissement', '16e arrondissement',
]

export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'T1', label: 'T1' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
  { value: 'T4', label: 'T4' },
  { value: 'T5+', label: 'T5+' },
  { value: 'maison', label: 'Maison' },
  { value: 'loft', label: 'Loft' },
]

export function suggestDistricts(query: string, selected: string[] = [], limit = 6): string[] {
  const q = query.trim().toLowerCase()
  return MARSEILLE_DISTRICTS
    .filter((d) => !selected.includes(d))
    .filter((d) => !q || d.toLowerCase().includes(q) || d.match(/\d+/)?.[0]?.includes(q))
    .slice(0, limit)
}

export function buildSearchLabel(types: PropertyType[], cities: string[], districts: string[]): string {
  const typePart = types.length ? types.join('/') : 'Recherche'
  const loc = cities[0] ?? ''
  const dist = districts.length ? ` ${districts.map((d) => d.replace(' arrondissement', '')).join('-')}` : ''
  return [typePart, loc ? `${loc}${dist}` : ''].filter(Boolean).join(' · ')
}
