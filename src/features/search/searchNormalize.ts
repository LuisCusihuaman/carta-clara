import { normalizeText, romanToNumber } from "@/lib/normalize";

const suitAliases = new Map([
  ["copas", "cups"],
  ["cups", "cups"],
  ["espadas", "swords"],
  ["swords", "swords"],
  ["bastos", "wands"],
  ["wands", "wands"],
  ["oros", "pentacles"],
  ["pentacles", "pentacles"],
  ["coins", "pentacles"]
]);

export function normalizeQuery(query: string) {
  const normalized = normalizeText(query);
  const romanNumber = romanToNumber(normalized);
  const tokens = normalized.split(" ").filter(Boolean);
  const expanded = new Set([normalized]);

  if (romanNumber) expanded.add(String(romanNumber));
  tokens.forEach((token) => {
    const suit = suitAliases.get(token);
    if (suit) expanded.add(suit);
  });

  return { normalized, tokens, expanded: [...expanded] };
}
