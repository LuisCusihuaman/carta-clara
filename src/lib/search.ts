import MiniSearch, { type SearchResult as MiniSearchResult } from 'minisearch'
import { popularCardIds, tarotCards, type Suit, type TarotCard } from '../data/cards'

export type CardFilter = 'all' | 'major' | Suit

export type SearchResult = {
  card: TarotCard
  score: number
  reason: 'exact' | 'number' | 'keyword' | 'fuzzy' | 'popular'
}

type SearchDocument = TarotCard & {
  numberText: string
  suitText: string
  rankText: string
  keywords: string
  contexts: string
}

export const filters: Array<{ id: CardFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'major', label: 'Mayores' },
  { id: 'cups', label: 'Copas' },
  { id: 'swords', label: 'Espadas' },
  { id: 'wands', label: 'Bastos' },
  { id: 'pentacles', label: 'Oros' },
]

let miniSearch: MiniSearch<SearchDocument> | null = null
let searchDocuments: SearchDocument[] | null = null

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
  const sourceIds = new Set(source.map((card) => card.id))
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return source
      .slice()
      .sort((a, b) => a.popularityRank - b.popularityRank)
      .slice(0, limit)
      .map((card) => ({ card, score: 1, reason: 'popular' }))
  }

  const exactResults = source
    .map((card) => scoreExact(card, normalizedQuery))
    .filter((result): result is SearchResult => result !== null)

  const miniResults = getMiniSearch()
    .search(normalizedQuery, {
      prefix: true,
      fuzzy: 0.25,
      boost: SEARCH_BOOSTS,
    })
    .map((result) => toSearchResult(result))
    .filter((result): result is SearchResult => Boolean(result))
    .filter((result) => sourceIds.has(result.card.id))

  return mergeResults([...exactResults, ...miniResults]).slice(0, limit)
}

export function getPopularCards(limit = 7) {
  return popularCardIds
    .map((id) => tarotCards.find((card) => card.id === id))
    .filter((card): card is TarotCard => Boolean(card))
    .slice(0, limit)
}

const SEARCH_BOOSTS = {
  nameEs: 10,
  nameEn: 10,
  aliases: 9,
  roman: 8,
  numberText: 8,
  rankText: 8,
  suitText: 7,
  keywords: 6,
  keywordsUpright: 6,
  keywordsReversed: 6,
  oneLineUpright: 4,
  oneLineReversed: 4,
  quickUpright: 2,
  quickReversed: 2,
  contexts: 1,
}

function getMiniSearch() {
  if (miniSearch) return miniSearch

  miniSearch = new MiniSearch<SearchDocument>({
    fields: [
      'nameEs',
      'nameEn',
      'aliases',
      'roman',
      'numberText',
      'suitText',
      'rankText',
      'keywords',
      'keywordsUpright',
      'keywordsReversed',
      'oneLineUpright',
      'oneLineReversed',
      'quickUpright',
      'quickReversed',
      'contexts',
    ],
    storeFields: ['id'],
    searchOptions: {
      boost: SEARCH_BOOSTS,
      prefix: true,
      fuzzy: 0.25,
    },
    processTerm: (term) => normalizeText(term),
  })

  miniSearch.addAll(getSearchDocuments())
  return miniSearch
}

function getSearchDocuments() {
  if (searchDocuments) return searchDocuments

  searchDocuments = tarotCards.map((card) => ({
    ...card,
    aliases: card.aliases.map(normalizeText),
    numberText: [card.number, card.roman]
      .filter((value): value is number | string => value !== undefined)
      .flatMap((value) => [String(value), `arcano ${value}`])
      .map(normalizeText)
      .join(' '),
    suitText: [card.suitEs, card.suitEn].filter(Boolean).map(String).map(normalizeText).join(' '),
    rankText: [
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
      .join(' '),
    keywords: [...card.keywordsUpright, ...card.keywordsReversed].map(normalizeText).join(' '),
    contexts: [
      card.loveUpright,
      card.loveReversed,
      card.workUpright,
      card.workReversed,
      card.moneyUpright,
      card.moneyReversed,
      card.adviceUpright,
      card.adviceReversed,
      card.yesNo,
    ]
      .map(normalizeText)
      .join(' '),
  }))

  return searchDocuments
}

function scoreExact(card: TarotCard, query: string): SearchResult | null {
  const aliases = card.aliases.map(normalizeText)
  const names = [card.nameEs, card.nameEn, card.shortName].map(normalizeText)
  const numberValues = [card.number, card.roman]
    .filter((value): value is number | string => value !== undefined)
    .flatMap((value) => [String(value), `arcano ${value}`])
    .map(normalizeText)
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

  if ([...names, ...aliases].includes(query)) {
    return { card, score: 12000, reason: 'exact' }
  }

  if ([...numberValues, ...rankSuitValues].includes(query)) {
    return { card, score: 10500, reason: 'number' }
  }

  if ([...names, ...aliases].some((value) => value.startsWith(query))) {
    return { card, score: 8500, reason: 'exact' }
  }

  if (rankSuitValues.some((value) => value.includes(query))) {
    return { card, score: 7000, reason: 'number' }
  }

  return null
}

function toSearchResult(result: MiniSearchResult): SearchResult | null {
  const card = tarotCards.find((item) => item.id === result.id)
  if (!card) return null

  const reason = result.terms?.some((term) => card.keywordsUpright.concat(card.keywordsReversed).map(normalizeText).includes(term))
    ? 'keyword'
    : 'fuzzy'

  return {
    card,
    score: result.score * 100,
    reason,
  }
}

function mergeResults(results: SearchResult[]) {
  const merged = new Map<string, SearchResult>()

  for (const result of results) {
    const existing = merged.get(result.card.id)
    if (!existing || result.score > existing.score) {
      merged.set(result.card.id, result)
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.score - a.score || a.card.popularityRank - b.card.popularityRank)
}
