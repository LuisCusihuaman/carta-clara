import sharp from 'sharp'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sourceDir = 'public/cards/source'
const fullDir = 'public/cards/full'
const thumbDir = 'public/cards/thumb'
const blurDir = 'public/cards/blur'
const spriteDir = 'public/cards/sprites'
const spritePath = path.join(spriteDir, 'thumbs.webp')
const spriteDataPath = 'src/data/cardSprite.ts'

const fullWidth = 720
const thumbWidth = 180
const blurWidth = 24
const spriteThumbWidth = 120
const spriteThumbHeight = 180
const spriteColumns = 10

await Promise.all([sourceDir, fullDir, thumbDir, blurDir, spriteDir].map((dir) => mkdir(dir, { recursive: true })))

const files = (await readdir(sourceDir))
  .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
  .sort((a, b) => path.parse(a).name.localeCompare(path.parse(b).name))

if (files.length === 0) {
  await writeSpriteData({})
  console.log(`No source card images found in ${sourceDir}`)
  console.log('Add images named by card id, e.g. the_moon.jpg, then run pnpm images:cards')
  process.exit(0)
}

const spriteEntries = {}
const spriteComposites = []

for (const [index, file] of files.entries()) {
  const id = path.parse(file).name
  const input = path.join(sourceDir, file)

  await sharp(input)
    .resize({ width: fullWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(fullDir, `${id}.webp`))

  await sharp(input)
    .resize({ width: thumbWidth, withoutEnlargement: true })
    .webp({ quality: 68 })
    .toFile(path.join(thumbDir, `${id}.webp`))

  await sharp(input)
    .resize({ width: blurWidth, withoutEnlargement: true })
    .blur(1.2)
    .webp({ quality: 35 })
    .toFile(path.join(blurDir, `${id}.webp`))

  const x = (index % spriteColumns) * spriteThumbWidth
  const y = Math.floor(index / spriteColumns) * spriteThumbHeight
  const spriteInput = await sharp(input)
    .resize(spriteThumbWidth, spriteThumbHeight, { fit: 'cover', position: 'centre' })
    .webp({ quality: 70 })
    .toBuffer()

  spriteEntries[id] = { x, y, w: spriteThumbWidth, h: spriteThumbHeight }
  spriteComposites.push({ input: spriteInput, left: x, top: y })

  console.log(`Generated ${id}`)
}

const spriteRows = Math.ceil(files.length / spriteColumns)
await sharp({
  create: {
    width: spriteColumns * spriteThumbWidth,
    height: spriteRows * spriteThumbHeight,
    channels: 4,
    background: '#05040A',
  },
})
  .composite(spriteComposites)
  .webp({ quality: 72 })
  .toFile(spritePath)

await writeSpriteData(spriteEntries)

console.log(`Generated sprite ${spritePath}`)
console.log(`Generated metadata ${spriteDataPath}`)

async function writeSpriteData(entries) {
  const serialized = JSON.stringify(entries, null, 2)
  await writeFile(
    spriteDataPath,
    `export type CardSpriteEntry = { x: number; y: number; w: number; h: number }\n\nexport const cardSprite: Record<string, CardSpriteEntry> = ${serialized}\n\nexport const cardSpriteImage = \`\${import.meta.env.BASE_URL}cards/sprites/thumbs.webp\`\n\nexport const cardSpriteColumns = ${spriteColumns}\n`,
  )
}
