# 图片生成工作台 Spec

## Why
当前系统仅有视频生成功能，缺少首图/尾图的AI图片生成能力。根据业务需求，广告视频的首帧和尾帧需要通过AI图片生成。图片生成需要与现有的KeyFrame、Shot类型和appStore深度整合，避免产生孤立的数据结构。

## What Changes
- 在现有 `src/types/generation.ts` 中追加图片生成类型定义
- 创建 `src/services/imageGeneration.ts`，支持四种即梦图片API
- 创建 `src/services/imageMockAdapter.ts`，模拟图片生成API
- **复用并扩展现有 `useAppStore`**，而非创建独立store，确保与KeyFrame、Shot数据整合
- 新增图片生成工作台页面 `/content/image-generation`
- 新增图片生成历史页面 `/content/image-generation-history`
- 图片生成结果自动创建为 KeyFrame 记录，并关联到 Shot
- 更新路由和侧边栏导航

## Impact
- 影响能力：内容创作模块 - 新增图片生成能力，与首图/尾图管理深度整合
- 影响代码：
  - 新增：types/generation.ts（追加）、services/imageGeneration.ts、services/imageMockAdapter.ts、pages/content/ImageGeneration.tsx、pages/content/ImageGenerationHistory.tsx
  - 修改：store/appStore.ts（添加图片生成任务管理）、App.tsx、Sidebar.tsx

## ADDED Requirements

### Requirement: 支持的图片生成API

系统 SHALL 支持以下四种图片生成接口：

| 接口名称 | req_key | 功能 | 输入 | 输出 |
|---------|---------|------|------|------|
| 图片生成4.0 | `jimeng_t2i_v40` | 文生图、图生图、多图组合 | 0-10张图+prompt | 最多15张图 |
| 图片生成4.6 | `jimeng_seedream46_cvtob` | 人像写真、平面设计、风格化 | 0-14张图+prompt | 最多15张图 |
| 智能超清 | `jimeng_i2i_seed3_tilesr_cvtob` | 图像超清到4K/8K | 1张图 | 1张超清图 |
| 交互编辑inpainting | `i2i_inpainting_edit` | 涂抹编辑、局部重绘 | 1张图+mask+prompt | 最多4张图 |

### Requirement: 图片生成模式

系统 SHALL 支持五种图片生成模式：

| 模式 | 对应API | 输入图片数 | 典型用途 |
|------|---------|-----------|---------|
| 文生图 | 图片4.0 | 0 | 从零生成首图/尾图 |
| 图生图 | 图片4.0 | 1-10张 | 基于参考图生成 |
| 风格化编辑 | 图片4.6 | 1-14张 | 人像写真、平面设计、风格化特效 |
| 智能超清 | 智能超清 | 1张 | 将生成图片提升到4K/8K |
| 局部重绘 | inpainting | 1张+mask | 修改图片局部内容 |

### Requirement: 与现有系统整合

**关键：图片生成结果直接创建为 KeyFrame 记录**

系统 SHALL：
1. 图片生成任务完成后，根据返回的图片URL数组，为**每张图片**创建一个 KeyFrame 记录
2. KeyFrame 的 `modelName` 设置为接口名称（如 "即梦图片4.0"），`modelVersion` 设置为版本号
3. KeyFrame 的 `promptText` 设置为生成时使用的 prompt
4. KeyFrame 的 `type` 由用户在生成时选择（Opening/Ending）
5. KeyFrame 的 `status` 设置为 'Completed'
6. 生成的 KeyFrame 关联到指定的 Shot（用户可选择目标镜头），自动更新 Shot 的 `firstFrameId` 或 `lastFrameId`

**与 appStore 整合：**
- 图片生成任务状态存储在 appStore 中（与现有数据统一管理）
- 生成的 KeyFrame 直接写入 appStore 的 keyFrames 数组
- 自动更新关联 Shot 的 firstFrameId/lastFrameId
- 无需创建独立的 imageGenerationStore

### Requirement: 图片生成任务类型定义

```typescript
// 在 src/types/generation.ts 中追加

export type ImageGenerationMode = 
  | 'text-to-image'          // 文生图
  | 'image-to-image'         // 图生图
  | 'stylization-edit'       // 风格化编辑（4.6）
  | 'super-resolution'       // 智能超清
  | 'inpainting';            // 局部重绘

export interface ImageGenerationTask extends BaseEntity {
  taskId: string;
  requestId: string;
  mode: ImageGenerationMode;
  reqKey: string;
  prompt: string;
  
  // 输入
  inputImageUrls: string[];        // 输入图片URL数组
  inputImageBase64: string[];      // 输入图片base64数组
  maskImageBase64?: string;        // inpainting模式的mask
  
  // 参数
  size?: number;                   // 面积（如4194304=2K）
  width?: number;
  height?: number;
  scale?: number;                  // 文本影响程度
  seed?: number;                   // 随机种子
  forceSingle?: boolean;           // 强制单图
  resolution?: '4k' | '8k';        // 智能超清专用
  
  // 输出
  outputImageUrls: string[];       // 生成的图片URL数组
  outputImageBase64: string[];     // 生成的图片base64数组
  keyFrameIds: UUID[];             // 创建的KeyFrame ID列表
  
  // 关联
  shotId?: UUID;                   // 关联的镜头ID
  frameType?: 'Opening' | 'Ending'; // 帧类型
  
  // 状态
  status: TaskQueueStatus;
  progress?: number;
  
  // 错误信息
  errorCode?: string;
  errorMessage?: string;
  
  // 耗时
  timeElapsed?: string;
  completedAt?: string;
}

// API相关类型
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
  data: { task_id: string };
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
```

### Requirement: 图片生成工作台页面 `/content/image-generation`

页面布局：

```
┌────────────────────────────────────────────────────────────┐
│  🎨 图片生成工作台                                         │
├────────────────────────────────────────────────────────────┤
│ ┌─ 模式选择 ─────────────────────────────────────────────┐ │
│  ● 文生图  ○ 图生图  ○ 风格化编辑  ○ 智能超清  ○ 局部重绘│ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌─ 帧类型 ───────────────────────────────────────────────┐ │
│  ● 首图(Opening)  ○ 尾图(Ending)                         │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌─ 关联镜头（可选）──────────────────────────────────────┐ │
│  [选择目标镜头 ▼]                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌─ 输入配置 ─────────────────────────────────────────────┐ │
│ │ [图片上传区域]（根据模式动态显示，支持拖拽）           │ │
│ │ 文生图：无                                             │ │
│ │ 图生图：1-10张参考图                                   │ │
│ │ 风格化编辑：1-14张参考图                               │ │
│ │ 智能超清：1张图                                        │ │
│ │ 局部重绘：1张图 + [绘制mask区域]                       │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌─ Prompt ───────────────────────────────────────────────┐ │
│ │ [_________________________] 85/800                     │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌─ 高级参数 ─────────────────────────────────────────────┐ │
│ │ 分辨率：○ 1K(1024×1024) ● 2K(2048×2048) ○ 4K(4096×4096)│ │
│ │ 宽高比：● 16:9  ○ 4:3  ○ 1:1  ○ 3:4  ○ 9:16  ○ 21:9   │ │
│ │ □ 强制单图（降低延迟）                                 │ │
│ │ Seed：● 随机  ○ 自定义 [________]                       │ │
│ │ Scale（文本影响程度）：[━━━━━━━●━━━━] 50               │ │
│ └────────────────────────────────────────────────────────┘ │
│                  [ 🚀 提交生成 ]                            │
│ ────────────────────────────────────────────────────────── │
│ ┌─ 生成中的任务 ─────────────────────────────────────────┐ │
│ │ [任务卡片1] [任务卡片2] ...                            │ │
│ └────────────────────────────────────────────────────────┘ │
│ ────────────────────────────────────────────────────────── │
│ ┌─ 本次生成结果 ─────────────────────────────────────────┐ │
│ │ [图片网格]（最近完成的任务的输出图片）                 │ │
│ │ 每张图片：[预览] [下载] [设为首帧▼] [设为尾帧▼]        │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Requirement: 图片生成历史页面 `/content/image-generation-history`

- 列表展示所有图片生成任务
- 搜索、状态筛选、模式筛选、分页
- 点击查看详情（任务参数、输出图片组）
- 图片预览和下载
- 重新关联到镜头功能

### Requirement: Mock适配器

模拟行为：
- 任务提交延迟1-3秒
- 状态流转：in_queue(1秒) → generating(3-8秒随机) → done
- 返回模拟图片URL数组（使用公开测试图片）
- 组图模式返回多张不同图片
- 模拟审核失败等错误场景

## MODIFIED Requirements

### Requirement: 路由配置
**修改文件**：src/App.tsx
- 新增路由：`/content/image-generation`
- 新增路由：`/content/image-generation-history`

### Requirement: 侧边栏导航
**修改文件**：src/components/Sidebar.tsx
- "内容创作"分组下新增：
  - "图片生成" → `/content/image-generation`
  - "图片历史" → `/content/image-generation-history`

### Requirement: appStore扩展
**修改文件**：src/store/appStore.ts
- 添加 imageTasks: ImageGenerationTask[]
- 添加图片生成任务的CRUD方法
- 添加 createKeyFramesFromImages(images, frameType, shotId, modelName, modelVersion, prompt) 方法
  - 为每张输出图片创建 KeyFrame 记录
  - 如果指定了shotId，自动更新Shot的firstFrameId或lastFrameId

## REMOVED Requirements
- 不创建独立的 imageGenerationStore，改为扩展现有 appStore 以确保数据整合
