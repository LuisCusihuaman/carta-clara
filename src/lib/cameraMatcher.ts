import type { CV, Mat, Point } from '@techstark/opencv-js'
import { tarotCards, type TarotCard } from '../data/cards'

export type CameraMatch = {
  card: TarotCard
  confidence: number
  orientation: 'upright' | 'reversed'
}

type CvRuntime = CV & {
  default?: CvRuntime
  onRuntimeInitialized?: () => void
  then?: unknown
}

type Template = {
  card: TarotCard
  mat: Mat
}

const CONFIDENT_SCORE = 0.86
const CONFIDENT_MARGIN = 0.08
const MIN_STABLE_FRAMES = 2
const FRAME_MAX_WIDTH = 640
const TEMPLATE_WIDTH = 48
const TEMPLATE_HEIGHT = 72
const CARD_ASPECT_RATIO = 2 / 3

let cvPromise: Promise<CvRuntime> | null = null
let templatesPromise: Promise<Template[]> | null = null

export function isConfidentCameraMatch(candidates: CameraMatch[], stableFrames: number) {
  const [best, second] = candidates
  if (!best || !second) return false
  return best.confidence > CONFIDENT_SCORE && best.confidence - second.confidence > CONFIDENT_MARGIN && stableFrames >= MIN_STABLE_FRAMES
}

export async function matchCameraFrame(video: HTMLVideoElement) {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
    return []
  }

  return matchCanvas(drawVideoFrame(video))
}

export async function matchImageFile(file: File) {
  const imageUrl = URL.createObjectURL(file)
  try {
    return await matchCanvas(await drawImageUrl(imageUrl))
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

async function matchCanvas(canvas: HTMLCanvasElement): Promise<CameraMatch[]> {
  const cv = await loadOpenCv()
  const templates = await loadTemplates(cv)
  const src = cv.imread(canvas)
  let normalized: Mat | null = null

  try {
    normalized = normalizeCardCandidate(cv, src)
    return rankTemplates(cv, normalized, templates).slice(0, 3)
  } finally {
    src.delete()
    normalized?.delete()
  }
}

async function loadOpenCv(): Promise<CvRuntime> {
  cvPromise ??= import('@techstark/opencv-js').then((module) => {
    const cv = stripThenable(((module as unknown as { default?: CvRuntime }).default ?? module) as CvRuntime)
    if (isOpenCvReady(cv)) return cv

    return new Promise<CvRuntime>((resolve, reject) => {
      const startedAt = window.performance.now()
      const previousInit = cv.onRuntimeInitialized
      const timer = window.setInterval(() => {
        if (isOpenCvReady(cv)) {
          window.clearInterval(timer)
          resolve(cv)
          return
        }

        if (window.performance.now() - startedAt > 8000) {
          window.clearInterval(timer)
          reject(new Error('OpenCV no terminó de cargar'))
        }
      }, 50)

      cv.onRuntimeInitialized = () => {
        previousInit?.()
        window.clearInterval(timer)
        resolve(cv)
      }
    })
  })

  return cvPromise
}

function stripThenable(cv: CvRuntime) {
  cv.then = undefined
  return cv
}

function isOpenCvReady(cv: CvRuntime) {
  return typeof cv.Mat === 'function' && typeof cv.imread === 'function' && typeof cv.findContours === 'function'
}

async function loadTemplates(cv: CvRuntime) {
  templatesPromise ??= Promise.all(
    tarotCards.map(async (card) => {
      const src = cv.imread(await drawImageUrl(card.image.thumb))
      try {
        return { card, mat: normalizeCardMat(cv, src) }
      } finally {
        src.delete()
      }
    }),
  )

  return templatesPromise
}

function drawVideoFrame(video: HTMLVideoElement) {
  const scale = Math.min(1, FRAME_MAX_WIDTH / video.videoWidth)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('No se pudo leer el frame de cámara')
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas
}

async function drawImageUrl(src: string) {
  const image = await loadImage(src)
  const scale = Math.min(1, FRAME_MAX_WIDTH / image.naturalWidth)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('No se pudo leer la imagen')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas
}

async function loadImage(src: string) {
  const image = new Image()
  image.decoding = 'async'
  image.crossOrigin = 'anonymous'
  image.src = src

  if (image.decode) {
    await image.decode()
    return image
  }

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('No se pudo cargar la imagen'))
  })
  return image
}

function normalizeCardCandidate(cv: CvRuntime, src: Mat) {
  const perspective = extractCardPerspective(cv, src)
  const card = perspective ?? centerCropCard(cv, src)
  try {
    return normalizeCardMat(cv, card)
  } finally {
    card.delete()
  }
}

function normalizeCardMat(cv: CvRuntime, src: Mat) {
  const gray = new cv.Mat()
  const resized = new cv.Mat()
  const equalized = new cv.Mat()

  try {
    cv.cvtColor(src, gray, src.channels() === 4 ? cv.COLOR_RGBA2GRAY : cv.COLOR_RGB2GRAY)
    cv.resize(gray, resized, new cv.Size(TEMPLATE_WIDTH, TEMPLATE_HEIGHT), 0, 0, cv.INTER_AREA)
    cv.equalizeHist(resized, equalized)
    return equalized.clone()
  } finally {
    gray.delete()
    resized.delete()
    equalized.delete()
  }
}

function extractCardPerspective(cv: CvRuntime, src: Mat) {
  const gray = new cv.Mat()
  const blurred = new cv.Mat()
  const edges = new cv.Mat()
  const contours = new cv.MatVector()
  const hierarchy = new cv.Mat()
  let bestArea = 0
  let bestPoints: Point[] | null = null

  try {
    cv.cvtColor(src, gray, src.channels() === 4 ? cv.COLOR_RGBA2GRAY : cv.COLOR_RGB2GRAY)
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)
    cv.Canny(blurred, edges, 48, 132)
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    const imageArea = src.rows * src.cols
    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index)
      const approx = new cv.Mat()
      try {
        const area = cv.contourArea(contour)
        if (area < imageArea * 0.035 || area > imageArea * 0.92) continue

        const perimeter = cv.arcLength(contour, true)
        cv.approxPolyDP(contour, approx, perimeter * 0.03, true)
        if (approx.rows !== 4) continue

        const rect = cv.boundingRect(approx)
        const ratio = Math.max(rect.width, rect.height) / Math.max(1, Math.min(rect.width, rect.height))
        if (ratio < 1.35 || ratio > 1.82) continue

        if (area > bestArea) {
          bestArea = area
          bestPoints = pointsFromApprox(cv, approx)
        }
      } finally {
        contour.delete()
        approx.delete()
      }
    }

    return bestPoints ? warpCard(cv, src, bestPoints) : null
  } finally {
    gray.delete()
    blurred.delete()
    edges.delete()
    contours.delete()
    hierarchy.delete()
  }
}

function pointsFromApprox(cv: CvRuntime, approx: Mat): Point[] {
  const points: Point[] = []
  for (let index = 0; index < approx.rows; index += 1) {
    points.push(new cv.Point(approx.data32S[index * 2], approx.data32S[index * 2 + 1]))
  }
  return orderPoints(points)
}

function orderPoints(points: Point[]) {
  const sorted = [...points]
  const topLeft = sorted.reduce((best, point) => (point.x + point.y < best.x + best.y ? point : best))
  const bottomRight = sorted.reduce((best, point) => (point.x + point.y > best.x + best.y ? point : best))
  const topRight = sorted.reduce((best, point) => (point.x - point.y > best.x - best.y ? point : best))
  const bottomLeft = sorted.reduce((best, point) => (point.x - point.y < best.x - best.y ? point : best))
  return [topLeft, topRight, bottomRight, bottomLeft]
}

function warpCard(cv: CvRuntime, src: Mat, points: Point[]) {
  const [topLeft, topRight, bottomRight, bottomLeft] = points
  const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    topLeft.x, topLeft.y,
    topRight.x, topRight.y,
    bottomRight.x, bottomRight.y,
    bottomLeft.x, bottomLeft.y,
  ])
  const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0,
    TEMPLATE_WIDTH, 0,
    TEMPLATE_WIDTH, TEMPLATE_HEIGHT,
    0, TEMPLATE_HEIGHT,
  ])
  const transform = cv.getPerspectiveTransform(srcTri, dstTri)
  const warped = new cv.Mat()

  try {
    cv.warpPerspective(src, warped, transform, new cv.Size(TEMPLATE_WIDTH, TEMPLATE_HEIGHT), cv.INTER_LINEAR, cv.BORDER_CONSTANT)
    return warped.clone()
  } finally {
    srcTri.delete()
    dstTri.delete()
    transform.delete()
    warped.delete()
  }
}

function centerCropCard(cv: CvRuntime, src: Mat) {
  let width = src.cols
  let height = Math.round(width / CARD_ASPECT_RATIO)

  if (height > src.rows) {
    height = src.rows
    width = Math.round(height * CARD_ASPECT_RATIO)
  }

  const x = Math.max(0, Math.round((src.cols - width) / 2))
  const y = Math.max(0, Math.round((src.rows - height) / 2))
  const roi = src.roi(new cv.Rect(x, y, width, height))
  try {
    return roi.clone()
  } finally {
    roi.delete()
  }
}

function rankTemplates(cv: CvRuntime, cardMat: Mat, templates: Template[]): CameraMatch[] {
  const rotated = new cv.Mat()

  try {
    cv.rotate(cardMat, rotated, cv.ROTATE_180)
    return templates
      .map(({ card, mat }) => {
        const upright = similarity(cv, cardMat, mat)
        const reversed = similarity(cv, rotated, mat)
        return {
          card,
          confidence: Math.max(upright, reversed),
          orientation: reversed > upright ? 'reversed' : 'upright',
        } satisfies CameraMatch
      })
      .sort((first, second) => second.confidence - first.confidence)
  } finally {
    rotated.delete()
  }
}

function similarity(cv: CvRuntime, one: Mat, two: Mat) {
  const maxDistance = Math.sqrt(one.rows * one.cols) * 255
  return clamp(1 - cv.norm(one, two, cv.NORM_L2) / maxDistance, 0, 1)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
