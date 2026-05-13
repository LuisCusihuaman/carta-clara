import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CardSummary, SearchDoc } from "@/data/cardTypes";
import { buildSearchLookup, createMiniSearch, searchCards } from "@features/search/searchEngine";
import { normalizeQuery } from "@features/search/searchNormalize";

const summaries = JSON.parse(readFileSync(join(process.cwd(), "public/data/cards.summary.v1.json"), "utf8")) as CardSummary[];
const docs = JSON.parse(readFileSync(join(process.cwd(), "public/data/cards.search-docs.v1.json"), "utf8")) as SearchDoc[];
const lookup = buildSearchLookup(summaries, docs);
const miniSearch = createMiniSearch(docs);

const cases = [
  ["luna", "the_moon"],
  ["moon", "the_moon"],
  ["the moon", "the_moon"],
  ["18", "the_moon"],
  ["xviii", "the_moon"],
  ["empratriz", "the_empress"],
  ["emperatris", "the_empress"],
  ["3 espadas", "three_of_swords"],
  ["three swords", "three_of_swords"],
  ["ruptura", "three_of_swords"]
] as const;

describe("search regression fixtures", () => {
  it.each(cases)("finds %s", (query, expected) => {
    const normalized = normalizeQuery(query).normalized;
    const results = searchCards(normalized, lookup, miniSearch);
    const ids = results.slice(0, 3).map((result) => result.id);
    expect(ids).toContain(expected);
  });
});

describe("search performance budget", () => {
  it("responds within 100ms for fixture queries", () => {
    const started = performance.now();
    for (const [query] of cases) {
      searchCards(normalizeQuery(query).normalized, lookup, miniSearch);
    }
    expect(performance.now() - started).toBeLessThan(100);
  });
});
