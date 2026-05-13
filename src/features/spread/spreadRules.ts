import type { CardDetail, Orientation } from "@/data/cardTypes";

export type SpreadCard = {
  cardId: string;
  orientation: Orientation;
};

export type SpreadSummary = {
  headline: string;
  repeatedThemes: string[];
  cardLines: Array<{ cardId: string; text: string }>;
  advice: string;
};

export function summarizeSpread(cards: SpreadCard[], details: CardDetail[]): SpreadSummary {
  const byId = new Map(details.map((detail) => [detail.id, detail]));
  const cardLines = cards.map((card) => {
    const detail = byId.get(card.cardId);
    return {
      cardId: card.cardId,
      text: card.orientation === "upright" ? detail?.oneLineUpright ?? "" : detail?.oneLineReversed ?? ""
    };
  });
  const repeatedThemes = findRepeatedThemes(cards, details);
  return {
    headline: repeatedThemes.length > 0 ? `Estas cartas tocan: ${repeatedThemes.join(", ")}.` : "Resumen simple de las cartas seleccionadas.",
    repeatedThemes,
    cardLines,
    advice: cards.map((card) => {
      const detail = byId.get(card.cardId);
      return card.orientation === "upright" ? detail?.adviceUpright : detail?.adviceReversed;
    }).filter(Boolean).join(" ")
  };
}

function findRepeatedThemes(cards: SpreadCard[], details: CardDetail[]) {
  const byId = new Map(details.map((detail) => [detail.id, detail]));
  const counts = new Map<string, number>();
  cards.forEach((card) => {
    const detail = byId.get(card.cardId);
    const keywords = card.orientation === "upright" ? detail?.keywordsUpright : detail?.keywordsReversed;
    keywords?.forEach((keyword) => counts.set(keyword, (counts.get(keyword) ?? 0) + 1));
  });
  return [...counts.entries()].filter(([, count]) => count > 1).map(([keyword]) => keyword);
}
