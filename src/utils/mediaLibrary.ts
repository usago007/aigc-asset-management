const IMAGE_BASE = '/media/beauty/images'
const VIDEO_POSTER_BASE = '/media/beauty/video-posters'

const buildImagePath = (index: number) => `${IMAGE_BASE}/beauty-image-${String(index).padStart(2, '0')}.jpg`
const buildVideoPosterPath = (index: number) => `${VIDEO_POSTER_BASE}/beauty-video-poster-${String(index).padStart(2, '0')}.jpg`

export const BEAUTY_PRODUCT_IMAGES = Array.from({ length: 12 }, (_, index) => buildImagePath(index + 1))
export const BEAUTY_LIFESTYLE_IMAGES = Array.from({ length: 4 }, (_, index) => buildImagePath(index + 13))
export const BEAUTY_IMAGES = [...BEAUTY_PRODUCT_IMAGES, ...BEAUTY_LIFESTYLE_IMAGES]
export const BEAUTY_VIDEO_POSTERS = Array.from({ length: 8 }, (_, index) => buildVideoPosterPath(index + 1))

type BeautyImageKind = 'product' | 'lifestyle' | 'mixed'

function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length
}

function hashString(value: string) {
  return value.split('').reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7)
}

function pickFromPool(pool: string[], index: number) {
  return pool[normalizeIndex(index, pool.length)]
}

export function getBeautyLibraryImage(index: number, kind: BeautyImageKind = 'mixed') {
  if (kind === 'product') return pickFromPool(BEAUTY_PRODUCT_IMAGES, index)
  if (kind === 'lifestyle') return pickFromPool(BEAUTY_LIFESTYLE_IMAGES, index)
  return pickFromPool(BEAUTY_IMAGES, index)
}

export function getBeautyLibraryOpeningImage(index: number) {
  return getBeautyLibraryImage(index, 'product')
}

export function getBeautyLibraryEndingImage(index: number) {
  return getBeautyLibraryImage(index, 'lifestyle')
}

export function getBeautyLibraryVideoPoster(index: number) {
  return pickFromPool(BEAUTY_VIDEO_POSTERS, index)
}

export function getBeautyLibraryImageBatch(seed: number, count: number, kind: BeautyImageKind = 'mixed') {
  return Array.from({ length: Math.max(1, count) }, (_, offset) => getBeautyLibraryImage(seed + offset, kind))
}

export function getBeautyLibraryImageBatchFromKey(key: string, count: number, kind: BeautyImageKind = 'mixed') {
  return getBeautyLibraryImageBatch(hashString(key), count, kind)
}

export function getBeautyLibraryPosterFromKey(key: string) {
  return getBeautyLibraryVideoPoster(hashString(key))
}

export function isBeautyMediaPath(value?: string | null) {
  return Boolean(value && value.startsWith('/media/beauty/'))
}

export function getMediaDownloadName(url: string, fallbackBase: string) {
  const cleanUrl = url.split('?')[0]
  const extension = cleanUrl.slice(cleanUrl.lastIndexOf('.') + 1) || 'jpg'
  return `${fallbackBase}.${extension}`
}
