import cardsData from './cards.json'

export type Arcana = 'major' | 'minor'
export type Suit = 'cups' | 'swords' | 'wands' | 'pentacles'

export type TarotCard = {
  id: string
  nameEs: string
  nameEn: string
  shortName: string
  arcana: Arcana
  number?: number
  roman?: string
  suit?: Suit
  suitEs?: string
  suitEn?: string
  rank?: string
  rankEs?: string
  rankEn?: string
  aliases: string[]
  keywordsUpright: string[]
  keywordsReversed: string[]
  oneLineUpright: string
  oneLineReversed: string
  quickUpright: string
  quickReversed: string
  loveUpright: string
  loveReversed: string
  workUpright: string
  workReversed: string
  moneyUpright: string
  moneyReversed: string
  adviceUpright: string
  adviceReversed: string
  yesNo: string
  relatedCards: string[]
  popularityRank: number
  accent: string
  glyph: string
  image: {
    full: string
    thumb: string
    blur: string
  }
}

const publicBaseUrl = import.meta.env.BASE_URL

function publicAsset(path: string) {
  return `${publicBaseUrl}${path.replace(/^\//, '')}`
}

function withRuntimeAssetPaths(card: TarotCard): TarotCard {
  return {
    ...card,
    image: {
      full: publicAsset(card.image.full),
      thumb: publicAsset(card.image.thumb),
      blur: publicAsset(card.image.blur),
    },
  }
}

export const tarotCards: TarotCard[] = (cardsData as TarotCard[]).map(withRuntimeAssetPaths)

export const cardsById = new Map(tarotCards.map((card) => [card.id, card]))

export const popularCardIds = ['the_moon', 'the_tower', 'death', 'the_fool', 'the_lovers', 'the_empress', 'three_of_swords']

export const detectedDemoIds = ['the_moon', 'three_of_swords', 'the_empress']
