import { create } from 'zustand';
import type { AIConfig, AIGeneralConfig, AIEndpointConfig, AIPresetEnv, DeepSeekConfig } from '@/types/aiConfig';
import type { GenerationMode, ImageGenerationMode } from '@/types/generation';
import { getDefaultAIConfig, AI_PRESETS } from '@/types/aiConfig';
import { getAIConfig as loadFromStorage, saveAIConfig, resetAIConfig } from '@/services/aiConfigService';

const VIDEO_MODE_KEYS: Record<GenerationMode, keyof import('@/types/aiConfig').VideoAIConfig> = {
  'text-to-video': 'textToVideo',
  'image-to-video-first': 'imageToVideoFirst',
  'image-to-video-first-tail': 'imageToVideoFirstTail',
};

const IMAGE_MODE_KEYS: Record<ImageGenerationMode, keyof import('@/types/aiConfig').ImageAIConfig> = {
  'text-to-image': 'textToImage',
  'image-to-image': 'imageToImage',
  'stylization-edit': 'stylizationEdit',
  'super-resolution': 'superResolution',
  'inpainting': 'inpainting',
};

interface AIConfigState {
  config: AIConfig;
  isLoaded: boolean;

  loadConfig(): void;
  updateGeneral(updates: Partial<AIGeneralConfig>): void;
  updateVideoEndpoint(mode: GenerationMode, updates: Partial<AIEndpointConfig>): void;
  updateImageEndpoint(mode: ImageGenerationMode, updates: Partial<AIEndpointConfig>): void;
  updateDeepSeek(updates: Partial<DeepSeekConfig>): void;
  resetToDefaults(): void;
  applyPreset(preset: AIPresetEnv): void;
  exportConfig(): string;
  importConfig(json: string): boolean;
}

export const useAIConfigStore = create<AIConfigState>((set, get) => ({
  config: getDefaultAIConfig(),
  isLoaded: false,

  loadConfig: () => {
    const config = loadFromStorage();
    set({ config, isLoaded: true });
  },

  updateGeneral: (updates) => {
    set((state) => {
      const newConfig = {
        ...state.config,
        general: { ...state.config.general, ...updates },
      };
      saveAIConfig(newConfig);
      return { config: newConfig };
    });
  },

  updateVideoEndpoint: (mode, updates) => {
    set((state) => {
      const key = VIDEO_MODE_KEYS[mode];
      const newConfig = {
        ...state.config,
        video: {
          ...state.config.video,
          [key]: { ...state.config.video[key], ...updates },
        },
      };
      saveAIConfig(newConfig);
      return { config: newConfig };
    });
  },

  updateImageEndpoint: (mode, updates) => {
    set((state) => {
      const key = IMAGE_MODE_KEYS[mode];
      const newConfig = {
        ...state.config,
        image: {
          ...state.config.image,
          [key]: { ...state.config.image[key], ...updates },
        },
      };
      saveAIConfig(newConfig);
      return { config: newConfig };
    });
  },

  updateDeepSeek: (updates) => {
    set((state) => {
      const newConfig = {
        ...state.config,
        deepseek: { ...state.config.deepseek, ...updates },
      };
      saveAIConfig(newConfig);
      return { config: newConfig };
    });
  },

  resetToDefaults: () => {
    const defaults = resetAIConfig();
    set({ config: defaults });
  },

  applyPreset: (preset) => {
    const presetConfig = AI_PRESETS[preset];
    if (!presetConfig) return;

    set((state) => {
      const newConfig = {
        ...state.config,
        general: { ...state.config.general, ...presetConfig.general },
      };
      saveAIConfig(newConfig);
      return { config: newConfig };
    });
  },

  exportConfig: () => {
    return JSON.stringify(get().config, null, 2);
  },

  importConfig: (json) => {
    try {
      const parsed = JSON.parse(json) as AIConfig;
      if (!parsed.general || !parsed.video || !parsed.image) {
        return false;
      }
      const defaults = getDefaultAIConfig();
      const merged: AIConfig = {
        general: { ...defaults.general, ...parsed.general },
        video: { ...defaults.video, ...parsed.video },
        image: { ...defaults.image, ...parsed.image },
        deepseek: { ...defaults.deepseek, ...(parsed.deepseek || {}) },
      };
      saveAIConfig(merged);
      set({ config: merged });
      return true;
    } catch {
      return false;
    }
  },
}));
