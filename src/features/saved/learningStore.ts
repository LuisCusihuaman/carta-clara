import type { CardId } from "@/data/cardTypes";
import { getDb } from "@/db/db";
import { now } from "@/lib/time";

export type LearningStatus = "unknown" | "review" | "learned";

export async function setLearningState(cardId: CardId, status: LearningStatus) {
  const db = await getDb();
  await db.put("learningState", { cardId, status, updatedAt: now() });
}

export async function listLearningStates() {
  const db = await getDb();
  return db.getAll("learningState");
}
