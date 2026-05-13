import { describe, expect, it } from "vitest";
import { normalizeText, romanToNumber } from "@/lib/normalize";

describe("normalizeText", () => {
  it("normalizes accents and punctuation", () => {
    expect(normalizeText("Lúna!!!")).toBe("luna");
  });
});

describe("romanToNumber", () => {
  it("converts tarot roman numerals", () => {
    expect(romanToNumber("XVIII")).toBe(18);
  });
});
