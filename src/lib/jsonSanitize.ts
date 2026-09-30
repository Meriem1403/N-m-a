/** Retire les clés undefined avant envoi JSON à PostgREST */
export function stripUndefined<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stripUndefined) as T

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val !== undefined) out[key] = stripUndefined(val)
  }
  return out as T
}
