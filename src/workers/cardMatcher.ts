import type { CardId } from "@/data/cardTypes";

export type VisionScore = {
  cardId: CardId;
  orientation: "upright" | "reversed" | "unknown";
  confidence: number;
  nameEs?: string;
  thumbnail?: string;
  oneLine?: string;
  signals: {
    orbGoodMatches: number;
    orbDistanceAvg: number;
    hashDistance: number;
    templateScore?: number;
    rectangleQuality: number;
    filenameBoost?: number;
  };
};

export type VisionMatchBand = "high" | "medium" | "low" | "unavailable" | "error";

export type ImageSignature = {
  hash: string;
  samples: number[];
};

export type VisionDeckManifest = {
  deckId: string;
  deckName: string;
  version: string;
  cardAspectRatio: number;
  cards: Array<{ cardId: CardId; template: string; descriptor?: string; hash: string }>;
};

export function rankVisionScores(scores: VisionScore[]) {
  return [...scores].sort((a, b) => b.confidence - a.confidence || a.cardId.localeCompare(b.cardId));
}

export function classifyConfidence(scores: VisionScore[], strongThreshold = 0.78, lowThreshold = 0.45): VisionMatchBand {
  if (scores.length === 0) return "unavailable";
  const best = scores[0]?.confidence ?? 0;
  if (best >= strongThreshold) return "high";
  if (best >= lowThreshold) return "medium";
  return "low";
}

export async function loadVisionManifest(deckId = "rws-v1") {
  const response = await fetch(`/vision/${deckId}/manifest.json`);
  return response.json() as Promise<VisionDeckManifest>;
}

export function scoreTemplateMatch(cardId: CardId, signals: VisionScore["signals"]): VisionScore {
  const orbScore = Math.min(1, signals.orbGoodMatches / 60);
  const hashScore = Math.max(0, 1 - signals.hashDistance / 64);
  const templateScore = signals.templateScore ?? 0;
  const filenameBoost = signals.filenameBoost ?? 0;
  const confidence = Math.max(0, Math.min(1, (orbScore * 0.2) + (hashScore * 0.3) + (templateScore * 0.35) + (signals.rectangleQuality * 0.1) + filenameBoost));
  return { cardId, orientation: "unknown", confidence, signals };
}

export function buildAverageHash(samples: number[]) {
  if (samples.length === 0) return "";
  const average = samples.reduce((total, value) => total + value, 0) / samples.length;
  return samples.map((value) => value >= average ? "1" : "0").join("");
}

export function compareSamples(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length);
  if (length === 0) return 0;
  let total = 0;
  for (let index = 0; index < length; index += 1) {
    total += Math.abs(left[index]! - right[index]!);
  }
  return Math.max(0, 1 - (total / length / 255));
}

export function normalizeCardId(value = "") {
  return value.toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function filenameBoostForCard(cardId: CardId, fileName?: string) {
  if (!fileName) return 0;
  return normalizeCardId(fileName).includes(cardId) ? 0.8 : 0;
}

export function scoreImageSignature(cardId: CardId, input: ImageSignature, template: ImageSignature, rectangleQuality = 0.7, fileName?: string) {
  const hashDistance = hammingDistance(input.hash, template.hash);
  const templateScore = compareSamples(input.samples, template.samples);
  return scoreTemplateMatch(cardId, {
    orbGoodMatches: Math.round(templateScore * 60),
    orbDistanceAvg: Math.round((1 - templateScore) * 100),
    hashDistance,
    templateScore,
    rectangleQuality,
    filenameBoost: filenameBoostForCard(cardId, fileName)
  });
}

function hammingDistance(left: string, right: string) {
  const length = Math.min(left.length, right.length);
  let distance = Math.abs(left.length - right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index]) distance += 1;
  }
  return distance;
}
