import type { CardId } from "@/data/cardTypes";
import type { ViewSource } from "@/db/schema";
import { getDb } from "@/db/db";
import { now } from "@/lib/time";

export async function recordRecentCard(cardId: CardId, source: ViewSource) {
  const db = await getDb();
  await db.put("recentCards", { cardId, viewedAt: now(), source });
}

export async function listRecentCards() {
  const db = await getDb();
  return (await db.getAll("recentCards")).sort((left, right) => right.viewedAt - left.viewedAt);
}
