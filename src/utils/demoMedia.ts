const IMAGE_BASE = '/demo-media/beauty/images'
const VIDEO_POSTER_BASE = '/demo-media/beauty/video-posters'

const buildImagePath = (index: number) => `${IMAGE_BASE}/beauty-image-${String(index).padStart(2, '0')}.jpg`
const buildVideoPosterPath = (index: number) => `${VIDEO_POSTER_BASE}/beauty-video-poster-${String(index).padStart(2, '0')}.jpg`

export const DEMO_BEAUTY_PRODUCT_IMAGES = Array.from({ length: 12 }, (_, index) => buildImagePath(index + 1))
export const DEMO_BEAUTY_LIFESTYLE_IMAGES = Array.from({ length: 4 }, (_, index) => buildImagePath(index + 13))
export const DEMO_BEAUTY_IMAGES = [...DEMO_BEAUTY_PRODUCT_IMAGES, ...DEMO_BEAUTY_LIFESTYLE_IMAGES]
export const DEMO_BEAUTY_VIDEO_POSTERS = Array.from({ length: 8 }, (_, index) => buildVideoPosterPath(index + 1))

type DemoImageKind = 'product' | 'lifestyle' | 'mixed'

function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length
}

function hashString(value: string) {
  return value.split('').reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7)
}

function pickFromPool(pool: string[], index: number) {
  return pool[normalizeIndex(index, pool.length)]
}

export function getDemoBeautyImage(index: number, kind: DemoImageKind = 'mixed') {
  if (kind === 'product') return pickFromPool(DEMO_BEAUTY_PRODUCT_IMAGES, index)
  if (kind === 'lifestyle') return pickFromPool(DEMO_BEAUTY_LIFESTYLE_IMAGES, index)
  return pickFromPool(DEMO_BEAUTY_IMAGES, index)
}

export function getDemoBeautyOpeningImage(index: number) {
  return getDemoBeautyImage(index, 'product')
}

export function getDemoBeautyEndingImage(index: number) {
  return getDemoBeautyImage(index, 'lifestyle')
}

export function getDemoBeautyVideoPoster(index: number) {
  return pickFromPool(DEMO_BEAUTY_VIDEO_POSTERS, index)
}

export function getDemoBeautyImageBatch(seed: number, count: number, kind: DemoImageKind = 'mixed') {
  return Array.from({ length: Math.max(1, count) }, (_, offset) => getDemoBeautyImage(seed + offset, kind))
}

export function getDemoBeautyImageBatchFromKey(key: string, count: number, kind: DemoImageKind = 'mixed') {
  return getDemoBeautyImageBatch(hashString(key), count, kind)
}

export function getDemoBeautyPosterFromKey(key: string) {
  return getDemoBeautyVideoPoster(hashString(key))
}

export function isDemoMediaPath(value?: string | null) {
  return Boolean(value && value.startsWith('/demo-media/beauty/'))
}

export function getMediaDownloadName(url: string, fallbackBase: string) {
  const cleanUrl = url.split('?')[0]
  const extension = cleanUrl.slice(cleanUrl.lastIndexOf('.') + 1) || 'jpg'
  return `${fallbackBase}.${extension}`
}
