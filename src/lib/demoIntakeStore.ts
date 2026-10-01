import type { ClientIntake, IntakeToken, PublicIntakePayload } from '../types'

const TOKENS_KEY = 'nemea-demo-intake-tokens'
const INTAKES_KEY = 'nemea-demo-client-intakes'

function readTokens(): IntakeToken[] {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? '[]') as IntakeToken[]
  } catch {
    return []
  }
}

function writeTokens(tokens: IntakeToken[]) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

function readIntakes(): ClientIntake[] {
  try {
    return JSON.parse(localStorage.getItem(INTAKES_KEY) ?? '[]') as ClientIntake[]
  } catch {
    return []
  }
}

function writeIntakes(intakes: ClientIntake[]) {
  localStorage.setItem(INTAKES_KEY, JSON.stringify(intakes))
}

export function demoFetchIntakeTokens(): IntakeToken[] {
  return readTokens()
}

export function demoFetchClientIntakes(): ClientIntake[] {
  return readIntakes()
}

export function demoCreateIntakeToken(label?: string): IntakeToken {
  const token: IntakeToken = {
    id: crypto.randomUUID(),
    label: label?.trim() || undefined,
    active: true,
    createdAt: new Date().toISOString(),
  }
  writeTokens([token, ...readTokens()])
  return token
}

export function demoSetTokenActive(id: string, active: boolean) {
  writeTokens(readTokens().map((t) => (t.id === id ? { ...t, active } : t)))
}

export function demoIntakeLinkOpen(tokenId: string): boolean {
  const t = readTokens().find((x) => x.id === tokenId)
  return Boolean(t?.active)
}

export function demoSubmitIntake(tokenId: string, payload: PublicIntakePayload) {
  const now = new Date().toISOString()
  const intake: ClientIntake = {
    id: crypto.randomUUID(),
    intakeTokenId: tokenId,
    status: 'pending',
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    email: payload.email,
    message: payload.message,
    criteria: payload.criteria ?? {},
    createdAt: now,
    updatedAt: now,
  }
  writeIntakes([intake, ...readIntakes()])
}

export function demoPatchIntake(
  id: string,
  patch: Partial<Pick<ClientIntake, 'status' | 'agentNotes' | 'processedProfileId'>>,
) {
  writeIntakes(
    readIntakes().map((i) =>
      i.id === id
        ? { ...i, ...patch, updatedAt: new Date().toISOString() }
        : i,
    ),
  )
}
