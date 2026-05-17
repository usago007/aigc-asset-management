import { create } from 'zustand';
import type { Customer, Brand, Project, KeyFrame, Shot, Asset, GenerationVersion, Brief, Task, Review, Role, Member } from '@/types';
import type { ImageGenerationTask, ImageGenerationMode, TaskQueueStatus } from '@/types/generation';
import { generateUUID } from '@/utils/uuid';
import { showToast } from '@/utils/toast';
import {
  DEMO_DATASET,
  MOCK_IMAGE_TASKS,
  MOCK_VIDEO_TASKS,
  generateMembers,
} from '@/utils/mockData';
import { IMAGE_MODEL_NAMES, IMAGE_MODEL_VERSIONS, getImageReqKeyForMode, getImagePollInterval, getImageExpiryMs } from '@/services/imageGeneration';
import { startPolling, stopPolling } from '@/services/poller';
import { mockImageSubmitTask } from '@/services/imageMockAdapter';

interface AppState {
  customers: Customer[];
  brands: Brand[];
  projects: Project[];
  keyFrames: KeyFrame[];
  shots: Shot[];
  assets: Asset[];
  generationVersions: GenerationVersion[];
  briefs: Brief[];
  tasks: Task[];
  reviews: Review[];
  roles: Role[];
  members: Member[];
  imageTasks: ImageGenerationTask[];
  
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addBrand: (data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBrand: (id: string, data: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addKeyFrame: (data: Omit<KeyFrame, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateKeyFrame: (id: string, data: Partial<KeyFrame>) => void;
  deleteKeyFrame: (id: string) => void;
  
  addShot: (data: Omit<Shot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShot: (id: string, data: Partial<Shot>) => void;
  deleteShot: (id: string) => void;
  
  addAsset: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, data: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  addBrief: (data: Omit<Brief, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBrief: (id: string, data: Partial<Brief>) => void;
  deleteBrief: (id: string) => void;
  
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addReview: (data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;

  addRole: (data: Omit<Role, 'id' | 'createdAt'>) => void;
  updateRole: (id: string, data: Partial<Role>) => void;
  deleteRole: (id: string) => void;

  addMember: (data: Omit<Member, 'id' | 'joinedAt'>) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  toggleMemberStatus: (id: string) => void;

  createKeyFramesFromImages: (imageUrls: string[], frameType: 'Opening' | 'Ending', shotId: string | undefined, modelName: string, modelVersion: string, prompt: string) => string[];
  submitImageTask: (mode: ImageGenerationMode, params: { prompt: string; inputImageUrls: string[]; inputImageBase64: string[]; size?: number; width?: number; height?: number; scale?: number; seed?: number; forceSingle?: boolean; resolution?: '4k' | '8k'; projectId?: string; shotId?: string; frameType?: 'Opening' | 'Ending' }) => Promise<void>;
  retryImageTask: (taskId: string) => Promise<void>;
  cancelImageTask: (taskId: string) => void;
  deleteImageTask: (taskId: string) => void;
  updateImageTask: (taskId: string, data: Partial<ImageGenerationTask>) => void;
}

// Generate mock data
const _customers = DEMO_DATASET.customers;
const _brands = DEMO_DATASET.brands;
const _projects = DEMO_DATASET.projects;
const _shots = DEMO_DATASET.shots;
const _keyFrames = DEMO_DATASET.keyFrames;
const _imageTasks = MOCK_IMAGE_TASKS;
const _assets = DEMO_DATASET.assets;
const _generationVersions = DEMO_DATASET.generationVersions;
const _briefs = DEMO_DATASET.briefs;
const _tasks = DEMO_DATASET.tasks;
const _reviews = DEMO_DATASET.reviews;
const _roles = [
  { id: 'role-1', roleName: '超级管理员', permissions: ['*'], visibility: 'public' as const, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'role-2', roleName: '项目经理', permissions: ['project:*', 'task:*', 'brief:*'], visibility: 'client-safe' as const, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'role-3', roleName: '创意人员', permissions: ['project:read', 'task:*', 'asset:*', 'shot:*'], visibility: 'client-safe' as const, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'role-4', roleName: '审核人员', permissions: ['project:read', 'review:*', 'asset:read'], visibility: 'internal-only' as const, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'role-5', roleName: '客户', permissions: ['project:read', 'brief:read', 'review:*'], visibility: 'client-safe' as const, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'role-6', roleName: '访客', permissions: ['project:read', 'asset:read'], visibility: 'public' as const, createdAt: '2024-01-01T00:00:00.000Z' },
];

const _members = generateMembers(35, _roles.map(r => r.id));

export const useAppStore = create<AppState>((set, get) => ({
  customers: _customers,
  brands: _brands,
  projects: _projects,
  keyFrames: _keyFrames,
  shots: _shots,
  assets: _assets,
  generationVersions: _generationVersions,
  briefs: _briefs,
  tasks: _tasks,
  reviews: _reviews,
  roles: _roles,
  members: _members,

  addCustomer: (data) => set((state) => {
    const newItem: Customer = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '客户创建成功');
    return { customers: [...state.customers, newItem] };
  }),

  updateCustomer: (id, data) => set((state) => {
    showToast('success', '客户更新成功');
    return {
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    };
  }),

  deleteCustomer: (id) => set((state) => {
    showToast('success', '客户删除成功');
    return { customers: state.customers.filter((c) => c.id !== id) };
  }),

  addBrand: (data) => set((state) => {
    const newItem: Brand = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '品牌创建成功');
    return { brands: [...state.brands, newItem] };
  }),

  updateBrand: (id, data) => set((state) => {
    showToast('success', '品牌更新成功');
    return {
      brands: state.brands.map((b) =>
        b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
      ),
    };
  }),

  deleteBrand: (id) => set((state) => {
    showToast('success', '品牌删除成功');
    return { brands: state.brands.filter((b) => b.id !== id) };
  }),

  addProject: (data) => set((state) => {
    const newItem: Project = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '项目创建成功');
    return { projects: [...state.projects, newItem] };
  }),

  updateProject: (id, data) => set((state) => {
    showToast('success', '项目更新成功');
    return {
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    };
  }),

  deleteProject: (id) => set((state) => {
    showToast('success', '项目删除成功');
    return { projects: state.projects.filter((p) => p.id !== id) };
  }),

  addKeyFrame: (data) => set((state) => {
    const newItem: KeyFrame = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '首图/尾图创建成功');
    return { keyFrames: [...state.keyFrames, newItem] };
  }),

  updateKeyFrame: (id, data) => set((state) => {
    showToast('success', '首图/尾图更新成功');
    return {
      keyFrames: state.keyFrames.map((kf) =>
        kf.id === id ? { ...kf, ...data, updatedAt: new Date().toISOString() } : kf
      ),
    };
  }),

  deleteKeyFrame: (id) => set((state) => {
    showToast('success', '首图/尾图删除成功');
    return { keyFrames: state.keyFrames.filter((kf) => kf.id !== id) };
  }),

  addShot: (data) => set((state) => {
    const newItem: Shot = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '镜头创建成功');
    return { shots: [...state.shots, newItem] };
  }),

  updateShot: (id, data) => set((state) => {
    showToast('success', '镜头更新成功');
    return {
      shots: state.shots.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
      ),
    };
  }),

  deleteShot: (id) => set((state) => {
    showToast('success', '镜头删除成功');
    return { shots: state.shots.filter((s) => s.id !== id) };
  }),

  addAsset: (data) => set((state) => {
    const newItem: Asset = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '资产创建成功');
    return { assets: [...state.assets, newItem] };
  }),

  updateAsset: (id, data) => set((state) => {
    showToast('success', '资产更新成功');
    return {
      assets: state.assets.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      ),
    };
  }),

  deleteAsset: (id) => set((state) => {
    showToast('success', '资产删除成功');
    return { assets: state.assets.filter((a) => a.id !== id) };
  }),

  addBrief: (data) => set((state) => {
    const newItem: Brief = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '简报创建成功');
    return { briefs: [...state.briefs, newItem] };
  }),

  updateBrief: (id, data) => set((state) => {
    showToast('success', '简报更新成功');
    return {
      briefs: state.briefs.map((b) =>
        b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
      ),
    };
  }),

  deleteBrief: (id) => set((state) => {
    showToast('success', '简报删除成功');
    return { briefs: state.briefs.filter((b) => b.id !== id) };
  }),

  addTask: (data) => set((state) => {
    const newItem: Task = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '任务创建成功');
    return { tasks: [...state.tasks, newItem] };
  }),

  updateTask: (id, data) => set((state) => {
    showToast('success', '任务更新成功');
    return {
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
    };
  }),

  deleteTask: (id) => set((state) => {
    showToast('success', '任务删除成功');
    return { tasks: state.tasks.filter((t) => t.id !== id) };
  }),

  addReview: (data) => set((state) => {
    const newItem: Review = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    showToast('success', '审核创建成功');
    return { reviews: [...state.reviews, newItem] };
  }),

  updateReview: (id, data) => set((state) => {
    showToast('success', '审核更新成功');
    return {
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      ),
    };
  }),

  deleteReview: (id) => set((state) => {
    showToast('success', '审核删除成功');
    return { reviews: state.reviews.filter((r) => r.id !== id) };
  }),

  addRole: (data) => set((state) => {
    const newRole: Role = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    showToast('success', `角色 "${data.roleName}" 创建成功`);
    return { roles: [...state.roles, newRole] };
  }),

  updateRole: (id, data) => set((state) => {
    const role = state.roles.find(r => r.id === id);
    if (role) {
      showToast('success', `角色 "${data.roleName || role.roleName}" 更新成功`);
    }
    return {
      roles: state.roles.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    };
  }),

  deleteRole: (id) => set((state) => {
    const role = state.roles.find(r => r.id === id);
    if (role) {
      showToast('success', `角色 "${role.roleName}" 删除成功`);
    }
    return { roles: state.roles.filter((r) => r.id !== id) };
  }),

  addMember: (data) => set((state) => {
    const newMember: Member = {
      ...data,
      id: generateUUID(),
      joinedAt: new Date().toISOString(),
    };
    showToast('success', `成员 "${data.name}" 邀请成功`);
    return { members: [...state.members, newMember] };
  }),

  updateMember: (id, data) => set((state) => {
    const member = state.members.find(m => m.id === id);
    if (member) {
      showToast('success', `成员 "${data.name || member.name}" 更新成功`);
    }
    return {
      members: state.members.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    };
  }),

  deleteMember: (id) => set((state) => {
    const member = state.members.find(m => m.id === id);
    if (member) {
      showToast('success', `成员 "${member.name}" 已移除`);
    }
    return { members: state.members.filter((m) => m.id !== id) };
  }),

  toggleMemberStatus: (id) => set((state) => {
    const member = state.members.find(m => m.id === id);
    if (member) {
      const newStatus = member.status === 'active' ? 'disabled' : 'active';
      showToast('success', `成员 "${member.name}" 已${newStatus === 'active' ? '启用' : '禁用'}`);
      return {
        members: state.members.map((m) =>
          m.id === id ? { ...m, status: newStatus } : m
        ),
      };
    }
    return { members: state.members };
  }),

  imageTasks: _imageTasks,

  updateImageTask: (taskId, data) => set((state) => ({
    imageTasks: state.imageTasks.map((t) =>
      t.id === taskId ? { ...t, ...data } : t
    ),
  })),

  deleteImageTask: (taskId) => set((state) => {
    showToast('success', '图片生成任务已删除');
    return { imageTasks: state.imageTasks.filter((t) => t.id !== taskId) };
  }),

  createKeyFramesFromImages: (imageUrls, frameType, shotId, modelName, modelVersion, prompt) => {
    const createdIds: string[] = [];
    imageUrls.forEach((url, index) => {
      const now = new Date().toISOString();
      const keyFrame: KeyFrame = {
        id: generateUUID(),
        name: `${prompt.slice(0, 20)}_${index + 1}`,
        type: frameType,
        promptText: prompt,
        modelName,
        modelVersion,
        status: 'Completed',
        parentShotId: shotId || '',
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({ keyFrames: [...state.keyFrames, keyFrame] }));
      createdIds.push(keyFrame.id);
    });

    if (shotId) {
      set((state) => {
        const shot = state.shots.find((s) => s.id === shotId);
        if (!shot) return { shots: state.shots };
        const updateData: Partial<Shot> = {};
        if (frameType === 'Opening' && (!shot.firstFrameId || true)) {
          updateData.firstFrameId = createdIds[0];
        }
        if (frameType === 'Ending' && (!shot.lastFrameId || true)) {
          updateData.lastFrameId = createdIds[createdIds.length - 1];
        }
        if (Object.keys(updateData).length > 0) {
          return {
            shots: state.shots.map((s) =>
              s.id === shotId ? { ...s, ...updateData, updatedAt: new Date().toISOString() } : s
            ),
          };
        }
        return { shots: state.shots };
      });
    }

    showToast('success', `已创建 ${createdIds.length} 张${frameType === 'Opening' ? '首图' : '尾图'}`);
    return createdIds;
  },

  submitImageTask: async (mode, params) => {
    const reqKey = getImageReqKeyForMode(mode);
    const modelName = IMAGE_MODEL_NAMES[mode as ImageGenerationMode];
    const modelVersion = IMAGE_MODEL_VERSIONS[mode as ImageGenerationMode];
    const tempId = generateUUID();
    const now = new Date().toISOString();

    const newTask: ImageGenerationTask = {
      id: tempId,
      taskId: '',
      requestId: '',
      mode,
      reqKey,
      prompt: params.prompt,
      inputImageUrls: params.inputImageUrls,
      inputImageBase64: params.inputImageBase64,
      size: params.size,
      width: params.width,
      height: params.height,
      scale: params.scale,
      seed: params.seed ?? -1,
      forceSingle: params.forceSingle,
      resolution: params.resolution,
      outputImageUrls: [],
      outputImageBase64: [],
      keyFrameIds: [],
      projectId: params.projectId,
      shotId: params.shotId,
      frameType: params.frameType,
      status: 'submitting',
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ imageTasks: [...state.imageTasks, newTask] }));

    try {
      const response = await mockImageSubmitTask(mode, {
        reqKey,
        prompt: params.prompt,
        binary_data_base64: params.inputImageBase64.length > 0 ? params.inputImageBase64 : undefined,
        image_urls: params.inputImageUrls.length > 0 ? params.inputImageUrls : undefined,
        size: params.size,
        width: params.width,
        height: params.height,
        scale: params.scale,
        seed: params.seed,
        force_single: params.forceSingle,
        resolution: params.resolution,
      });

      const { updateImageTask } = get();
      updateImageTask(tempId, {
        taskId: response.data.task_id,
        requestId: response.request_id,
        status: 'in_queue',
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
          get().updateImageTask(tempId, { status: mappedStatus });
        },
        (result) => {
          const imageUrls = [
            'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048"><rect width="2048" height="2048" fill="hsl(200,70%,60%)"/><text x="1024" y="1030" text-anchor="middle" fill="white" font-size="40" font-family="sans-serif">Image A</text></svg>'),
            'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048"><rect width="2048" height="2048" fill="hsl(280,70%,60%)"/><text x="1024" y="1030" text-anchor="middle" fill="white" font-size="40" font-family="sans-serif">Image B</text></svg>'),
            'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048"><rect width="2048" height="2048" fill="hsl(120,70%,60%)"/><text x="1024" y="1030" text-anchor="middle" fill="white" font-size="40" font-family="sans-serif">Image C</text></svg>'),
          ].slice(0, params.forceSingle ? 1 : Math.floor(Math.random() * 2) + 1);

          const kfIds = get().createKeyFramesFromImages(
            imageUrls,
            params.frameType || 'Opening',
            params.shotId,
            modelName,
            modelVersion,
            params.prompt
          );

          const completedTime = new Date().toISOString();
          get().updateImageTask(tempId, {
            status: 'done',
            outputImageUrls: imageUrls,
            keyFrameIds: kfIds,
            progress: 100,
            completedAt: completedTime,
            tokensUsed: result.usage?.total_tokens ?? 0,
          });
          showToast('success', '图片生成完成');
        },
        (error) => {
          const failedTime = new Date().toISOString();
          get().updateImageTask(tempId, {
            status: 'failed',
            errorMessage: error,
            updatedAt: failedTime,
          });
          showToast('error', `图片生成失败: ${error}`);
        },
        true
      );
    } catch (_error) {
      const failedTime = new Date().toISOString();
      get().updateImageTask(tempId, {
        status: 'failed',
        errorMessage: '提交任务失败',
        updatedAt: failedTime,
      });
      showToast('error', '图片生成任务提交失败');
    }
  },

  retryImageTask: async (taskId) => {
    const task = get().imageTasks.find((t) => t.id === taskId);
    if (!task) {
      showToast('error', '任务不存在');
      return;
    }

    const modelName = IMAGE_MODEL_NAMES[task.mode as ImageGenerationMode];
    const modelVersion = IMAGE_MODEL_VERSIONS[task.mode as ImageGenerationMode];

    get().updateImageTask(taskId, {
      status: 'submitting',
      outputImageUrls: [],
      keyFrameIds: [],
      errorCode: undefined,
      errorMessage: undefined,
      progress: 0,
      completedAt: undefined,
    });

    stopPolling(taskId);

    try {
      const response = await mockImageSubmitTask(task.mode, {
        reqKey: task.reqKey,
        prompt: task.prompt,
        binary_data_base64: task.inputImageBase64.length > 0 ? task.inputImageBase64 : undefined,
        image_urls: task.inputImageUrls.length > 0 ? task.inputImageUrls : undefined,
        seed: task.seed,
        scale: task.scale,
        size: task.size,
        force_single: task.forceSingle,
        resolution: task.resolution,
      });

      get().updateImageTask(taskId, {
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
          get().updateImageTask(taskId, { status: mappedStatus });
        },
        (result) => {
          const imageUrls = [
            'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048"><rect width="2048" height="2048" fill="hsl(40,70%,60%)"/><text x="1024" y="1030" text-anchor="middle" fill="white" font-size="40" font-family="sans-serif">Image X</text></svg>'),
            'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048"><rect width="2048" height="2048" fill="hsl(340,70%,60%)"/><text x="1024" y="1030" text-anchor="middle" fill="white" font-size="40" font-family="sans-serif">Image Y</text></svg>'),
          ].slice(0, task.forceSingle ? 1 : 2);

          const kfIds = get().createKeyFramesFromImages(
            imageUrls,
            task.frameType || 'Opening',
            task.shotId,
            modelName,
            modelVersion,
            task.prompt
          );

          get().updateImageTask(taskId, {
            status: 'done',
            outputImageUrls: imageUrls,
            keyFrameIds: kfIds,
            progress: 100,
            completedAt: new Date().toISOString(),
            tokensUsed: result.usage?.total_tokens ?? 0,
          });
          showToast('success', '图片生成完成');
        },
        (error) => {
          get().updateImageTask(taskId, {
            status: 'failed',
            errorMessage: error,
          });
          showToast('error', `图片生成失败: ${error}`);
        },
        true
      );
    } catch (_error) {
      get().updateImageTask(taskId, {
        status: 'failed',
        errorMessage: '重试失败',
      });
      showToast('error', '图片生成重试失败');
    }
  },

  cancelImageTask: (taskId) => {
    stopPolling(taskId);
    get().updateImageTask(taskId, {
      status: 'cancelled',
      errorMessage: '已取消',
    });
    showToast('info', '任务已取消');
  },
}));
