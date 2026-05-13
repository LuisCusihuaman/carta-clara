import { readCardSources, validateCardSet } from "./content-utils";

const cards = await readCardSources();
const errors = validateCardSet(cards);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${cards.length} cards.`);
