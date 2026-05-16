import { BaseEntity, UUID } from './index';

export type TaskQueueStatus = 'submitting' | 'in_queue' | 'generating' | 'done' | 'failed' | 'expired' | 'not_found';

export type GenerationMode = 'text-to-video' | 'image-to-video-first' | 'image-to-video-first-tail';

export interface VideoGenerationTask extends BaseEntity {
  taskId: string;
  requestId: string;
  mode: GenerationMode;
  reqKey: string;
  prompt: string;
  firstFrameUrl?: string;
  firstFrameBase64?: string;
  lastFrameUrl?: string;
  lastFrameBase64?: string;
  seed: number;
  frames: number;
  aspectRatio: string;
  shotId?: UUID;
  projectId?: UUID;
  status: TaskQueueStatus;
  progress?: number;
  videoUrl?: string;
  videoExpiresAt?: string;
  aigcMetaTagged: boolean;
  errorCode?: string;
  errorMessage?: string;
  timeElapsed?: string;
  completedAt?: string;
}

export interface SubmitTaskParams {
  reqKey: string;
  prompt: string;
  binary_data_base64?: string[];
  image_urls?: string[];
  seed?: number;
  frames?: number;
  aspect_ratio?: string;
}

export interface SubmitTaskResponse {
  code: number;
  data: {
    task_id: string;
  };
  message: string;
  request_id: string;
  time_elapsed?: string;
}

export interface TaskResultResponse {
  code: number;
  data: {
    video_url?: string;
    aigc_meta_tagged?: boolean;
    status: string;
  };
  message: string;
  request_id: string;
  time_elapsed?: string;
}

export type ImageGenerationMode =
  | 'text-to-image'
  | 'image-to-image'
  | 'stylization-edit'
  | 'super-resolution'
  | 'inpainting';

export interface ImageGenerationTask extends BaseEntity {
  taskId: string;
  requestId: string;
  mode: ImageGenerationMode;
  reqKey: string;
  prompt: string;
  inputImageUrls: string[];
  inputImageBase64: string[];
  maskImageBase64?: string;
  size?: number;
  width?: number;
  height?: number;
  scale?: number;
  seed?: number;
  forceSingle?: boolean;
  resolution?: '4k' | '8k';
  outputImageUrls: string[];
  outputImageBase64: string[];
  keyFrameIds: UUID[];
  shotId?: UUID;
  frameType?: 'Opening' | 'Ending';
  status: TaskQueueStatus;
  progress?: number;
  errorCode?: string;
  errorMessage?: string;
  timeElapsed?: string;
  completedAt?: string;
}

export interface ImageSubmitTaskParams {
  reqKey: string;
  prompt: string;
  image_urls?: string[];
  binary_data_base64?: string[];
  size?: number;
  width?: number;
  height?: number;
  scale?: number;
  seed?: number;
  force_single?: boolean;
  min_ratio?: number;
  max_ratio?: number;
  resolution?: '4k' | '8k';
}

export interface ImageSubmitTaskResponse {
  code: number;
  data: {
    task_id: string;
  };
  message: string;
  request_id: string;
  time_elapsed?: string;
}

export interface ImageTaskResultResponse {
  code: number;
  data: {
    image_urls?: string[];
    binary_data_base64?: string[];
    status: string;
  };
  message: string;
  request_id: string;
  time_elapsed?: string;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  aspectRatio?: number;
  width?: number;
  height?: number;
}
