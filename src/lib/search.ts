import { popularCardIds, tarotCards, type Suit, type TarotCard } from '../data/cards'

export type CardFilter = 'all' | 'major' | Suit

export type SearchResult = {
  card: TarotCard
  score: number
  reason: 'exact' | 'number' | 'keyword' | 'fuzzy' | 'popular'
}

export const filters: Array<{ id: CardFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'major', label: 'Mayores' },
  { id: 'cups', label: 'Copas' },
  { id: 'swords', label: 'Espadas' },
  { id: 'wands', label: 'Bastos' },
  { id: 'pentacles', label: 'Oros' },
]

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function filterCards(cards: TarotCard[], filter: CardFilter) {
  if (filter === 'all') return cards
  if (filter === 'major') return cards.filter((card) => card.arcana === 'major')
  return cards.filter((card) => card.suit === filter)
}

export function searchCards(query: string, filter: CardFilter = 'all', limit = 12): SearchResult[] {
  const source = filterCards(tarotCards, filter)
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return source
      .slice()
      .sort((a, b) => a.popularityRank - b.popularityRank)
      .slice(0, limit)
      .map((card) => ({ card, score: 1, reason: 'popular' }))
  }

  const queryTokens = normalizedQuery.split(' ')
  const scored = source
    .map((card) => scoreCard(card, normalizedQuery, queryTokens))
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.card.popularityRank - b.card.popularityRank)

  return scored.slice(0, limit)
}

export function getPopularCards(limit = 7) {
  return popularCardIds
    .map((id) => tarotCards.find((card) => card.id === id))
    .filter((card): card is TarotCard => Boolean(card))
    .slice(0, limit)
}

function scoreCard(card: TarotCard, query: string, queryTokens: string[]): SearchResult | null {
  const normalizedAliases = card.aliases.map(normalizeText)
  const normalizedNameEs = normalizeText(card.nameEs)
  const normalizedNameEn = normalizeText(card.nameEn)
  const normalizedKeywords = [...card.keywordsUpright, ...card.keywordsReversed].map(normalizeText)
  const numberValues = [card.number, card.roman]
    .filter((value): value is number | string => value !== undefined)
    .flatMap((value) => [normalizeText(String(value)), normalizeText(`arcano ${value}`)])
  const rankSuitValues = [
    card.number && card.suitEs ? `${card.number} ${card.suitEs}` : '',
    card.number && card.suitEs ? `${card.number} de ${card.suitEs}` : '',
    card.number && card.suitEn ? `${card.number} ${card.suitEn}` : '',
    card.rankEs && card.suitEs ? `${card.rankEs} ${card.suitEs}` : '',
    card.rankEs && card.suitEs ? `${card.rankEs} de ${card.suitEs}` : '',
    card.rankEn && card.suitEn ? `${card.rankEn} ${card.suitEn}` : '',
    card.rankEn && card.suitEn ? `${card.rankEn} of ${card.suitEn}` : '',
  ]
    .filter(Boolean)
    .map(normalizeText)

  let score = 0
  let reason: SearchResult['reason'] = 'keyword'

  if (normalizedNameEs === query || normalizedNameEn === query || normalizedAliases.includes(query)) {
    score += 1200
    reason = 'exact'
  }

  if (numberValues.includes(query) || rankSuitValues.includes(query)) {
    score += 1050
    reason = 'number'
  }

  if (normalizedNameEs.startsWith(query) || normalizedNameEn.startsWith(query)) {
    score += 850
    reason = 'exact'
  }

  if (normalizedAliases.some((alias) => alias.startsWith(query))) {
    score += 780
    reason = 'exact'
  }

  if (rankSuitValues.some((value) => value.includes(query))) {
    score += 700
    reason = 'number'
  }

  const keywordHits = normalizedKeywords.filter((keyword) => keyword.includes(query) || query.includes(keyword)).length
  if (keywordHits > 0) {
    score += keywordHits * 180
    reason = score > 900 ? reason : 'keyword'
  }

  const searchBlob = normalizeText(
    [
      card.nameEs,
      card.nameEn,
      ...card.aliases,
      ...card.keywordsUpright,
      ...card.keywordsReversed,
      card.oneLineUpright,
      card.oneLineReversed,
      card.quickUpright,
      card.quickReversed,
      card.loveUpright,
      card.workUpright,
      card.moneyUpright,
      card.adviceUpright,
      card.suitEs ?? '',
      card.suitEn ?? '',
      card.rankEs ?? '',
      card.rankEn ?? '',
    ].join(' '),
  )

  const tokenHits = queryTokens.filter((token) => searchBlob.includes(token)).length
  if (tokenHits === queryTokens.length) score += 120 + tokenHits * 35
  else if (tokenHits > 0) score += tokenHits * 25

  if (query.length >= 4) {
    const fuzzyScore = bestFuzzyScore(query, [...normalizedAliases, normalizedNameEs, normalizedNameEn])
    if (fuzzyScore > 0) {
      score += fuzzyScore
      reason = score > 900 ? reason : 'fuzzy'
    }
  }

  if (score <= 0) return null
  return { card, score, reason }
}

function bestFuzzyScore(query: string, aliases: string[]) {
  return aliases.reduce((best, alias) => {
    if (!alias || Math.abs(alias.length - query.length) > 5) return best
    const distance = levenshtein(query, alias)
    const tolerance = Math.min(3, Math.max(1, Math.floor(alias.length * 0.25)))
    if (distance > tolerance) return best
    return Math.max(best, 420 - distance * 90)
  }, 0)
}

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row])

  for (let column = 0; column <= a.length; column += 1) {
    matrix[0][column] = column
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      matrix[row][column] =
        b.charAt(row - 1) === a.charAt(column - 1)
          ? matrix[row - 1][column - 1]
          : Math.min(matrix[row - 1][column - 1] + 1, matrix[row][column - 1] + 1, matrix[row - 1][column] + 1)
    }
  }

  return matrix[b.length][a.length]
}
