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
  'text-to-video': 'video30Pro',
  'image-to-video-first': 'video30Pro',
  'image-to-video-first-tail': 'video30Pro',
  'action-imitation': 'actionImitation',
  'digital-human-fast': 'digitalHumanFast',
};

const IMAGE_MODE_MAP: Record<ImageGenerationMode, keyof import('@/types/aiConfig').ImageAIConfig> = {
  'text-to-image': 'image40',
  'image-to-image': 'image40',
  'text-to-image-31': 'textToImage31',
  'text-to-image-30': 'textToImage30',
  'text-to-image-21': 'textToImage21',
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
