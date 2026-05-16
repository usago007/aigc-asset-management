import { create } from 'zustand';
import type { VideoGenerationTask, TaskQueueStatus, SubmitTaskParams, GenerationMode } from '@/types/generation';
import { getReqKeyForMode, getVideoExpiryMs } from '@/services/videoGeneration';
import { generateUUID } from '@/utils/uuid';
import { showToast } from '@/utils/toast';
import { startPolling, stopPolling } from '@/services/poller';
import { mockSubmitTask } from '@/services/mockAdapter';
import { generateVideoTasks } from '@/utils/mockData';

const _videoTasks = generateVideoTasks(35);

interface GenerationState {
  tasks: VideoGenerationTask[];
  addTask: (task: Omit<VideoGenerationTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<VideoGenerationTask>) => void;
  deleteTask: (taskId: string) => void;
  submitTask: (mode: GenerationMode, params: Omit<SubmitTaskParams, 'reqKey'>) => Promise<void>;
  retryTask: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => void;
  checkExpiringVideos: () => void;
}

const EXPIRY_WARNING_MS = 600000;

export const useGenerationStore = create<GenerationState>((set, get) => ({
  tasks: _videoTasks,

  addTask: (task) =>
    set((state) => {
      const now = new Date().toISOString();
      const newTask: VideoGenerationTask = {
        ...task,
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      };
      showToast('success', '视频生成任务已创建');
      return { tasks: [...state.tasks, newTask] };
    }),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => {
      showToast('success', '任务已删除');
      return { tasks: state.tasks.filter((t) => t.id !== taskId) };
    }),

  submitTask: async (mode, params) => {
    const reqKey = getReqKeyForMode(mode);

    const tempId = generateUUID();
    const now = new Date().toISOString();

    const newTask: VideoGenerationTask = {
      id: tempId,
      taskId: '',
      requestId: '',
      mode,
      reqKey,
      prompt: params.prompt,
      firstFrameUrl: params.image_urls?.[0],
      firstFrameBase64: params.binary_data_base64?.[0],
      seed: params.seed ?? -1,
      frames: params.frames ?? 121,
      aspectRatio: params.aspect_ratio ?? '16:9',
      status: 'submitting',
      progress: 0,
      aigcMetaTagged: false,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));

    try {
      const response = await mockSubmitTask(mode, { ...params, reqKey });

      const completedAt = new Date().toISOString();

      get().updateTask(tempId, {
        taskId: response.data.task_id,
        requestId: response.request_id,
        status: 'in_queue',
        updatedAt: completedAt,
      });

      startPolling(
        tempId,
        reqKey,
        (result) => {
          const statusMap: Record<string, TaskQueueStatus> = {
            in_queue: 'in_queue',
            generating: 'generating',
          };
          const mappedStatus = statusMap[result.data.status] || result.data.status as TaskQueueStatus;
          get().updateTask(tempId, { status: mappedStatus });
        },
        (result) => {
          const completedTime = new Date().toISOString();
          const expiresAt = new Date(Date.now() + getVideoExpiryMs()).toISOString();
          get().updateTask(tempId, {
            status: 'done',
            videoUrl: '',
            videoExpiresAt: expiresAt,
            aigcMetaTagged: true,
            progress: 100,
            completedAt: completedTime,
            updatedAt: completedTime,
            tokensUsed: result.usage?.total_tokens ?? 0,
          });
          showToast('success', '视频生成完成');
        },
        (error) => {
          const failedTime = new Date().toISOString();
          get().updateTask(tempId, {
            status: 'failed',
            errorMessage: error,
            updatedAt: failedTime,
          });
          showToast('error', `视频生成失败: ${error}`);
        }
      );
    } catch (error) {
      const failedTime = new Date().toISOString();
      get().updateTask(tempId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : '提交任务失败',
        updatedAt: failedTime,
      });
      showToast('error', '视频生成任务提交失败');
    }
  },

  retryTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) {
      showToast('error', '任务不存在');
      return;
    }

    get().updateTask(taskId, {
      status: 'submitting',
      videoUrl: undefined,
      videoExpiresAt: undefined,
      errorCode: undefined,
      errorMessage: undefined,
      progress: 0,
      completedAt: undefined,
    });

    stopPolling(taskId);

    try {
      const response = await mockSubmitTask(task.mode, {
        prompt: task.prompt,
        binary_data_base64: task.firstFrameBase64 ? [task.firstFrameBase64] : undefined,
        image_urls: task.firstFrameUrl ? [task.firstFrameUrl] : undefined,
        seed: task.seed,
        frames: task.frames,
        aspect_ratio: task.aspectRatio,
        reqKey: task.reqKey,
      });

      get().updateTask(taskId, {
        taskId: response.data.task_id,
        requestId: response.request_id,
        status: 'in_queue',
      });

      startPolling(
        taskId,
        task.reqKey,
        (result) => {
          const statusMap: Record<string, TaskQueueStatus> = {
            in_queue: 'in_queue',
            generating: 'generating',
          };
          const mappedStatus = statusMap[result.data.status] || result.data.status as TaskQueueStatus;
          get().updateTask(taskId, { status: mappedStatus });
        },
        (result) => {
          const completedTime = new Date().toISOString();
          const expiresAt = new Date(Date.now() + getVideoExpiryMs()).toISOString();
          get().updateTask(taskId, {
            status: 'done',
            videoUrl: '',
            videoExpiresAt: expiresAt,
            aigcMetaTagged: true,
            progress: 100,
            completedAt: completedTime,
            updatedAt: completedTime,
            tokensUsed: result.usage?.total_tokens ?? 0,
          });
          showToast('success', '视频生成完成');
        },
        (error) => {
          const failedTime = new Date().toISOString();
          get().updateTask(taskId, {
            status: 'failed',
            errorMessage: error,
            updatedAt: failedTime,
          });
          showToast('error', `视频生成失败: ${error}`);
        }
      );
    } catch (error) {
      const failedTime = new Date().toISOString();
      get().updateTask(taskId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : '重试任务失败',
        updatedAt: failedTime,
      });
      showToast('error', '视频生成任务重试失败');
    }
  },

  cancelTask: (taskId) => {
    stopPolling(taskId);
    get().updateTask(taskId, {
      status: 'failed',
      errorMessage: '已取消',
    });
    showToast('info', '任务已取消');
  },

  checkExpiringVideos: () => {
    const { tasks, updateTask } = get();
    const now = Date.now();

    tasks.forEach((task) => {
      if (task.status === 'done' && task.videoUrl && task.videoExpiresAt) {
        const expiresAt = new Date(task.videoExpiresAt).getTime();
        const timeRemaining = expiresAt - now;

        if (timeRemaining <= 0) {
          updateTask(task.id, { status: 'expired' });
          showToast('warning', `视频已过期: ${task.prompt}`);
        } else if (timeRemaining <= EXPIRY_WARNING_MS) {
          const minutes = Math.ceil(timeRemaining / 60000);
          showToast('warning', `视频将在 ${minutes} 分钟后过期: ${task.prompt}`);
        }
      }
    });
  },
}));
