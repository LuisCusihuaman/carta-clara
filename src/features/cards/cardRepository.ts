import type { CardDetail, CardId, CardSummary } from "@/data/cardTypes";

export interface CardRepository {
  getSummaries(): Promise<CardSummary[]>;
  getSummary(cardId: CardId): CardSummary | undefined;
  getDetail(cardId: CardId): Promise<CardDetail>;
  preloadDetail(cardId: CardId): void;
}

export class StaticCardRepository implements CardRepository {
  private summariesById = new Map<CardId, CardSummary>();
  private detailCache = new Map<CardId, Promise<CardDetail>>();

  async getSummaries() {
    const response = await fetch("/data/cards.summary.v1.json");
    const summaries = (await response.json()) as CardSummary[];
    summaries.forEach((card) => this.summariesById.set(card.id, card));
    return summaries;
  }

  getSummary(cardId: CardId) {
    return this.summariesById.get(cardId);
  }

  getDetail(cardId: CardId) {
    if (!this.detailCache.has(cardId)) {
      this.detailCache.set(cardId, fetch(`/data/cards.detail/${cardId}.v1.json`).then((response) => response.json() as Promise<CardDetail>));
    }
    return this.detailCache.get(cardId)!;
  }

  preloadDetail(cardId: CardId) {
    void this.getDetail(cardId);
  }
}

export const cardRepository = new StaticCardRepository();
