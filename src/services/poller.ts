import type { TaskResultResponse, ImageTaskResultResponse } from '@/types/generation';
import { queryTaskResult, VIDEO_API_CONFIG } from './videoGeneration';
import { queryImageTaskResult } from './imageGeneration';

export interface PollingTask {
  taskId: string;
  reqKey: string;
  intervalId: number;
  onUpdate: (result: TaskResultResponse | ImageTaskResultResponse) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

const activePollers = new Map<string, PollingTask>();

export function startPolling(
  taskId: string,
  reqKey: string,
  onUpdate: (result: TaskResultResponse | ImageTaskResultResponse) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  isImage: boolean = false
): void {
  const intervalId = setInterval(async () => {
    try {
      const result = isImage
        ? await queryImageTaskResult(taskId, reqKey)
        : await queryTaskResult(taskId, reqKey);

      switch (result.data.status) {
        case 'done':
          onUpdate(result);
          onComplete();
          stopPolling(taskId);
          break;
        case 'failed':
          onError(result.message || 'Task failed');
          stopPolling(taskId);
          break;
        case 'in_queue':
        case 'generating':
          onUpdate(result);
          break;
        case 'not_found':
        case 'expired':
          onError(result.message || `Task ${result.data.status}`);
          stopPolling(taskId);
          break;
        default:
          onUpdate(result);
          break;
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error');
      stopPolling(taskId);
    }
  }, VIDEO_API_CONFIG.POLL_INTERVAL);

  activePollers.set(taskId, {
    taskId,
    reqKey,
    intervalId,
    onUpdate,
    onComplete,
    onError,
  });
}

export function stopPolling(taskId: string): void {
  const poller = activePollers.get(taskId);
  if (poller) {
    clearInterval(poller.intervalId);
    activePollers.delete(taskId);
  }
}

export function stopAllPolling(): void {
  activePollers.forEach((poller) => {
    clearInterval(poller.intervalId);
  });
  activePollers.clear();
}

export function getActivePollerCount(): number {
  return activePollers.size;
}
