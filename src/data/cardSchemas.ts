import { z } from "zod";

export const orientationSchema = z.enum(["upright", "reversed"]);
export const arcanaSchema = z.enum(["major", "minor"]);
export const suitSchema = z.enum(["cups", "swords", "wands", "pentacles"]);
export const rankSchema = z.enum(["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "page", "knight", "queen", "king"]);

export const cardMeaningSchema = z.object({
  keywords: z.array(z.string().min(1)).min(3).max(6),
  oneLine: z.string().min(12).max(160),
  quick: z.string().min(40).max(450),
  love: z.string().min(12).max(450),
  work: z.string().min(12).max(450),
  money: z.string().min(12).max(450),
  advice: z.string().min(12).max(450),
  yesNo: z.string().max(120).optional()
});

export const cardSourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.object({
    es: z.string().min(2),
    en: z.string().min(2),
    short: z.string().optional()
  }),
  taxonomy: z.object({
    arcana: arcanaSchema,
    suit: suitSchema.optional(),
    rank: rankSchema.optional(),
    number: z.number().int().min(0).max(21).optional(),
    roman: z.string().optional()
  }),
  search: z.object({
    aliases: z.array(z.string().min(1)).min(6),
    keywords: z.array(z.string().min(1)).min(3),
    tags: z.array(z.string().min(1)).min(1),
    typoHints: z.array(z.string()).optional()
  }),
  meaning: z.object({
    upright: cardMeaningSchema,
    reversed: cardMeaningSchema
  }),
  related: z.array(z.string().min(1)).min(2).max(4),
  media: z.object({
    thumbnail: z.string().min(1),
    full: z.string().min(1),
    template: z.string().optional()
  }),
  meta: z.object({
    contentVersion: z.string().min(1),
    updatedAt: z.string().min(10)
  })
}).superRefine((card, ctx) => {
  if (card.taxonomy.arcana === "major" && card.taxonomy.suit) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["taxonomy", "suit"], message: "Major arcana cards must not define a suit." });
  }
  if (card.taxonomy.arcana === "minor" && !card.taxonomy.suit) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["taxonomy", "suit"], message: "Minor arcana cards must define a suit." });
  }
});

export const cardSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameEs: z.string(),
  nameEn: z.string(),
  shortName: z.string().optional(),
  arcana: arcanaSchema,
  suit: suitSchema.optional(),
  rank: rankSchema.optional(),
  number: z.number().optional(),
  roman: z.string().optional(),
  thumbnail: z.string(),
  keywordsUpright: z.array(z.string()),
  keywordsReversed: z.array(z.string()),
  oneLineUpright: z.string(),
  oneLineReversed: z.string(),
  popularityRank: z.number().optional()
});

export const appManifestSchema = z.object({
  appVersion: z.string(),
  contentVersion: z.string(),
  searchIndexVersion: z.string(),
  visionVersion: z.string()
});

export type ParsedCardSource = z.infer<typeof cardSourceSchema>;
