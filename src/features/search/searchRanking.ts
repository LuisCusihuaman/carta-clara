import type { CardId } from "@/data/cardTypes";

export type RankedSearchResult = {
  id: CardId;
  score: number;
  reason: "exact" | "alias" | "number" | "suit" | "keyword" | "fuzzy";
};

const reasonBoost: Record<RankedSearchResult["reason"], number> = {
  exact: 10,
  alias: 9,
  number: 8,
  suit: 7,
  keyword: 6,
  fuzzy: 2
};

export function mergeAndRankResults(results: RankedSearchResult[]) {
  const bestById = new Map<CardId, RankedSearchResult>();
  for (const result of results) {
    const boosted = { ...result, score: result.score + reasonBoost[result.reason] };
    const current = bestById.get(result.id);
    if (!current || boosted.score > current.score) bestById.set(result.id, boosted);
  }
  return [...bestById.values()].sort((left, right) => right.score - left.score);
}
