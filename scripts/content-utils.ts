import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cardSourceSchema, type ParsedCardSource } from "../src/data/cardSchemas";

export const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export const contentRoot = join(repoRoot, "content", "cards");
export const publicDataRoot = join(repoRoot, "public", "data");

export async function readCardSources() {
  const files = await readJsonFiles(contentRoot);
  const cards: ParsedCardSource[] = [];
  for (const file of files) {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    cards.push(cardSourceSchema.parse(parsed));
  }
  return cards.sort((left, right) => left.id.localeCompare(right.id));
}

export function validateCardSet(cards: ParsedCardSource[]) {
  const ids = new Set(cards.map((card) => card.id));
  const errors: string[] = [];
  if (cards.length !== 78) errors.push(`Expected 78 cards, found ${cards.length}.`);
  if (ids.size !== cards.length) errors.push("Duplicate card IDs found.");
  for (const card of cards) {
    for (const related of card.related) {
      if (!ids.has(related)) errors.push(`${card.id} references missing related card ${related}.`);
    }
    if (!card.media.thumbnail || !card.media.full) errors.push(`${card.id} is missing required media references.`);
  }
  return errors;
}

export async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return readJsonFiles(path);
    return Promise.resolve(entry.name.endsWith(".json") ? [path] : []);
  }));
  return files.flat();
}
