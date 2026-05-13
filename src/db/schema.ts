import type { CardId, Orientation } from "@/data/cardTypes";

export type ViewSource = "search" | "photo" | "grid" | "related" | "saved";

export type UserFavorite = {
  cardId: CardId;
  createdAt: number;
  note?: string;
};

export type RecentCard = {
  cardId: CardId;
  viewedAt: number;
  source: ViewSource;
};

export type LearningState = {
  cardId: CardId;
  status: "unknown" | "review" | "learned";
  updatedAt: number;
};

export type CurrentSpread = {
  id: string;
  cards: Array<{
    cardId: CardId;
    orientation: Orientation | "unknown";
    source: "search" | "photo";
    confidence?: number;
  }>;
  createdAt: number;
  updatedAt: number;
};
