import MiniSearch, { type SearchResult as MiniSearchResult } from "minisearch";
import {
  popularCardIds,
  tarotCards,
  type Suit,
  type TarotCard,
} from "../data/cards";

export type CardFilter = "all" | "major" | Suit;

export type SearchResult = {
  card: TarotCard;
  score: number;
  reason: "exact" | "number" | "keyword" | "fuzzy" | "popular";
};

type SearchableValue = string | number | null | undefined | false;

type SearchRecord = {
  card: TarotCard;
  names: string[];
  numbers: string[];
  rankSuits: string[];
  keywordTerms: Set<string>;
};

type SearchState = {
  index: MiniSearch<TarotCard>;
  cardById: Map<TarotCard["id"], TarotCard>;
  recordById: Map<TarotCard["id"], SearchRecord>;
  cardsByPopularity: TarotCard[];
  popularCards: TarotCard[];
};

export const filters: Array<{ id: CardFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "major", label: "Mayores" },
  { id: "cups", label: "Copas" },
  { id: "swords", label: "Espadas" },
  { id: "wands", label: "Bastos" },
  { id: "pentacles", label: "Oros" },
];

const SEARCH_FIELDS = [
  "nameEs",
  "nameEn",
  "aliases",
  "roman",
  "numberText",
  "suitText",
  "rankText",
  "keywords",
  "keywordsUpright",
  "keywordsReversed",
  "oneLineUpright",
  "oneLineReversed",
  "quickUpright",
  "quickReversed",
  "contexts",
] as const;

type SearchField = (typeof SEARCH_FIELDS)[number];

const SEARCH_BOOSTS = {
  nameEs: 10,
  nameEn: 10,
  aliases: 9,
  roman: 3,
  numberText: 8,
  rankText: 10,
  suitText: 7,
  keywords: 6,
  keywordsUpright: 6,
  keywordsReversed: 6,
  oneLineUpright: 4,
  oneLineReversed: 4,
  quickUpright: 2,
  quickReversed: 2,
  contexts: 1,
} satisfies Partial<Record<SearchField, number>>;

const SCORES = {
  exactRankSuit: 1_000_000,
  exactName: 900_000,
  exactNumber: 800_000,
  prefixName: 700_000,
  partialRankSuit: 600_000,
  miniSearchMultiplier: 100,
} as const;

const FUZZY_MIN_LENGTH = 4;

let state: SearchState | null = null;

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function filterCards(cards: TarotCard[], filter: CardFilter) {
  return cards.filter((card) => matchesFilter(card, filter));
}

export function searchCards(
  query: string,
  filter: CardFilter = "all",
  limit = 12,
): SearchResult[] {
  const searchState = getSearchState();
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return searchState.cardsByPopularity
      .filter((card) => matchesFilter(card, filter))
      .slice(0, limit)
      .map((card) => ({
        card,
        score: 1,
        reason: "popular",
      }));
  }

  return searchState.index
    .search(normalizedQuery, {
      boost: SEARCH_BOOSTS,
      prefix: (term) => term.length > 1,
      fuzzy: (term) => (term.length >= FUZZY_MIN_LENGTH ? 0.25 : false),
      filter: ({ id }) => {
        const card = searchState.cardById.get(id as TarotCard["id"]);
        return Boolean(card && matchesFilter(card, filter));
      },
    })
    .map((result) => toSearchResult(searchState, result, normalizedQuery))
    .filter(isSearchResult)
    .sort(bySearchRank)
    .slice(0, limit);
}

export function getPopularCards(limit = 7) {
  return getSearchState().popularCards.slice(0, limit);
}

function getSearchState(): SearchState {
  if (state) return state;

  const records = tarotCards.map(createSearchRecord);
  const cardById = new Map(tarotCards.map((card) => [card.id, card]));
  const recordById = new Map(records.map((record) => [record.card.id, record]));

  const index = new MiniSearch<TarotCard>({
    idField: "id",
    fields: [...SEARCH_FIELDS],
    storeFields: ["arcana", "suit", "popularityRank"],
    extractField: extractCardField,
    processTerm: normalizeText,
    searchOptions: {
      boost: SEARCH_BOOSTS,
      prefix: (term) => term.length > 1,
      fuzzy: (term) => (term.length >= FUZZY_MIN_LENGTH ? 0.25 : false),
    },
  });

  index.addAll(tarotCards);

  state = {
    index,
    cardById,
    recordById,
    cardsByPopularity: [...tarotCards].sort(byPopularity),
    popularCards: popularCardIds
      .map((id) => cardById.get(id))
      .filter((card): card is TarotCard => Boolean(card)),
  };

  return state;
}

function createSearchRecord(card: TarotCard): SearchRecord {
  const keywords = normalizeValues([
    ...(card.keywordsUpright ?? []),
    ...(card.keywordsReversed ?? []),
  ]);

  return {
    card,
    names: normalizeValues([
      card.nameEs,
      card.nameEn,
      card.shortName,
      ...(card.aliases ?? []),
    ]),
    numbers: normalizeValues(getNumberValues(card)),
    rankSuits: normalizeValues(getRankSuitValues(card)),
    keywordTerms: new Set(keywords.flatMap((keyword) => keyword.split(" "))),
  };
}

function extractCardField(card: TarotCard, field: string) {
  switch (field as SearchField) {
    case "nameEs":
      return card.nameEs;

    case "nameEn":
      return card.nameEn;

    case "aliases":
      return joinText(card.aliases ?? []);

    case "roman":
      return card.roman;

    case "numberText":
      return joinText(getNumberValues(card));

    case "suitText":
      return joinText([card.suitEs, card.suitEn]);

    case "rankText":
      return joinText(getRankSuitValues(card));

    case "keywords":
      return joinText([
        ...(card.keywordsUpright ?? []),
        ...(card.keywordsReversed ?? []),
      ]);

    case "keywordsUpright":
      return joinText(card.keywordsUpright ?? []);

    case "keywordsReversed":
      return joinText(card.keywordsReversed ?? []);

    case "oneLineUpright":
      return card.oneLineUpright;

    case "oneLineReversed":
      return card.oneLineReversed;

    case "quickUpright":
      return card.quickUpright;

    case "quickReversed":
      return card.quickReversed;

    case "contexts":
      return joinText([
        card.loveUpright,
        card.loveReversed,
        card.workUpright,
        card.workReversed,
        card.moneyUpright,
        card.moneyReversed,
        card.adviceUpright,
        card.adviceReversed,
        card.yesNo,
      ]);

    default:
      return readCardValue(card, field);
  }
}

function toSearchResult(
  searchState: SearchState,
  result: MiniSearchResult,
  query: string,
): SearchResult | null {
  const record = searchState.recordById.get(result.id as TarotCard["id"]);
  if (!record) return null;

  const exact = getExactScore(record, query);

  return {
    card: record.card,
    score: exact?.score ?? result.score * SCORES.miniSearchMultiplier,
    reason: exact?.reason ?? getMiniSearchReason(record, result),
  };
}

function getExactScore(
  record: SearchRecord,
  query: string,
): Pick<SearchResult, "score" | "reason"> | null {
  if (record.rankSuits.includes(query)) {
    return { score: SCORES.exactRankSuit, reason: "number" };
  }

  if (record.names.includes(query)) {
    return { score: SCORES.exactName, reason: "exact" };
  }

  if (record.numbers.includes(query)) {
    return { score: SCORES.exactNumber, reason: "number" };
  }

  if (record.names.some((name) => name.startsWith(query))) {
    return { score: SCORES.prefixName, reason: "exact" };
  }

  if (
    shouldUsePartialRankMatch(query) &&
    record.rankSuits.some((rankSuit) => rankSuit.includes(query))
  ) {
    return { score: SCORES.partialRankSuit, reason: "number" };
  }

  return null;
}

function getMiniSearchReason(
  record: SearchRecord,
  result: MiniSearchResult,
): SearchResult["reason"] {
  const terms = result.terms?.map(normalizeText) ?? [];

  return terms.some((term) => record.keywordTerms.has(term))
    ? "keyword"
    : "fuzzy";
}

function matchesFilter(card: TarotCard, filter: CardFilter) {
  if (filter === "all") return true;
  if (filter === "major") return card.arcana === "major";
  return card.suit === filter;
}

function normalizeValues(values: readonly SearchableValue[]) {
  return compact(values)
    .map((value) => normalizeText(String(value)))
    .filter(Boolean);
}

function joinText(values: readonly SearchableValue[]) {
  return compact(values).join(" ");
}

function compact(values: readonly SearchableValue[]) {
  return values.filter(
    (value): value is string | number =>
      value !== null && value !== undefined && value !== false && value !== "",
  );
}

function readCardValue(card: TarotCard, field: string) {
  const value = (card as Record<string, unknown>)[field];

  return typeof value === "string" || typeof value === "number"
    ? value
    : undefined;
}

function getNumberValues(card: TarotCard): string[] {
  if (card.number === undefined || card.number === null) return [];

  const number = String(card.number);
  const roman = card.roman || toRoman(card.number);
  const numberWord = getSpanishNumberWord(card.number);

  if (card.arcana !== "major") {
    return [number, numberWord].filter(Boolean) as string[];
  }

  return [
    number,
    roman,
    `arcano ${number}`,
    `arcano ${roman}`,
    numberWord && `arcano ${numberWord}`,
    card.roman,
  ].filter(Boolean) as string[];
}

function getRankSuitValues(card: TarotCard): string[] {
  if (!card.suitEs && !card.suitEn) return [];

  const ranks = [
    card.number != null && String(card.number),
    card.number != null && toRoman(card.number),
    card.number != null && getSpanishNumberWord(card.number),
    card.rankEs,
    card.rankEn,
  ].filter(Boolean) as string[];

  return [...new Set(ranks)]
    .flatMap((rank) => [
      card.suitEs && `${rank} ${card.suitEs}`,
      card.suitEs && `${rank} de ${card.suitEs}`,
      card.suitEn && `${rank} ${card.suitEn}`,
      card.suitEn && `${rank} of ${card.suitEn}`,
    ])
    .filter(Boolean) as string[];
}

function shouldUsePartialRankMatch(query: string) {
  return query.includes(" ") || query.length >= 3;
}

function byPopularity(a: TarotCard, b: TarotCard) {
  return a.popularityRank - b.popularityRank;
}

function bySearchRank(a: SearchResult, b: SearchResult) {
  return b.score - a.score || byPopularity(a.card, b.card);
}

function isSearchResult(result: SearchResult | null): result is SearchResult {
  return result !== null;
}

function getSpanishNumberWord(value: number) {
  return SPANISH_NUMBER_WORDS[value];
}

const SPANISH_NUMBER_WORDS: Partial<Record<number, string>> = {
  0: "loco",
  1: "as",
  2: "dos",
  3: "tres",
  4: "cuatro",
  5: "cinco",
  6: "seis",
  7: "siete",
  8: "ocho",
  9: "nueve",
  10: "diez",
  11: "once",
  12: "doce",
  13: "trece",
  14: "catorce",
  15: "quince",
  16: "dieciseis",
  17: "diecisiete",
  18: "dieciocho",
  19: "diecinueve",
  20: "veinte",
  21: "veintiuno",
};

function toRoman(value: number) {
  if (value <= 0) return "";

  const numerals: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remaining = value;
  let roman = "";

  for (const [amount, symbol] of numerals) {
    while (remaining >= amount) {
      roman += symbol;
      remaining -= amount;
    }
  }

  return roman;
}
