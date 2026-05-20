import type {
  GenerationMode,
  SubmitTaskParams,
  SubmitTaskResponse,
  TaskResultResponse,
} from '@/types/generation';
import { mockSubmitTask, mockQueryTaskResult } from './mockAdapter';
import { getVideoReqKey, getAIConfig } from './aiConfigService';

export function getReqKeyForMode(mode: GenerationMode): string {
  return getVideoReqKey(mode);
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

export function getPollInterval(): number {
  return getAIConfig().general.pollInterval;
}
