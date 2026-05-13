import { openDB, type IDBPDatabase } from "idb";
import type { CurrentSpread, LearningState, RecentCard, UserFavorite } from "@/db/schema";

type CartaClaraDb = {
  favorites: UserFavorite;
  recentCards: RecentCard;
  learningState: LearningState;
  currentSpread: CurrentSpread;
};

let dbPromise: Promise<IDBPDatabase<CartaClaraDb>> | undefined;

export function getDb() {
  dbPromise ??= openDB<CartaClaraDb>("carta-clara", 1, {
    upgrade(db) {
      db.createObjectStore("favorites", { keyPath: "cardId" });
      db.createObjectStore("recentCards", { keyPath: "cardId" });
      db.createObjectStore("learningState", { keyPath: "cardId" });
      db.createObjectStore("currentSpread", { keyPath: "id" });
    }
  });
  return dbPromise;
}
