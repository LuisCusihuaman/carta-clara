const ROMAN_VALUES = new Map([
  ["i", 1],
  ["v", 5],
  ["x", 10],
  ["l", 50]
]);

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function romanToNumber(value: string) {
  const normalized = normalizeText(value);
  if (!/^[ivxl]+$/.test(normalized)) return undefined;

  let total = 0;
  let previous = 0;
  for (const char of [...normalized].reverse()) {
    const current = ROMAN_VALUES.get(char) ?? 0;
    total += current < previous ? -current : current;
    previous = Math.max(previous, current);
  }
  return total > 0 ? total : undefined;
}
