import type { ImageGenerationMode, ImageSubmitTaskParams, ImageSubmitTaskResponse, ImageTaskResultResponse } from '@/types/generation';

interface MockImageTask {
  status: string;
  startTime: number;
  simulateFail: boolean;
  failCode?: number;
  failMessage?: string;
  totalDuration: number;
  outputCount: number;
}

const mockImageStore = new Map<string, MockImageTask>();

const MOCK_IMAGE_URLS = [
  'https://picsum.photos/seed/aigc1/1024/1024',
  'https://picsum.photos/seed/aigc2/1024/1024',
  'https://picsum.photos/seed/aigc3/1024/1024',
  'https://picsum.photos/seed/aigc4/1024/1024',
  'https://picsum.photos/seed/aigc5/1024/1024',
  'https://picsum.photos/seed/aigc6/1024/1024',
];

export function generateMockImageTaskId(): string {
  return '7' + Math.random().toString().slice(2, 19);
}

export interface MockImageTaskConfig {
  simulateFail?: boolean;
  failCode?: number;
  failMessage?: string;
  outputCount?: number;
}

export async function mockImageSubmitTask(
  _mode: ImageGenerationMode,
  params: ImageSubmitTaskParams & MockImageTaskConfig
): Promise<ImageSubmitTaskResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  const taskId = generateMockImageTaskId();
  const requestId = 'IMG-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

  const outputCount = params.outputCount ?? (params.force_single ? 1 : Math.floor(Math.random() * 3) + 1);

  mockImageStore.set(taskId, {
    status: 'in_queue',
    startTime: Date.now(),
    simulateFail: params.simulateFail || false,
    failCode: params.failCode || 50411,
    failMessage: params.failMessage || 'Pre Img Risk Not Pass',
    totalDuration: 3000 + Math.random() * 5000,
    outputCount: Math.min(outputCount, 6),
  });

  return {
    code: 10000,
    data: { task_id: taskId },
    message: 'Success',
    request_id: requestId,
    time_elapsed: '105.234ms',
  };
}

export async function mockImageQueryTaskResult(taskId: string): Promise<ImageTaskResultResponse> {
  const task = mockImageStore.get(taskId);
  if (!task) {
    return {
      code: 10000,
      data: { status: 'not_found' },
      message: 'Task not found',
      request_id: 'IMG-QUERY-' + Date.now(),
    };
  }

  const elapsed = Date.now() - task.startTime;

  if (task.simulateFail && elapsed > 1000) {
    return {
      code: task.failCode || 50411,
      data: { status: 'done' },
      message: task.failMessage || 'Risk Not Pass',
      request_id: 'IMG-FAIL-' + Date.now(),
      time_elapsed: elapsed.toFixed(3) + 'ms',
    };
  }

  if (elapsed < 1000) {
    return {
      code: 10000,
      data: { status: 'in_queue' },
      message: 'Success',
      request_id: 'IMG-POLL-' + Date.now(),
      time_elapsed: '5.123ms',
    };
  }

  if (elapsed < task.totalDuration) {
    return {
      code: 10000,
      data: { status: 'generating' },
      message: 'Success',
      request_id: 'IMG-POLL-' + Date.now(),
      time_elapsed: '5.123ms',
    };
  }

  const count = task.outputCount;
  const urls = MOCK_IMAGE_URLS.slice(0, count);

  return {
    code: 10000,
    data: {
      image_urls: urls,
      status: 'done',
    },
    message: 'Success',
    request_id: 'IMG-DONE-' + Date.now(),
    time_elapsed: elapsed.toFixed(3) + 'ms',
  };
}
