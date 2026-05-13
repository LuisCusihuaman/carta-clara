import MiniSearch from "minisearch";
import type { CardId, CardSummary, SearchDoc } from "@/data/cardTypes";
import { normalizeText } from "@/lib/normalize";
import { mergeAndRankResults, type RankedSearchResult } from "@features/search/searchRanking";

export type SearchLookup = {
  byId: Map<CardId, CardSummary>;
  bySlug: Map<string, CardId>;
  byAlias: Map<string, CardId[]>;
  byNumber: Map<string, CardId[]>;
  bySuit: Map<string, CardId[]>;
};

export function buildSearchLookup(summaries: CardSummary[], docs: SearchDoc[]): SearchLookup {
  const byId = new Map<CardId, CardSummary>();
  const bySlug = new Map<string, CardId>();
  const byAlias = new Map<string, CardId[]>();
  const byNumber = new Map<string, CardId[]>();
  const bySuit = new Map<string, CardId[]>();

  summaries.forEach((summary) => {
    byId.set(summary.id, summary);
    bySlug.set(summary.slug, summary.id);
    if (summary.number !== undefined) byNumber.set(String(summary.number), [...(byNumber.get(String(summary.number)) ?? []), summary.id]);
    if (summary.roman) byNumber.set(normalizeText(summary.roman), [...(byNumber.get(normalizeText(summary.roman)) ?? []), summary.id]);
    if (summary.suit) bySuit.set(summary.suit, [...(bySuit.get(summary.suit) ?? []), summary.id]);
  });

  docs.forEach((doc) => {
    [doc.nameEs, doc.nameEn, ...doc.aliases].forEach((alias) => {
      const normalized = normalizeText(alias);
      byAlias.set(normalized, [...(byAlias.get(normalized) ?? []), doc.id]);
    });
  });

  return { byId, bySlug, byAlias, byNumber, bySuit };
}

export function createMiniSearch(docs: SearchDoc[]) {
  const miniSearch = new MiniSearch<SearchDoc>({
    fields: ["nameEs", "nameEn", "aliases", "numberText", "suitText", "rankText", "keywords", "oneLine", "quick", "contexts"],
    storeFields: ["id"],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: { nameEs: 10, nameEn: 10, aliases: 9, numberText: 8, rankText: 8, suitText: 7, keywords: 6, oneLine: 4, quick: 2, contexts: 1 }
    }
  });
  miniSearch.addAll(docs);
  return miniSearch;
}

export function searchExact(query: string, lookup: SearchLookup) {
  const results: RankedSearchResult[] = [];
  const aliasMatches = lookup.byAlias.get(query) ?? [];
  aliasMatches.forEach((id) => results.push({ id, score: 100, reason: "alias" }));
  const numberMatches = lookup.byNumber.get(query) ?? [];
  numberMatches.forEach((id) => results.push({ id, score: 90, reason: "number" }));
  const suitMatches = lookup.bySuit.get(query) ?? [];
  suitMatches.forEach((id) => results.push({ id, score: 40, reason: "suit" }));
  return mergeAndRankResults(results);
}

export function searchCards(query: string, lookup: SearchLookup, miniSearch: MiniSearch<SearchDoc>) {
  const normalized = normalizeText(query);
  if (!normalized) return [];
  const terms = expandSearchTerms(normalized);
  const exact = terms.flatMap((term) => searchExact(term, lookup));
  const fuzzy = terms.flatMap((term) => miniSearch.search(term).map((result) => ({
    id: result.id as CardId,
    score: result.score,
    reason: "fuzzy" as const
  })));
  return mergeAndRankResults([...exact, ...fuzzy]);
}

function expandSearchTerms(query: string) {
  const rankMap = new Map([
    ["1", ["ace", "as"]], ["2", ["two", "dos"]], ["3", ["three", "tres"]], ["4", ["four", "cuatro"]], ["5", ["five", "cinco"]],
    ["6", ["six", "seis"]], ["7", ["seven", "siete"]], ["8", ["eight", "ocho"]], ["9", ["nine", "nueve"]], ["10", ["ten", "diez"]]
  ]);
  const suitMap = new Map([
    ["copas", ["cups", "copas"]], ["espadas", ["swords", "espadas"]], ["bastos", ["wands", "bastos"]], ["oros", ["pentacles", "oros"]]
  ]);
  const terms = new Set([query]);
  const [rank, suit] = query.split(" ");
  const ranks = rankMap.get(rank);
  const suits = suitMap.get(suit);
  if (ranks && suits) {
    for (const nextRank of ranks) {
      for (const nextSuit of suits) {
        terms.add(`${nextRank} ${nextSuit}`);
        terms.add(`${nextRank} of ${nextSuit}`);
        terms.add(`${nextRank} de ${nextSuit}`);
      }
    }
  }
  return [...terms];
}
