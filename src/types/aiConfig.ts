import type { GenerationMode, ImageGenerationMode } from './generation';

export interface AIEndpointConfig {
  enabled: boolean;
  reqKey: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

export interface VideoAIConfig {
  video30Pro: AIEndpointConfig;
  video30: AIEndpointConfig;
  actionImitation: AIEndpointConfig;
  digitalHumanFast: AIEndpointConfig;
}

export interface ImageAIConfig {
  image40: AIEndpointConfig;
  textToImage31: AIEndpointConfig;
  textToImage30: AIEndpointConfig;
  imageToImage30: AIEndpointConfig;
  textToImage21: AIEndpointConfig;
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
      video30Pro: DEFAULT_ENDPOINT('jimeng_t2v_v30_pro'),
      video30: DEFAULT_ENDPOINT('jimeng_t2v_v30'),
      actionImitation: DEFAULT_ENDPOINT('jimeng_action_imitation'),
      digitalHumanFast: DEFAULT_ENDPOINT('jimeng_digital_human_fast'),
    },
    image: {
      image40: DEFAULT_ENDPOINT('jimeng_t2i_v40'),
      textToImage31: DEFAULT_ENDPOINT('jimeng_t2i_v31'),
      textToImage30: DEFAULT_ENDPOINT('jimeng_t2i_v30'),
      imageToImage30: DEFAULT_ENDPOINT('jimeng_i2i_v30'),
      textToImage21: DEFAULT_ENDPOINT('jimeng_t2i_v21'),
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
