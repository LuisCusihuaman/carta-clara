import MiniSearch from "minisearch";
import { join } from "node:path";
import type { CardDetail, CardSummary, SearchDoc } from "../src/data/cardTypes";
import { generatedManifest } from "../src/data/generatedManifest";
import { publicDataRoot, readCardSources, validateCardSet, writeJson } from "./content-utils";

const cards = await readCardSources();
const errors = validateCardSet(cards);
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const summaries: CardSummary[] = cards.map((card, index) => ({
  id: card.id,
  slug: card.slug,
  nameEs: card.name.es,
  nameEn: card.name.en,
  shortName: card.name.short,
  arcana: card.taxonomy.arcana,
  suit: card.taxonomy.suit,
  rank: card.taxonomy.rank,
  number: card.taxonomy.number,
  roman: card.taxonomy.roman,
  thumbnail: card.media.thumbnail,
  keywordsUpright: card.meaning.upright.keywords,
  keywordsReversed: card.meaning.reversed.keywords,
  oneLineUpright: card.meaning.upright.oneLine,
  oneLineReversed: card.meaning.reversed.oneLine,
  popularityRank: index + 1
}));

const searchDocs: SearchDoc[] = cards.map((card) => ({
  id: card.id,
  nameEs: card.name.es,
  nameEn: card.name.en,
  aliases: card.search.aliases,
  numberText: [card.taxonomy.number, card.taxonomy.roman].filter(Boolean).map(String),
  suitText: [card.taxonomy.suit].filter(Boolean) as string[],
  rankText: [card.taxonomy.rank].filter(Boolean) as string[],
  keywords: card.search.keywords,
  oneLine: [card.meaning.upright.oneLine, card.meaning.reversed.oneLine],
  quick: [card.meaning.upright.quick, card.meaning.reversed.quick],
  contexts: [card.meaning.upright.love, card.meaning.upright.work, card.meaning.upright.money, card.meaning.upright.advice, card.meaning.reversed.love, card.meaning.reversed.work, card.meaning.reversed.money, card.meaning.reversed.advice]
}));

const index = new MiniSearch<SearchDoc>({
  fields: ["nameEs", "nameEn", "aliases", "numberText", "suitText", "rankText", "keywords", "oneLine", "quick", "contexts"],
  storeFields: ["id"]
});
index.addAll(searchDocs);

await writeJson(join(publicDataRoot, "cards.summary.v1.json"), summaries);
await writeJson(join(publicDataRoot, "cards.search-docs.v1.json"), searchDocs);
await writeJson(join(publicDataRoot, "cards.search-index.v1.json"), index.toJSON());
await writeJson(join(publicDataRoot, "manifest.json"), generatedManifest);

for (const card of cards) {
  const summary = summaries.find((item) => item.id === card.id)!;
  const detail: CardDetail = {
    ...summary,
    quickUpright: card.meaning.upright.quick,
    quickReversed: card.meaning.reversed.quick,
    loveUpright: card.meaning.upright.love,
    loveReversed: card.meaning.reversed.love,
    workUpright: card.meaning.upright.work,
    workReversed: card.meaning.reversed.work,
    moneyUpright: card.meaning.upright.money,
    moneyReversed: card.meaning.reversed.money,
    adviceUpright: card.meaning.upright.advice,
    adviceReversed: card.meaning.reversed.advice,
    yesNo: card.meaning.upright.yesNo,
    relatedCards: card.related,
    fullImage: card.media.full
  };
  await writeJson(join(publicDataRoot, "cards.detail", `${card.id}.v1.json`), detail);
}

console.log(`Generated runtime data for ${cards.length} cards.`);
