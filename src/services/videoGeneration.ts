import type {
  GenerationMode,
  SubmitTaskParams,
  SubmitTaskResponse,
  TaskResultResponse,
} from '@/types/generation';
import { mockSubmitTask, mockQueryTaskResult } from './mockAdapter';

export const VIDEO_API_CONFIG = {
  req_keys: {
    'text-to-video': 'jimeng_t2v_v30_1080',
    'image-to-video-first': 'jimeng_i2v_first_v30_1080',
    'image-to-video-first-tail': 'jimeng_i2v_first_tail_v30_1080',
  },
  BASE_URL: 'https://visual.volcengineapi.com',
  POLL_INTERVAL: 5000,
  VIDEO_EXPIRY_MS: 3600000,
};

export function getReqKeyForMode(mode: GenerationMode): string {
  return VIDEO_API_CONFIG.req_keys[mode];
}

export async function submitVideoTask(
  mode: GenerationMode,
  params: Omit<SubmitTaskParams, 'reqKey'>
): Promise<SubmitTaskResponse> {
  const reqKey = getReqKeyForMode(mode);
  return mockSubmitTask(mode, { ...params, reqKey });
}

export async function queryTaskResult(
  taskId: string,
  reqKey: string
): Promise<TaskResultResponse> {
  return mockQueryTaskResult(taskId);
}
