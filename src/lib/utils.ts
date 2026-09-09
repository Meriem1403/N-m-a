import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { ContactSource, CriterionLevel, PropertyStatus } from '../types'

export function formatDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'd MMMM yyyy', { locale: fr }) } catch { return dateStr }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
}

export function formatShortDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'd MMM', { locale: fr }) } catch { return dateStr }
}

export const sourceLabels: Record<ContactSource, string> = {
  telephone: 'Téléphone', email: 'Email', site_web: 'Site web', leboncoin: 'Leboncoin',
  seloger: 'SeLoger', bienici: 'Bien\'ici', recommandation: 'Recommandation', salon: 'Salon', autre: 'Autre',
}

export const criterionLabels: Record<CriterionLevel, string> = {
  required: 'Obligatoire', wanted: 'Souhaité', indifferent: 'Indifférent', refused: 'Refusé',
}

export const statusLabels: Record<PropertyStatus, string> = {
  disponible: 'Disponible', option: 'Option', compromis: 'Compromis', vendu: 'Vendu', retire: 'Retiré',
}

export const statusColors: Record<PropertyStatus, string> = {
  disponible: 'nemea-badge nemea-badge--success',
  option: 'nemea-badge nemea-badge--accent',
  compromis: 'nemea-badge nemea-badge--alert',
  vendu: 'nemea-badge nemea-badge--muted',
  retire: 'nemea-badge nemea-badge--muted',
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
