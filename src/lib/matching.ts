import type { CriterionValue, MatchDetail, MatchResult, Profile, Property, PropertyType, Search, SearchCriteria } from '../types'

/** Marge acceptée autour du budget (au-dessus ou en dessous) pour une correspondance */
export const BUDGET_TOLERANCE_RATIO = 0.2

/** Score minimum pour afficher une recherche sur une fiche bien */
export const MIN_PROPERTY_MATCH_SCORE = 50
/** Score minimum pour afficher un bien sur une fiche recherche */
export const MIN_SEARCH_MATCH_SCORE = 50

const CRITERION_LABELS: Record<string, string> = {
  budget: 'Budget',
  location: 'Localisation',
  type: 'Type',
  surface: 'Surface',
  rooms: 'Pièces',
  terrace: 'Terrasse',
  balcony: 'Balcon',
  garden: 'Jardin',
  parking: 'Parking',
  garage: 'Garage',
  cave: 'Cave',
  elevator: 'Ascenseur',
  view: 'Vue',
  works: 'Travaux',
}

const BOOLEAN_CRITERIA: {
  key: keyof Pick<
    SearchCriteria,
    'terrace' | 'balcony' | 'garden' | 'parking' | 'garage' | 'cave' | 'elevator' | 'view' | 'works'
  >
  propertyKey: keyof Pick<
    Property,
    'terrace' | 'balcony' | 'garden' | 'parking' | 'garage' | 'cave' | 'elevator' | 'view' | 'works'
  >
  label: string
}[] = [
  { key: 'terrace', propertyKey: 'terrace', label: CRITERION_LABELS.terrace },
  { key: 'balcony', propertyKey: 'balcony', label: CRITERION_LABELS.balcony },
  { key: 'garden', propertyKey: 'garden', label: CRITERION_LABELS.garden },
  { key: 'parking', propertyKey: 'parking', label: CRITERION_LABELS.parking },
  { key: 'garage', propertyKey: 'garage', label: CRITERION_LABELS.garage },
  { key: 'cave', propertyKey: 'cave', label: CRITERION_LABELS.cave },
  { key: 'elevator', propertyKey: 'elevator', label: CRITERION_LABELS.elevator },
  { key: 'view', propertyKey: 'view', label: CRITERION_LABELS.view },
  { key: 'works', propertyKey: 'works', label: CRITERION_LABELS.works },
]

function propertyMatchesType(criteriaTypes: PropertyType[], property: Property): boolean {
  return criteriaTypes.some((t) => {
    if (property.type.toLowerCase() === t.toLowerCase()) return true
    if (t === 'T5+' && property.rooms >= 5) return true
    return false
  })
}

function evaluateBooleanCriterion(
  criterion: CriterionValue,
  propertyHas: boolean,
  label: string,
): MatchDetail {
  if (criterion.level === 'indifferent') {
    return { criterion: label, status: 'match', message: `${label} — indifférent` }
  }
  if (criterion.level === 'refused') {
    if (propertyHas) {
      return { criterion: label, status: 'miss', message: `${label} refusé mais présent` }
    }
    return { criterion: label, status: 'match', message: `${label} — absent ✓` }
  }
  if (criterion.level === 'required') {
    if (propertyHas) {
      return { criterion: label, status: 'match', message: `${label} ✓` }
    }
    return { criterion: label, status: 'miss', message: `${label} obligatoire — absent` }
  }
  // wanted
  if (propertyHas) {
    return { criterion: label, status: 'bonus', message: `${label} ✓ (souhaité)` }
  }
  return { criterion: label, status: 'partial', message: `${label} souhaité — absent` }
}

function matchLocation(criteria: SearchCriteria, property: Property): MatchDetail {
  const label = CRITERION_LABELS.location
  const cityMatch =
    criteria.cities.length === 0 ||
    criteria.cities.some((c) => property.city.toLowerCase().includes(c.toLowerCase()))

  if (!cityMatch) {
    return { criterion: label, status: 'miss', message: `${property.city} — hors zone` }
  }

  if (criteria.districts.length > 0 && property.district) {
    const districtNum = property.district.match(/\d+/)?.[0]
    const districtMatch = criteria.districts.some((d) => {
      const num = d.match(/\d+/)?.[0]
      return num && districtNum && num === districtNum
    })
    if (districtMatch) {
      return { criterion: label, status: 'match', message: `${property.city} ${property.district} ✓` }
    }
    return { criterion: label, status: 'miss', message: `${property.district} — quartier non recherché` }
  }

  if (criteria.districts.length > 0 && !property.district) {
    return { criterion: label, status: 'partial', message: `${property.city} — arrondissement non renseigné` }
  }

  return { criterion: label, status: 'match', message: `${property.city} ✓` }
}

function getBudgetToleranceBounds(criteria: SearchCriteria): { low: number; high: number } | null {
  const { budgetMin, budgetMax } = criteria
  if (budgetMin === undefined && budgetMax === undefined) return null

  const t = BUDGET_TOLERANCE_RATIO
  let low: number
  let high: number

  if (budgetMax !== undefined && budgetMin !== undefined) {
    low = budgetMin * (1 - t)
    high = budgetMax * (1 + t)
  } else if (budgetMax !== undefined) {
    low = budgetMax * (1 - t)
    high = budgetMax * (1 + t)
  } else {
    low = budgetMin! * (1 - t)
    high = budgetMin! * (1 + t)
  }

  return { low, high }
}

function matchBudget(criteria: SearchCriteria, property: Property): MatchDetail {
  const label = CRITERION_LABELS.budget
  const price = property.price
  const bounds = getBudgetToleranceBounds(criteria)

  if (!bounds) {
    return { criterion: label, status: 'match', message: 'Budget — non renseigné' }
  }

  const refForMessage =
    criteria.budgetMax ?? criteria.budgetMin ?? (bounds.low + bounds.high) / 2

  if (price < bounds.low) {
    const under = Math.round(((refForMessage - price) / refForMessage) * 100)
    return {
      criterion: label,
      status: 'miss',
      message: `Trop en dessous du budget (−${under} %, max. ${Math.round(BUDGET_TOLERANCE_RATIO * 100)} % accepté)`,
    }
  }

  if (price > bounds.high) {
    const over = Math.round(((price - refForMessage) / refForMessage) * 100)
    return {
      criterion: label,
      status: 'miss',
      message: `Trop au-dessus du budget (+${over} %, max. ${Math.round(BUDGET_TOLERANCE_RATIO * 100)} % accepté)`,
    }
  }

  if (criteria.budgetMax !== undefined && price > criteria.budgetMax) {
    const over = Math.round(((price - criteria.budgetMax) / criteria.budgetMax) * 100)
    return { criterion: label, status: 'partial', message: `Au-dessus du budget max (+${over} %, dans la marge)` }
  }

  if (criteria.budgetMin !== undefined && price < criteria.budgetMin) {
    const under = Math.round(((criteria.budgetMin - price) / criteria.budgetMin) * 100)
    return { criterion: label, status: 'partial', message: `Sous le budget min (−${under} %, dans la marge)` }
  }

  return { criterion: label, status: 'match', message: 'Budget ✓' }
}

function matchType(criteria: SearchCriteria, property: Property): MatchDetail {
  const label = CRITERION_LABELS.type
  if (criteria.propertyTypes.length === 0) {
    return { criterion: label, status: 'match', message: 'Type — indifférent' }
  }
  if (propertyMatchesType(criteria.propertyTypes, property)) {
    return { criterion: label, status: 'match', message: `${property.type} ✓` }
  }
  return { criterion: label, status: 'miss', message: `${property.type} — type non recherché` }
}

function matchSurface(criteria: SearchCriteria, property: Property): MatchDetail {
  const label = CRITERION_LABELS.surface
  if (criteria.surfaceMin !== undefined && property.surface < criteria.surfaceMin) {
    return { criterion: label, status: 'miss', message: `${property.surface} m² — trop petit` }
  }
  if (criteria.surfaceMax !== undefined && property.surface > criteria.surfaceMax) {
    return { criterion: label, status: 'partial', message: `${property.surface} m² — au-dessus du max` }
  }
  return { criterion: label, status: 'match', message: `${property.surface} m² ✓` }
}

function matchRooms(criteria: SearchCriteria, property: Property): MatchDetail | null {
  if (criteria.rooms === undefined) return null
  const label = CRITERION_LABELS.rooms
  if (property.rooms >= criteria.rooms) {
    return { criterion: label, status: 'match', message: `${property.rooms} pièce(s) ✓` }
  }
  return {
    criterion: label,
    status: 'miss',
    message: `${property.rooms} pièce(s) — minimum ${criteria.rooms}`,
  }
}

/** Critères structurants : un échec exclut la suggestion, même si le reste correspond. */
function getCriticalFailureMessages(criteria: SearchCriteria, property: Property, details: MatchDetail[]): string[] {
  const failures: string[] = []

  const byLabel = new Map(details.map((d) => [d.criterion, d]))

  if (criteria.propertyTypes.length > 0) {
    const typeDetail = byLabel.get(CRITERION_LABELS.type)
    if (typeDetail?.status === 'miss') failures.push(typeDetail.message)
  }

  const loc = byLabel.get(CRITERION_LABELS.location)
  if (criteria.cities.length > 0 && loc?.status === 'miss') {
    failures.push(loc.message)
  } else if (criteria.districts.length > 0 && property.district && loc?.status === 'miss') {
    failures.push(loc.message)
  }

  const budget = byLabel.get(CRITERION_LABELS.budget)
  if (budget?.status === 'miss') failures.push(budget.message)

  if (criteria.surfaceMin !== undefined || criteria.surfaceMax !== undefined) {
    const surface = byLabel.get(CRITERION_LABELS.surface)
    if (surface?.status === 'miss') failures.push(surface.message)
  }

  if (criteria.rooms !== undefined) {
    const rooms = byLabel.get(CRITERION_LABELS.rooms)
    if (rooms?.status === 'miss') failures.push(rooms.message)
  }

  for (const { key, label } of BOOLEAN_CRITERIA) {
    const level = criteria[key].level
    if (level !== 'required' && level !== 'refused') continue
    const detail = byLabel.get(label)
    if (detail?.status === 'miss') failures.push(detail.message)
  }

  return failures
}

function scoreDetail(detail: MatchDetail, isRequired: boolean): number {
  switch (detail.status) {
    case 'match':
      return 1
    case 'bonus':
      return 0.85
    case 'partial':
      return isRequired ? 0.3 : 0.6
    case 'miss':
      return 0
    default:
      return 0.5
  }
}

function buildMatchDetails(criteria: SearchCriteria, property: Property): MatchDetail[] {
  const details: MatchDetail[] = [
    matchBudget(criteria, property),
    matchLocation(criteria, property),
    matchType(criteria, property),
    matchSurface(criteria, property),
  ]

  const roomsDetail = matchRooms(criteria, property)
  if (roomsDetail) details.push(roomsDetail)

  for (const { key, propertyKey, label } of BOOLEAN_CRITERIA) {
    details.push(evaluateBooleanCriterion(criteria[key], property[propertyKey], label))
  }

  return details
}

export function matchPropertyToSearch(
  property: Property,
  search: Search,
  profile: Profile,
): MatchResult {
  const c = search.criteria
  const details = buildMatchDetails(c, property)
  const criticalFailures = getCriticalFailureMessages(c, property, details)

  const weights: Record<string, number> = {
    Budget: 25,
    Localisation: 22,
    Type: 22,
    Surface: 14,
    Pièces: 12,
    Terrasse: 4,
    Balcon: 2,
    Jardin: 3,
    Parking: 4,
    Garage: 2,
    Cave: 1,
    Ascenseur: 2,
    Vue: 2,
    Travaux: 1,
  }

  let totalWeight = 0
  let earnedWeight = 0

  for (const detail of details) {
    const weight = weights[detail.criterion] ?? 2
    const isRequired = detail.status === 'miss' && detail.message.includes('obligatoire')
    totalWeight += weight
    earnedWeight += scoreDetail(detail, isRequired) * weight
  }

  let score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0

  if (criticalFailures.length > 0) {
    score = 0
    details.unshift({
      criterion: 'Critères essentiels',
      status: 'miss',
      message: criticalFailures[0],
    })
  }

  return {
    profileId: profile.id,
    searchId: search.id,
    profile,
    search,
    score,
    details: details.filter((d) => d.status !== 'match' || !d.message.includes('indifférent')),
  }
}

export function matchPropertyToAllSearches(
  property: Property,
  searches: Search[],
  profiles: Profile[],
): MatchResult[] {
  const profileMap = new Map(profiles.map((p) => [p.id, p]))

  return searches
    .filter((s) => s.active)
    .map((search) => {
      const profile = profileMap.get(search.profileId)
      if (!profile) return null
      return matchPropertyToSearch(property, search, profile)
    })
    .filter((m): m is MatchResult => m !== null && m.score >= MIN_PROPERTY_MATCH_SCORE)
    .sort((a, b) => b.score - a.score)
}
