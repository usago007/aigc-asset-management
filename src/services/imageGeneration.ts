import type { ImageGenerationMode, ImageSubmitTaskParams, ImageSubmitTaskResponse, ImageTaskResultResponse } from '@/types/generation';
import { mockImageSubmitTask, mockImageQueryTaskResult } from './imageMockAdapter';

export const IMAGE_API_CONFIG = {
  BASE_URL: 'https://visual.volcengineapi.com',
  POLL_INTERVAL: 5000,
  IMAGE_EXPIRY_MS: 86400000,
  req_keys: {
    'text-to-image': 'jimeng_t2i_v40',
    'image-to-image': 'jimeng_t2i_v40',
    'stylization-edit': 'jimeng_seedream46_cvtob',
    'super-resolution': 'jimeng_i2i_seed3_tilesr_cvtob',
    'inpainting': 'i2i_inpainting_edit',
  } as Record<ImageGenerationMode, string>,
  model_names: {
    'text-to-image': '即梦图片4.0',
    'image-to-image': '即梦图片4.0',
    'stylization-edit': '即梦图片4.6',
    'super-resolution': '即梦智能超清',
    'inpainting': '即梦交互编辑',
  } as Record<ImageGenerationMode, string>,
  model_versions: {
    'text-to-image': 'v4.0',
    'image-to-image': 'v4.0',
    'stylization-edit': 'v4.6',
    'super-resolution': 'v3.0',
    'inpainting': 'v1.0',
  } as Record<ImageGenerationMode, string>,
};

export function getReqKeyForMode(mode: ImageGenerationMode): string {
  return IMAGE_API_CONFIG.req_keys[mode] || IMAGE_API_CONFIG.req_keys['text-to-image'];
}

export async function submitImageTask(mode: ImageGenerationMode, params: Omit<ImageSubmitTaskParams, 'reqKey'>): Promise<ImageSubmitTaskResponse> {
  const reqKey = getReqKeyForMode(mode);
  return mockImageSubmitTask(mode, { ...params, reqKey });
}

export async function queryImageTaskResult(taskId: string, _reqKey: string): Promise<ImageTaskResultResponse> {
  return mockImageQueryTaskResult(taskId);
}
