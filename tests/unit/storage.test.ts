import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/db", () => {
  const stores = new Map<string, Map<string, unknown>>([
    ["favorites", new Map()],
    ["recentCards", new Map()],
    ["learningState", new Map()],
    ["currentSpread", new Map()]
  ]);
  return {
    getDb: async () => ({
      put: async (store: string, value: { cardId?: string; id?: string }) => stores.get(store)?.set(value.cardId ?? value.id ?? "", value),
      get: async (store: string, key: string) => stores.get(store)?.get(key),
      getAll: async (store: string) => [...(stores.get(store)?.values() ?? [])],
      delete: async (store: string, key: string) => stores.get(store)?.delete(key)
    })
  };
});

describe("local persistence helpers", () => {
  it("saves and reads favorites", async () => {
    const { saveFavorite, isFavorite } = await import("@features/saved/favoritesStore");
    await saveFavorite("the_moon");
    expect(await isFavorite("the_moon")).toBe(true);
  });

  it("records recent cards", async () => {
    const { recordRecentCard, listRecentCards } = await import("@features/saved/historyStore");
    await recordRecentCard("the_moon", "search");
    expect((await listRecentCards())[0]?.cardId).toBe("the_moon");
  });
});
