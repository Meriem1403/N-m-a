import { supabase } from './supabase'
import { throwSupabaseError } from './supabaseErrors'
import type { ClientIntake, IntakeToken, PublicIntakePayload } from '../types'

function assertSupabase() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

type IntakeRow = {
  id: string
  intake_token_id: string
  status: ClientIntake['status']
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  message: string | null
  criteria: Record<string, unknown>
  agent_notes: string | null
  processed_profile_id: string | null
  created_at: string
  updated_at: string
}

type TokenRow = {
  id: string
  label: string | null
  active: boolean
  expires_at: string | null
  created_at: string
}

function mapIntake(row: IntakeRow): ClientIntake {
  return {
    id: row.id,
    intakeTokenId: row.intake_token_id,
    status: row.status,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    message: row.message ?? undefined,
    criteria: row.criteria,
    agentNotes: row.agent_notes ?? undefined,
    processedProfileId: row.processed_profile_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapToken(row: TokenRow): IntakeToken {
  return {
    id: row.id,
    label: row.label ?? undefined,
    active: row.active,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
  }
}

export async function checkIntakeLinkOpen(tokenId: string): Promise<boolean> {
  const client = assertSupabase()
  const { data, error } = await client.rpc('intake_link_is_open', { p_token: tokenId })
  if (error) throwSupabaseError('Vérification du lien', error)
  return Boolean(data)
}

export async function submitPublicIntake(tokenId: string, payload: PublicIntakePayload): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('client_intakes').insert({
    intake_token_id: tokenId,
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    phone: payload.phone?.trim() || null,
    email: payload.email?.trim() || null,
    message: payload.message?.trim() || null,
    criteria: payload.criteria ?? {},
  })
  if (error) throwSupabaseError('Envoi du formulaire', error)
}

export async function fetchClientIntakes(): Promise<ClientIntake[]> {
  const client = assertSupabase()
  const { data, error } = await client
    .from('client_intakes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throwSupabaseError('Lecture des demandes', error)
  return ((data ?? []) as IntakeRow[]).map(mapIntake)
}

export async function fetchIntakeTokens(): Promise<IntakeToken[]> {
  const client = assertSupabase()
  const { data, error } = await client
    .from('intake_tokens')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throwSupabaseError('Lecture des liens', error)
  return ((data ?? []) as TokenRow[]).map(mapToken)
}

export async function createIntakeToken(label?: string): Promise<IntakeToken> {
  const client = assertSupabase()
  const { data, error } = await client
    .from('intake_tokens')
    .insert({ label: label?.trim() || null })
    .select('*')
    .single()
  if (error) throwSupabaseError('Création du lien', error)
  if (!data) throw new Error('Lien non créé')
  return mapToken(data as TokenRow)
}

export async function setIntakeTokenActive(id: string, active: boolean): Promise<void> {
  const client = assertSupabase()
  const { error } = await client.from('intake_tokens').update({ active }).eq('id', id)
  if (error) throwSupabaseError('Mise à jour du lien', error)
}

export async function patchClientIntake(
  id: string,
  patch: Partial<Pick<ClientIntake, 'status' | 'agentNotes' | 'processedProfileId'>>,
): Promise<void> {
  const client = assertSupabase()
  const row: Record<string, unknown> = {}
  if (patch.status !== undefined) row.status = patch.status
  if (patch.agentNotes !== undefined) row.agent_notes = patch.agentNotes || null
  if (patch.processedProfileId !== undefined) row.processed_profile_id = patch.processedProfileId || null
  if (Object.keys(row).length === 0) return
  const { error } = await client.from('client_intakes').update(row).eq('id', id)
  if (error) throwSupabaseError('Mise à jour de la demande', error)
}

export function buildIntakeShareUrl(tokenId: string): string {
  return `${window.location.origin}/f/${tokenId}`
}
