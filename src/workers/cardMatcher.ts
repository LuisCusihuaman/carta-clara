import type { CardId } from "@/data/cardTypes";

export type VisionScore = {
  cardId: CardId;
  orientation: "upright" | "reversed" | "unknown";
  confidence: number;
  signals: {
    orbGoodMatches: number;
    orbDistanceAvg: number;
    hashDistance: number;
    templateScore?: number;
    rectangleQuality: number;
  };
};

export type VisionDeckManifest = {
  deckId: string;
  deckName: string;
  version: string;
  cardAspectRatio: number;
  cards: Array<{ cardId: CardId; template: string; descriptor?: string; hash: string }>;
};

export function rankVisionScores(scores: VisionScore[]) {
  return [...scores].sort((a, b) => b.confidence - a.confidence);
}

export async function loadVisionManifest(deckId = "rws-v1") {
  const response = await fetch(`/vision/${deckId}/manifest.json`);
  return response.json() as Promise<VisionDeckManifest>;
}

export function scoreTemplateMatch(cardId: CardId, signals: VisionScore["signals"]): VisionScore {
  const orbScore = Math.min(1, signals.orbGoodMatches / 60);
  const hashScore = Math.max(0, 1 - signals.hashDistance / 64);
  const templateScore = signals.templateScore ?? 0;
  const confidence = Math.max(0, Math.min(1, (orbScore * 0.4) + (hashScore * 0.25) + (templateScore * 0.25) + (signals.rectangleQuality * 0.1)));
  return { cardId, orientation: "unknown", confidence, signals };
}
