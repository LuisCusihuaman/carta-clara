import type { CardId, Orientation } from "@/data/cardTypes";
import { getDb } from "@/db/db";
import type { CurrentSpread } from "@/db/schema";
import { now } from "@/lib/time";

const CURRENT_SPREAD_ID = "current";

export async function getCurrentSpread() {
  const db = await getDb();
  return db.get("currentSpread", CURRENT_SPREAD_ID);
}

export async function addCardToCurrentSpread(cardId: CardId, orientation: Orientation | "unknown", source: "search" | "photo", confidence?: number) {
  const db = await getDb();
  const current = await getCurrentSpread();
  const timestamp = now();
  const existingCards = current?.cards ?? [];
  const next: CurrentSpread = {
    id: CURRENT_SPREAD_ID,
    cards: [...existingCards.filter((card: CurrentSpread["cards"][number]) => card.cardId !== cardId), { cardId, orientation, source, confidence }].slice(-3),
    createdAt: current?.createdAt ?? timestamp,
    updatedAt: timestamp
  };
  await db.put("currentSpread", next);
  return next;
}

export async function clearCurrentSpread() {
  const db = await getDb();
  await db.delete("currentSpread", CURRENT_SPREAD_ID);
}
