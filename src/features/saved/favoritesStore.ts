import type { CardId } from "@/data/cardTypes";
import { getDb } from "@/db/db";
import { now } from "@/lib/time";

export async function saveFavorite(cardId: CardId) {
  const db = await getDb();
  await db.put("favorites", { cardId, createdAt: now() });
}

export async function removeFavorite(cardId: CardId) {
  const db = await getDb();
  await db.delete("favorites", cardId);
}

export async function listFavorites() {
  const db = await getDb();
  return db.getAll("favorites");
}

export async function isFavorite(cardId: CardId) {
  const db = await getDb();
  return Boolean(await db.get("favorites", cardId));
}
