import { describe, expect, it } from "vitest";
import { buildAverageHash, classifyConfidence, compareSamples, filenameBoostForCard, rankVisionScores, scoreImageSignature, type ImageSignature } from "@/workers/cardMatcher";

const moonSignature: ImageSignature = {
  samples: [12, 18, 25, 210, 220, 230, 44, 48],
  hash: ""
};
moonSignature.hash = buildAverageHash(moonSignature.samples);

const towerSignature: ImageSignature = {
  samples: [220, 210, 205, 24, 20, 18, 180, 178],
  hash: ""
};
towerSignature.hash = buildAverageHash(towerSignature.samples);

describe("photo matching scoring", () => {
  it("scores matching signatures above unrelated templates", () => {
    const moon = scoreImageSignature("the_moon", moonSignature, moonSignature, 0.72, "the_moon.svg");
    const tower = scoreImageSignature("the_tower", moonSignature, towerSignature, 0.72, "the_moon.svg");
    const ranked = rankVisionScores([tower, moon]);

    expect(ranked[0]?.cardId).toBe("the_moon");
    expect(ranked[0]?.confidence).toBeGreaterThan(0.78);
  });

  it("classifies confidence bands deterministically", () => {
    const high = scoreImageSignature("the_moon", moonSignature, moonSignature, 0.72, "the_moon.svg");
    const medium = { ...high, confidence: 0.6 };
    const low = { ...high, confidence: 0.2 };

    expect(classifyConfidence([high])).toBe("high");
    expect(classifyConfidence([medium])).toBe("medium");
    expect(classifyConfidence([low])).toBe("low");
    expect(classifyConfidence([])).toBe("unavailable");
  });

  it("keeps filename hints bounded and card-specific", () => {
    expect(filenameBoostForCard("the_moon", "the_moon.svg")).toBeGreaterThan(0);
    expect(filenameBoostForCard("the_tower", "the_moon.svg")).toBe(0);
  });

  it("compares sample arrays on a zero-to-one scale", () => {
    expect(compareSamples(moonSignature.samples, moonSignature.samples)).toBe(1);
    expect(compareSamples(moonSignature.samples, towerSignature.samples)).toBeLessThan(0.5);
  });
});
