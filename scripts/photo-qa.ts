import { buildAverageHash, rankVisionScores, scoreImageSignature, type ImageSignature } from "../src/workers/cardMatcher";

const fixtures: Array<{ cardId: string; input: ImageSignature; template: ImageSignature; fileName: string }> = [
  {
    cardId: "the_moon",
    input: signature([12, 18, 25, 210, 220, 230, 44, 48]),
    template: signature([12, 18, 25, 210, 220, 230, 44, 48]),
    fileName: "the_moon.svg"
  },
  {
    cardId: "three_of_swords",
    input: signature([230, 18, 28, 40, 210, 222, 42, 38]),
    template: signature([230, 18, 28, 40, 210, 222, 42, 38]),
    fileName: "three_of_swords.svg"
  }
];

let correct = 0;

for (const fixture of fixtures) {
  const scores = rankVisionScores([
    scoreImageSignature(fixture.cardId, fixture.input, fixture.template, 0.72, fixture.fileName),
    scoreImageSignature("the_tower", fixture.input, signature([200, 190, 12, 18, 20, 25, 180, 170]), 0.72, fixture.fileName)
  ]);
  const best = scores[0]!;
  if (best.cardId === fixture.cardId) correct += 1;
  console.log(`${fixture.cardId}: top=${best.cardId} confidence=${best.confidence.toFixed(2)} hashDistance=${best.signals.hashDistance} templateScore=${best.signals.templateScore?.toFixed(2)}`);
}

const accuracy = correct / fixtures.length;
console.log(`Photo QA top-candidate accuracy: ${correct}/${fixtures.length} (${Math.round(accuracy * 100)}%)`);

if (accuracy < 1) {
  throw new Error("Photo QA deterministic fixtures did not reach 100% top-candidate accuracy.");
}

function signature(samples: number[]): ImageSignature {
  return { samples, hash: buildAverageHash(samples) };
}
