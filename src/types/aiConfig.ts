import type { GenerationMode, ImageGenerationMode } from './generation';

export interface AIEndpointConfig {
  enabled: boolean;
  reqKey: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

export interface VideoAIConfig {
  textToVideo: AIEndpointConfig;
  imageToVideoFirst: AIEndpointConfig;
  imageToVideoFirstTail: AIEndpointConfig;
}

export interface ImageAIConfig {
  textToImage: AIEndpointConfig;
  imageToImage: AIEndpointConfig;
  stylizationEdit: AIEndpointConfig;
  superResolution: AIEndpointConfig;
  inpainting: AIEndpointConfig;
}

export interface DeepSeekConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface AIGeneralConfig {
  baseUrl: string;
  apiKey: string;
  appId: string;
  pollInterval: number;
  pollMaxAttempts: number;
  videoExpiryMs: number;
  imageExpiryMs: number;
}

export interface AIConfig {
  general: AIGeneralConfig;
  video: VideoAIConfig;
  image: ImageAIConfig;
  deepseek: DeepSeekConfig;
}

export type AIPresetEnv = 'development' | 'staging' | 'production';

const DEFAULT_ENDPOINT = (reqKey: string): AIEndpointConfig => ({
  enabled: true,
  reqKey,
  baseUrl: 'https://visual.volcengineapi.com',
  timeout: 30000,
  maxRetries: 3,
});

export function getDefaultAIConfig(): AIConfig {
  return {
    general: {
      baseUrl: 'https://visual.volcengineapi.com',
      apiKey: '',
      appId: '',
      pollInterval: 5000,
      pollMaxAttempts: 120,
      videoExpiryMs: 3600000,
      imageExpiryMs: 86400000,
    },
    video: {
      textToVideo: DEFAULT_ENDPOINT('jimeng_t2v_v30_1080'),
      imageToVideoFirst: DEFAULT_ENDPOINT('jimeng_i2v_first_v30_1080'),
      imageToVideoFirstTail: DEFAULT_ENDPOINT('jimeng_i2v_first_tail_v30_1080'),
    },
    image: {
      textToImage: DEFAULT_ENDPOINT('jimeng_t2i_v40'),
      imageToImage: DEFAULT_ENDPOINT('jimeng_t2i_v40'),
      stylizationEdit: DEFAULT_ENDPOINT('jimeng_seedream46_cvtob'),
      superResolution: DEFAULT_ENDPOINT('jimeng_i2i_seed3_tilesr_cvtob'),
      inpainting: DEFAULT_ENDPOINT('i2i_inpainting_edit'),
    },
    deepseek: {
      enabled: true,
      baseUrl: 'https://api.deepseek.com',
      apiKey: '',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 4096,
      timeout: 30000,
    },
  };
}

export const AI_PRESETS: Record<AIPresetEnv, { general: Partial<AIGeneralConfig> }> = {
  development: {
    general: { baseUrl: 'http://localhost:3000/api' },
  },
  staging: {
    general: { baseUrl: 'https://staging-api.volcengineapi.com' },
  },
  production: {
    general: { baseUrl: 'https://visual.volcengineapi.com' },
  },
};
