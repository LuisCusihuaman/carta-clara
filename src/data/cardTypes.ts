export type Arcana = "major" | "minor";
export type Suit = "cups" | "swords" | "wands" | "pentacles";
export type Rank = "ace" | "two" | "three" | "four" | "five" | "six" | "seven" | "eight" | "nine" | "ten" | "page" | "knight" | "queen" | "king";
export type Orientation = "upright" | "reversed";
export type CardId = string;

export type CardMeaning = {
  keywords: string[];
  oneLine: string;
  quick: string;
  love: string;
  work: string;
  money: string;
  advice: string;
  yesNo?: string;
};

export type CardSource = {
  id: CardId;
  slug: string;
  name: {
    es: string;
    en: string;
    short?: string;
  };
  taxonomy: {
    arcana: Arcana;
    suit?: Suit;
    rank?: Rank;
    number?: number;
    roman?: string;
  };
  search: {
    aliases: string[];
    keywords: string[];
    tags: string[];
    typoHints?: string[];
  };
  meaning: {
    upright: CardMeaning;
    reversed: CardMeaning;
  };
  related: CardId[];
  media: {
    thumbnail: string;
    full: string;
    template?: string;
  };
  meta: {
    contentVersion: string;
    updatedAt: string;
  };
};

export type CardSummary = {
  id: CardId;
  slug: string;
  nameEs: string;
  nameEn: string;
  shortName?: string;
  arcana: Arcana;
  suit?: Suit;
  rank?: Rank;
  number?: number;
  roman?: string;
  thumbnail: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  oneLineUpright: string;
  oneLineReversed: string;
  popularityRank?: number;
};

export type CardDetail = CardSummary & {
  quickUpright: string;
  quickReversed: string;
  loveUpright: string;
  loveReversed: string;
  workUpright: string;
  workReversed: string;
  moneyUpright: string;
  moneyReversed: string;
  adviceUpright: string;
  adviceReversed: string;
  yesNo?: string;
  relatedCards: CardId[];
  associations?: Record<string, string>;
  fullImage: string;
};

export type SearchDoc = {
  id: CardId;
  nameEs: string;
  nameEn: string;
  aliases: string[];
  numberText: string[];
  suitText: string[];
  rankText: string[];
  keywords: string[];
  oneLine: string[];
  quick: string[];
  contexts: string[];
};

export type AppManifest = {
  appVersion: string;
  contentVersion: string;
  searchIndexVersion: string;
  visionVersion: string;
};
