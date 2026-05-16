import type { ImageGenerationMode, ImageSubmitTaskParams, ImageSubmitTaskResponse, ImageTaskResultResponse } from '@/types/generation';
import { mockImageSubmitTask, mockImageQueryTaskResult } from './imageMockAdapter';
import { getImageReqKey, getAIConfig } from './aiConfigService';

export const IMAGE_MODEL_NAMES: Record<ImageGenerationMode, string> = {
  'text-to-image': '即梦图片4.0',
  'image-to-image': '即梦图片4.0',
  'stylization-edit': '即梦图片4.6',
  'super-resolution': '即梦智能超清',
  'inpainting': '即梦交互编辑',
};

export const IMAGE_MODEL_VERSIONS: Record<ImageGenerationMode, string> = {
  'text-to-image': 'v4.0',
  'image-to-image': 'v4.0',
  'stylization-edit': 'v4.6',
  'super-resolution': 'v3.0',
  'inpainting': 'v1.0',
};

export function getImageReqKeyForMode(mode: ImageGenerationMode): string {
  return getImageReqKey(mode);
}

export async function submitImageTask(mode: ImageGenerationMode, params: Omit<ImageSubmitTaskParams, 'reqKey'>): Promise<ImageSubmitTaskResponse> {
  const reqKey = getImageReqKeyForMode(mode);
  return mockImageSubmitTask(mode, { ...params, reqKey });
}

export async function queryImageTaskResult(taskId: string, _reqKey: string): Promise<ImageTaskResultResponse> {
  return mockImageQueryTaskResult(taskId);
}

export function getImagePollInterval(): number {
  return getAIConfig().general.pollInterval;
}

export function getImageExpiryMs(): number {
  return getAIConfig().general.imageExpiryMs;
}
