import type {
  GenerationMode,
  SubmitTaskParams,
  SubmitTaskResponse,
  TaskResultResponse,
} from '@/types/generation';
import { getBeautyLibraryPosterFromKey } from '@/utils/mediaLibrary';

interface MockTaskStoreEntry {
  status: string;
  startTime: number;
  simulateFail: boolean;
  totalDuration: number;
}

const mockTaskStore = new Map<string, MockTaskStoreEntry>();

export interface MockTaskConfig {
  simulateFail?: boolean;
  failCode?: number;
}

export function generateMockTaskId(): string {
  return '7' + Math.floor(Math.random() * 1000000000000);
}

export async function mockSubmitTask(
  mode: GenerationMode,
  params: SubmitTaskParams
): Promise<SubmitTaskResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  const taskId = generateMockTaskId();
  const totalDuration = 3000 + Math.random() * 12000;

  mockTaskStore.set(taskId, {
    status: 'in_queue',
    startTime: Date.now(),
    simulateFail: false,
    totalDuration,
  });

  return {
    code: 200,
    data: {
      task_id: taskId,
    },
    message: 'success',
    request_id: `req-${generateMockTaskId()}`,
    time_elapsed: '1.2s',
    usage: { total_tokens: 0 },
  };
}

export async function mockQueryTaskResult(taskId: string): Promise<TaskResultResponse> {
  const task = mockTaskStore.get(taskId);

  if (!task) {
    return {
      code: 404,
      data: {
        status: 'not_found',
      },
      message: 'Task not found',
      request_id: `req-${generateMockTaskId()}`,
    };
  }

  const elapsed = Date.now() - task.startTime;

  if (task.simulateFail) {
    const failCode = elapsed > 2000 ? 50411 : 50413;
    return {
      code: failCode,
      data: {
        status: 'failed',
      },
      message: failCode === 50411 ? 'Gateway timeout' : 'Request rejected',
      request_id: `req-${generateMockTaskId()}`,
    };
  }

  if (elapsed < 2000) {
    return {
      code: 200,
      data: {
        status: 'in_queue',
      },
      message: 'success',
      request_id: `req-${generateMockTaskId()}`,
      time_elapsed: `${(elapsed / 1000).toFixed(1)}s`,
    };
  }

  if (elapsed < task.totalDuration) {
    const progress = Math.min(((elapsed - 2000) / (task.totalDuration - 2000)) * 100, 99);
    return {
      code: 200,
      data: {
        status: 'generating',
      },
      message: 'success',
      request_id: `req-${generateMockTaskId()}`,
      time_elapsed: `${(elapsed / 1000).toFixed(1)}s`,
    };
  }

  return {
    code: 200,
    data: {
      status: 'done',
      video_url: getBeautyLibraryPosterFromKey(taskId),
      aigc_meta_tagged: true,
    },
    message: 'success',
    request_id: `req-${generateMockTaskId()}`,
    time_elapsed: `${(elapsed / 1000).toFixed(1)}s`,
    usage: { total_tokens: Math.floor(1000 + Math.random() * 4000) },
  };
}
