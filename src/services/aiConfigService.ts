import type { AIConfig, AIEndpointConfig, ImageAIConfig, AIGeneralConfig, DeepSeekConfig } from '@/types/aiConfig';
import type { GenerationMode, ImageGenerationMode } from '@/types/generation';
import { getDefaultAIConfig } from '@/types/aiConfig';

export const AI_CONFIG_STORAGE_KEY = 'ai_config';

export function getAIConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const defaults = getDefaultAIConfig();
      return {
        general: { ...defaults.general, ...parsed.general },
        video: { ...defaults.video, ...parsed.video },
        image: { ...defaults.image, ...parsed.image },
        deepseek: { ...defaults.deepseek, ...parsed.deepseek },
      };
    }
  } catch {
    // ignore parse errors, return defaults
  }
  return getDefaultAIConfig();
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function resetAIConfig(): AIConfig {
  const defaults = getDefaultAIConfig();
  localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
  return defaults;
}

const VIDEO_MODE_MAP: Record<GenerationMode, keyof import('@/types/aiConfig').VideoAIConfig> = {
  'text-to-video': 'textToVideo',
  'image-to-video-first': 'imageToVideoFirst',
  'image-to-video-first-tail': 'imageToVideoFirstTail',
};

const IMAGE_MODE_MAP: Record<ImageGenerationMode, keyof import('@/types/aiConfig').ImageAIConfig> = {
  'text-to-image': 'textToImage',
  'image-to-image': 'imageToImage',
  'stylization-edit': 'stylizationEdit',
  'super-resolution': 'superResolution',
  'inpainting': 'inpainting',
};

export function getVideoReqKey(mode: GenerationMode): string {
  const config = getAIConfig();
  const key = VIDEO_MODE_MAP[mode];
  return config.video[key].reqKey;
}

export function getImageReqKey(mode: ImageGenerationMode): string {
  const config = getAIConfig();
  const key = IMAGE_MODE_MAP[mode];
  return config.image[key].reqKey;
}

export function getVideoEndpointConfig(mode: GenerationMode): AIEndpointConfig {
  const config = getAIConfig();
  const key = VIDEO_MODE_MAP[mode];
  return config.video[key];
}

export function getImageEndpointConfig(mode: ImageGenerationMode): AIEndpointConfig {
  const config = getAIConfig();
  const key = IMAGE_MODE_MAP[mode];
  return config.image[key];
}

export function getDeepSeekConfig(): DeepSeekConfig {
  return getAIConfig().deepseek;
}
