import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outDir = 'public/cards/source'
const category = 'Category:Rider-Waite-Smith tarot deck (TaionWC)'
const userAgent = 'CartaClara/0.1 (local development; https://github.com/)'

const majorIds = [
  'the_fool',
  'the_magician',
  'the_high_priestess',
  'the_empress',
  'the_emperor',
  'the_hierophant',
  'the_lovers',
  'the_chariot',
  'strength',
  'the_hermit',
  'wheel_of_fortune',
  'justice',
  'the_hanged_man',
  'death',
  'temperance',
  'the_devil',
  'the_tower',
  'the_star',
  'the_moon',
  'the_sun',
  'judgement',
  'the_world',
]

const rankIds = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king']

const suitMap = {
  Cups: 'cups',
  Swords: 'swords',
  Wands: 'wands',
  Pents: 'pentacles',
}

function titleToCardId(title) {
  const fileName = title.replace(/^File:/, '')
  const majorMatch = fileName.match(/^RWS Tarot (\d{2}) /)

  if (majorMatch) {
    return majorIds[Number(majorMatch[1])]
  }

  const minorMatch = fileName.match(/^(Cups|Swords|Wands|Pents)(\d{2})\.jpg$/)

  if (minorMatch) {
    const [, suitRaw, rankRaw] = minorMatch
    const suit = suitMap[suitRaw]
    const rank = rankIds[Number(rankRaw) - 1]
    return rank && suit ? `${rank}_of_${suit}` : null
  }

  return null
}

async function getCommonsFiles() {
  const titles = await getCategoryFileTitles()

  return Promise.all(titles.map((title) => getFileInfo(title)))
}

async function getCategoryFileTitles() {
  const titles = []
  let continuation = null

  do {
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: category,
      cmtype: 'file',
      cmlimit: '500',
      format: 'json',
      origin: '*',
    })

    if (continuation) params.set('cmcontinue', continuation)

    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': userAgent },
    })
    if (!response.ok) throw new Error(`Commons category API failed: ${response.status}`)

    const data = await response.json()
    titles.push(...(data.query?.categorymembers ?? []).map((file) => file.title))
    continuation = data.continue?.cmcontinue ?? null
  } while (continuation)

  return titles
}

async function getFileInfo(title) {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  })

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': userAgent },
  })
  if (!response.ok) throw new Error(`Commons API failed: ${response.status}`)

  const data = await response.json()
  return Object.values(data.query?.pages ?? {})[0]
}

await mkdir(outDir, { recursive: true })

const files = await getCommonsFiles()
const seen = new Set()
let downloaded = 0

for (const file of files) {
  const cardId = titleToCardId(file.title)
  const imageUrl = file.imageinfo?.[0]?.thumburl ?? file.imageinfo?.[0]?.url

  if (!cardId || !imageUrl) {
    console.warn(`Skipping ${file.title}`)
    continue
  }

  if (seen.has(cardId)) {
    console.warn(`Skipping duplicate ${cardId} from ${file.title}`)
    continue
  }

  const imageResponse = await fetchWithRetry(imageUrl)
  if (!imageResponse.ok) {
    console.warn(`Could not download ${file.title}: ${imageResponse.status}`)
    continue
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer())
  await writeFile(path.join(outDir, `${cardId}.jpg`), buffer)

  seen.add(cardId)
  downloaded += 1
  console.log(`Downloaded ${cardId}`)
}

const missing = [...majorIds, ...Object.values(suitMap).flatMap((suit) => rankIds.map((rank) => `${rank}_of_${suit}`))].filter(
  (id) => !seen.has(id),
)

if (missing.length > 0) {
  console.warn(`Missing ${missing.length} cards:`)
  console.warn(missing.join(', '))
}

console.log(`Done. Downloaded ${downloaded}/78 cards.`)

async function fetchWithRetry(url, attempts = 6) {
  let lastResponse = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    })

    if (response.ok) return response
    lastResponse = response

    if (![403, 429, 500, 502, 503, 504].includes(response.status)) return response
    await wait(1200 * attempt)
  }

  return lastResponse
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
