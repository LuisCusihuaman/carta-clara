import { describe, expect, it } from "vitest";
import { summarizeSpread } from "@features/spread/spreadRules";
import type { CardDetail } from "@/data/cardTypes";

const details = [
  {
    id: "the_moon",
    oneLineUpright: "Confusion pide intuicion.",
    oneLineReversed: "La claridad vuelve.",
    adviceUpright: "Observa antes de actuar.",
    adviceReversed: "Ordena una duda.",
    keywordsUpright: ["confusion", "intuicion"],
    keywordsReversed: ["claridad"]
  },
  {
    id: "three_of_swords",
    oneLineUpright: "Una verdad duele.",
    oneLineReversed: "Empieza la sanacion.",
    adviceUpright: "Nombra la verdad.",
    adviceReversed: "Cuida la herida.",
    keywordsUpright: ["verdad", "intuicion"],
    keywordsReversed: ["sanacion"]
  }
] as CardDetail[];

describe("summarizeSpread", () => {
  it("combines existing meanings without generated interpretation", () => {
    const summary = summarizeSpread([
      { cardId: "the_moon", orientation: "upright" },
      { cardId: "three_of_swords", orientation: "upright" }
    ], details);

    expect(summary.repeatedThemes).toContain("intuicion");
    expect(summary.cardLines).toHaveLength(2);
    expect(summary.advice).toContain("Observa");
  });
});
