import type { CriterionValue, MatchDetail, MatchResult, Profile, Property, Search, SearchCriteria } from '../types'

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
  const cityMatch = criteria.cities.length === 0 ||
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
    return { criterion: label, status: 'partial', message: `${property.district} — arrondissement différent` }
  }

  return { criterion: label, status: 'match', message: `${property.city} ✓` }
}

function matchBudget(criteria: SearchCriteria, property: Property): MatchDetail {
  const label = CRITERION_LABELS.budget
  const price = property.price

  if (criteria.budgetMax !== undefined && price > criteria.budgetMax) {
    const over = Math.round(((price - criteria.budgetMax) / criteria.budgetMax) * 100)
    if (over <= 5) {
      return { criterion: label, status: 'partial', message: `Légèrement au-dessus (+${over}%)` }
    }
    return { criterion: label, status: 'miss', message: `Hors budget (${price.toLocaleString('fr-FR')} €)` }
  }
  if (criteria.budgetMin !== undefined && price < criteria.budgetMin) {
    return { criterion: label, status: 'partial', message: 'En dessous du budget min' }
  }
  return { criterion: label, status: 'match', message: 'Budget ✓' }
}

function matchType(criteria: SearchCriteria, property: Property): MatchDetail {
  const label = CRITERION_LABELS.type
  if (criteria.propertyTypes.length === 0) {
    return { criterion: label, status: 'match', message: 'Type — indifférent' }
  }
  const match = criteria.propertyTypes.some((t) =>
    property.type.toLowerCase() === t.toLowerCase() ||
    (t === 'T5+' && property.rooms >= 5)
  )
  if (match) {
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

function scoreDetail(detail: MatchDetail, isRequired: boolean): number {
  switch (detail.status) {
    case 'match': return 1
    case 'bonus': return 0.85
    case 'partial': return isRequired ? 0.3 : 0.6
    case 'miss': return 0
    default: return 0.5
  }
}

export function matchPropertyToSearch(
  property: Property,
  search: Search,
  profile: Profile,
): MatchResult {
  const c = search.criteria
  const details: MatchDetail[] = [
    matchBudget(c, property),
    matchLocation(c, property),
    matchType(c, property),
    matchSurface(c, property),
    evaluateBooleanCriterion(c.terrace, property.terrace, CRITERION_LABELS.terrace),
    evaluateBooleanCriterion(c.balcony, property.balcony, CRITERION_LABELS.balcony),
    evaluateBooleanCriterion(c.garden, property.garden, CRITERION_LABELS.garden),
    evaluateBooleanCriterion(c.parking, property.parking, CRITERION_LABELS.parking),
    evaluateBooleanCriterion(c.garage, property.garage, CRITERION_LABELS.garage),
    evaluateBooleanCriterion(c.cave, property.cave, CRITERION_LABELS.cave),
    evaluateBooleanCriterion(c.elevator, property.elevator, CRITERION_LABELS.elevator),
    evaluateBooleanCriterion(c.view, property.view, CRITERION_LABELS.view),
    evaluateBooleanCriterion(c.works, property.works, CRITERION_LABELS.works),
  ]

  const weights: Record<string, number> = {
    Budget: 25,
    Localisation: 20,
    Type: 15,
    Surface: 15,
    Terrasse: 5,
    Balcon: 3,
    Jardin: 4,
    Parking: 5,
    Garage: 3,
    Cave: 2,
    Ascenseur: 2,
    Vue: 3,
    Travaux: 2,
  }

  let totalWeight = 0
  let earnedWeight = 0

  for (const detail of details) {
    const weight = weights[detail.criterion] ?? 3
    const isRequired = detail.status === 'miss' && detail.message.includes('obligatoire')
    totalWeight += weight
    earnedWeight += scoreDetail(detail, isRequired) * weight
  }

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0

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
    .filter((m): m is MatchResult => m !== null && m.score >= 50)
    .sort((a, b) => b.score - a.score)
}
