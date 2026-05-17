export type UUID = string;

export type GenerationStatus = 'Pending' | 'Completed' | 'Failed';
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed';
export type TaskType = '生成' | '审核' | '交付';
export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';
export type ReviewType = 'Internal' | 'Client';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ProjectStage = 'Planning' | 'InProduction' | 'Review' | 'Completed';
export type Visibility = 'internal-only' | 'client-safe' | 'public';

export interface BaseEntity {
  id: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface KeyFrame extends BaseEntity {
  name: string;
  type: 'Opening' | 'Ending';
  promptText: string;
  modelName: string;
  modelVersion: string;
  status: GenerationStatus;
  parentShotId: UUID;
}

export interface GenerationVersion extends BaseEntity {
  keyFrameId: UUID;
  modelName: string;
  modelVersion: string;
  versionNumber: number;
  status: GenerationStatus;
  isSelected: boolean;
  generatedAt: string;
}

export interface Shot extends BaseEntity {
  shotName: string;
  projectId: UUID;
  firstFrameId: UUID | null;
  lastFrameId: UUID | null;
  finalVideoTaskId: UUID | null;
  promptId: string;
  modelName: string;
  modelVersion: string;
}

export interface ProjectShotSlot extends BaseEntity {
  projectId: UUID;
  shotId: UUID | null;
  position: number;
}

export interface Asset extends BaseEntity {
  assetName: string;
  type: 'Image' | 'Video' | 'Script';
  projectId?: UUID;
  shotId?: UUID;
  sourceType: 'image-task' | 'video-task' | 'script';
  sourceTaskId?: UUID;
  sourceResultIndex?: number;
  promptId: string;
  modelName: string;
  modelVersion: string;
  parentAssetIds: UUID[];
  fileUrl: string;
}

export interface Customer extends BaseEntity {
  customerName: string;
  contactPerson: string;
  roles: string[];
  notes: string;
}

export interface Brand extends BaseEntity {
  brandName: string;
  customerId: UUID;
  owner: string;
  notes: string;
}

export interface Project extends BaseEntity {
  projectName: string;
  brandId: UUID;
  projectOwner: string;
  progress: number;
  stage: ProjectStage;
  riskLevel: RiskLevel;
  pendingReviews: number;
}

export interface Brief extends BaseEntity {
  briefTitle: string;
  projectId: UUID;
  description: string;
  targetAudience: string;
  platform: string;
  deadline: string;
  fileUrl: string;
  currentVersionId: UUID | null;
}

export interface Task extends BaseEntity {
  taskName: string;
  projectId: UUID;
  assignedTo: string;
  status: TaskStatus;
  type: TaskType;
  deadline: string;
  notes: string;
}

export interface Review extends BaseEntity {
  targetId: UUID;
  targetType: 'Asset' | 'Shot' | 'Brief';
  reviewer: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  notes: string;
}

export interface Role {
  id: UUID;
  roleName: string;
  permissions: string[];
  visibility: Visibility;
  createdAt: string;
}

export type MemberStatus = 'active' | 'disabled' | 'pending';

export interface Member {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  roleIds: string[];
  department: string;
  status: MemberStatus;
  lastLoginAt: string;
  joinedAt: string;
  invitedBy: string;
}

export interface ToastMessage {
  id: UUID;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
