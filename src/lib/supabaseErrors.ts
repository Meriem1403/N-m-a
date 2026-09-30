import type { PostgrestError } from '@supabase/supabase-js'

const CODE_HINTS: Record<string, string> = {
  '23505': 'Cette valeur existe déjà (ex. référence de bien déjà utilisée).',
  '23503': 'Donnée liée introuvable (profil ou recherche supprimé).',
  '22P02': 'Identifiant ou format invalide.',
  '42501': 'Accès refusé — vérifiez la clé API Supabase (anon / publishable) et les policies RLS.',
  PGRST116: 'Aucune ligne trouvée pour cette mise à jour.',
}

function dbError(message: string, err?: unknown): Error {
  const e = new Error(message)
  if (err && typeof err === 'object') Object.assign(e, err)
  return e
}

export function formatSupabaseError(err: unknown): string {
  if (typeof err === 'string' && err.trim()) return err

  if (err instanceof Error && err.message.trim()) {
    return err.message
  }

  if (!err || typeof err !== 'object') {
    return 'Impossible d’enregistrer dans Supabase (erreur inconnue).'
  }

  const e = err as PostgrestError & { error_description?: string; status?: number }
  const parts: string[] = []

  if (e.message?.trim()) parts.push(e.message.trim())
  if (e.details?.trim()) parts.push(e.details.trim())
  if (e.hint?.trim()) parts.push(e.hint.trim())
  if (typeof e.error_description === 'string' && e.error_description.trim()) {
    parts.push(e.error_description.trim())
  }
  if (typeof e.status === 'number') parts.push(`HTTP ${e.status}`)
  if (e.code && CODE_HINTS[e.code]) parts.push(CODE_HINTS[e.code])

  if (parts.length > 0) return parts.join(' — ')

  return 'Impossible d’enregistrer dans Supabase. Essayez la clé API « Legacy anon » dans Netlify (Settings → API Keys).'
}

export function throwSupabaseError(context: string, err: PostgrestError | null): void {
  if (!err) return
  throw dbError(`${context} : ${formatSupabaseError(err)}`, err)
}
