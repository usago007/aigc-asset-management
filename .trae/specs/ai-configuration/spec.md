# AI能力配置 Spec

## Why

当前系统的 AI 图片生成和视频生成 API 配置（BASE_URL、req_keys、超时时间等）全部硬编码在 `services/imageGeneration.ts` 和 `services/videoGeneration.ts` 中，无法在运行时动态修改。管理员需要进入系统设置页面统一管理所有 AI 能力的 API 地址、认证密钥、超时参数和轮询策略，支持多环境切换和生产部署。

## What Changes

- 新建 AI 配置存储层（持久化到 localStorage），定义完整的 AI 能力配置数据结构
- 在系统设置页面新增"AI 能力配置"选项卡
- 视频生成 API 配置（文生视频、首帧图生视频、首尾帧图生视频）
- 图片生成 API 配置（文生图/图生图4.0、图片4.6、智能超清、交互编辑）
- 通用 AI 配置（BASE_URL、认证密钥、超时、轮询间隔）
- 修改 videoGeneration.ts 和 imageGeneration.ts 从配置层读取而非硬编码
- 多环境配置预设（开发/测试/生产）
- **BREAKING**: 移除 videoGeneration.ts 和 imageGeneration.ts 中的硬编码配置常量

## Impact

- 影响能力：系统设置模块 - 新增 AI 能力配置管理能力
- 影响代码：
  - 新增：types/aiConfig.ts、services/aiConfigService.ts、store/aiConfigStore.ts
  - 修改：pages/system/Settings.tsx、services/videoGeneration.ts、services/imageGeneration.ts
  - 修改：tailwind.config.js（添加 tabs 组件相关主题扩展）

## ADDED Requirements

### Requirement: AI 配置数据结构

系统 SHALL 定义以下 AI 配置类型：

```typescript
// src/types/aiConfig.ts

export interface AIEndpointConfig {
  enabled: boolean;           // 是否启用该接口
  reqKey: string;             // API req_key
  baseUrl: string;            // API 基础地址
  timeout: number;            // 请求超时（毫秒）
  maxRetries: number;         // 最大重试次数
}

export interface VideoAIConfig {
  textToVideo: AIEndpointConfig;
  imageToVideoFirst: AIEndpointConfig;
  imageToVideoFirstTail: AIEndpointConfig;
}

export interface ImageAIConfig {
  textToImage: AIEndpointConfig;        // 即梦图片4.0
  imageToImage: AIEndpointConfig;       // 即梦图片4.0
  stylizationEdit: AIEndpointConfig;    // 即梦图片4.6
  superResolution: AIEndpointConfig;    // 即梦智能超清
  inpainting: AIEndpointConfig;         // 即梦交互编辑
}

export interface AIGeneralConfig {
  baseUrl: string;             // 全局基础 URL
  apiKey: string;              // API 认证密钥
  appId: string;               // 应用 ID
  pollInterval: number;        // 轮询间隔（毫秒）
  pollMaxAttempts: number;     // 轮询最大尝试次数
  videoExpiryMs: number;       // 视频 URL 过期时间（毫秒）
  imageExpiryMs: number;       // 图片 URL 过期时间（毫秒）
}

export interface AIConfig {
  general: AIGeneralConfig;
  video: VideoAIConfig;
  image: ImageAIConfig;
}
```

#### 场景：配置数据结构定义
- **WHEN** 定义 AI 配置类型
- **THEN** 包含 general/video/image 三大模块，覆盖所有即梦 API 接口

### Requirement: AI 配置默认值

系统 SHALL 提供默认配置，与现有硬编码值一致：

| 配置项 | 默认值 | 来源 |
|--------|--------|------|
| general.baseUrl | `https://visual.volcengineapi.com` | videoGeneration.ts |
| general.pollInterval | `5000` | 两处均有 |
| general.videoExpiryMs | `3600000` (1小时) | videoGeneration.ts |
| general.imageExpiryMs | `86400000` (24小时) | imageGeneration.ts |
| video.textToVideo.reqKey | `jimeng_t2v_v30_1080` | videoGeneration.ts |
| video.imageToVideoFirst.reqKey | `jimeng_i2v_first_v30_1080` | videoGeneration.ts |
| video.imageToVideoFirstTail.reqKey | `jimeng_i2v_first_tail_v30_1080` | videoGeneration.ts |
| image.textToImage.reqKey | `jimeng_t2i_v40` | imageGeneration.ts |
| image.imageToImage.reqKey | `jimeng_t2i_v40` | imageGeneration.ts |
| image.stylizationEdit.reqKey | `jimeng_seedream46_cvtob` | imageGeneration.ts |
| image.superResolution.reqKey | `jimeng_i2i_seed3_tilesr_cvtob` | imageGeneration.ts |
| image.inpainting.reqKey | `i2i_inpainting_edit` | imageGeneration.ts |
| 通用 timeout | `30000` (30秒) | - |
| 通用 maxRetries | `3` | - |
| 通用 pollMaxAttempts | `120` (约10分钟) | - |

### Requirement: AI 配置服务层

系统 SHALL 提供 AI 配置读取和写入服务，支持 localStorage 持久化：

```typescript
// src/services/aiConfigService.ts

export const AI_CONFIG_STORAGE_KEY = 'ai_config';

// 获取当前 AI 配置（优先读取 localStorage，否则返回默认值）
export function getAIConfig(): AIConfig;

// 保存 AI 配置到 localStorage
export function saveAIConfig(config: AIConfig): void;

// 重置为默认配置
export function resetAIConfig(): AIConfig;

// 获取指定模式的 req_key
export function getVideoReqKey(mode: GenerationMode): string;
export function getImageReqKey(mode: ImageGenerationMode): string;

// 获取指定接口的完整配置
export function getVideoEndpointConfig(mode: GenerationMode): AIEndpointConfig;
export function getImageEndpointConfig(mode: ImageGenerationMode): AIEndpointConfig;
```

### Requirement: AI 配置 Store

系统 SHALL 创建 zustand store 管理 AI 配置的全局状态：

```typescript
// src/store/aiConfigStore.ts

interface AIConfigState {
  config: AIConfig;
  isLoaded: boolean;
  
  // 操作
  loadConfig(): void;                    // 从 localStorage 加载
  updateGeneral(updates: Partial<AIGeneralConfig>): void;
  updateVideoEndpoint(mode: GenerationMode, updates: Partial<AIEndpointConfig>): void;
  updateImageEndpoint(mode: ImageGenerationMode, updates: Partial<AIEndpointConfig>): void;
  resetToDefaults(): void;               // 重置为默认
  exportConfig(): string;                // 导出为 JSON 字符串
  importConfig(json: string): boolean;   // 从 JSON 导入
}
```

### Requirement: 系统设置页面整合

系统 SHALL 在 Settings.tsx 中使用 Tabs 组件将设置页面分为三个选项卡：

```
┌────────────────────────────────────────────────────────┐
│ ⚙️ 系统设置                                            │
├────────────────────────────────────────────────────────┤
│ [通用设置] [外观设置] [AI 能力配置]                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌─ 通用 AI 配置 ──────────────────────────────────┐    │
│ │ API 基础地址：[https://visual.volcengineapi.com]│    │
│ │ API 密钥：      [•••••••••••••••••••]           │    │
│ │ 应用 ID：       [•••••••••••••••••••]           │    │
│ │ 轮询间隔：      [5000] ms                       │    │
│ │ 轮询最大次数：  [120]                           │    │
│ │ 视频过期时间：  [3600000] ms (1小时)            │    │
│ │ 图片过期时间：  [86400000] ms (24小时)          │    │
│ └─────────────────────────────────────────────────┘    │
│                                                        │
│ ┌─ 视频生成 API ──────────────────────────────────┐    │
│ │ ┌─ 文生视频 ────────────────────────────────┐   │    │
│ │ │ ● 启用    ○ 禁用                          │   │    │
│ │ │ req_key: [jimeng_t2v_v30_1080]            │   │    │
│ │ │ 超时: [30000] ms  重试: [3] 次             │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ │ ┌─ 首帧图生视频 ────────────────────────────┐   │    │
│ │ │ ● 启用    ○ 禁用                          │   │    │
│ │ │ req_key: [jimeng_i2v_first_v30_1080]      │   │    │
│ │ │ 超时: [30000] ms  重试: [3] 次             │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ │ ┌─ 首尾帧图生视频 ──────────────────────────┐   │    │
│ │ │ ● 启用    ○ 禁用                          │   │    │
│ │ │ req_key: [jimeng_i2v_first_tail_v30_1080] │   │    │
│ │ │ 超时: [30000] ms  重试: [3] 次             │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ └─────────────────────────────────────────────────┘    │
│                                                        │
│ ┌─ 图片生成 API ──────────────────────────────────┐    │
│ │ ┌─ 即梦图片4.0（文生图/图生图）─────────────┐   │    │
│ │ │ ● 启用    ○ 禁用                          │   │    │
│ │ │ req_key: [jimeng_t2i_v40]                 │   │    │
│ │ │ 超时: [30000] ms  重试: [3] 次             │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ │ ┌─ 即梦图片4.6（风格化/平面/人像）──────────┐   │    │
│ │ │ ● 启用    ○ 禁用                          │   │    │
│ │ │ req_key: [jimeng_seedream46_cvtob]        │   │    │
│ │ │ 超时: [30000] ms  重试: [3] 次             │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ │ ┌─ 即梦智能超清 ────────────────────────────┐   │    │
│ │ │ ● 启用    ○ 禁用                          │   │    │
│ │ │ req_key: [jimeng_i2i_seed3_tilesr_cvtob]  │   │    │
│ │ │ 超时: [30000] ms  重试: [3] 次             │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ │ ┌─ 即梦交互编辑（inpainting）───────────────┐   │    │
│ │ │ ● 启用    ○ 禁用                          │   │    │
│ │ │ req_key: [i2i_inpainting_edit]            │   │    │
│ │ │ 超时: [30000] ms  重试: [3] 次             │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ └─────────────────────────────────────────────────┘    │
│                                                        │
│ [导入配置] [导出配置] [重置默认]       [保存全部配置]  │
└────────────────────────────────────────────────────────┘
```

### Requirement: 多环境预设

系统 SHALL 提供多环境配置预设功能：

| 预设 | 说明 |
|------|------|
| 开发环境 | 使用 Mock 适配器，BASE_URL 指向本地 |
| 测试环境 | 指向测试 API 地址 |
| 生产环境 | 指向正式火山引擎 API |

用户可通过下拉菜单快速切换预设，切换时覆盖全部配置项。

### Requirement: 配置导入导出

系统 SHALL 支持：
- **导出**：将当前配置导出为 JSON 文件下载
- **导入**：从 JSON 文件导入配置，导入前进行格式校验
- **重置**：一键恢复默认配置，需二次确认

### Requirement: 表单校验

系统 SHALL 对以下字段进行校验：
- baseUrl 必须为合法 URL 格式
- timeout 必须为正整数，范围 1000~300000
- pollInterval 必须为正整数，范围 1000~60000
- pollMaxAttempts 必须为正整数，范围 1~1000
- reqKey 不能为空字符串
- apiKey 和 appId 不能为空（生产环境）

### Requirement: API 服务层适配

系统 SHALL 修改 `videoGeneration.ts` 和 `imageGeneration.ts`：
- 移除硬编码的 `VIDEO_API_CONFIG` 和 `IMAGE_API_CONFIG` 常量
- 改为从 aiConfigStore 动态读取配置
- `getReqKeyForMode` 改为调用 aiConfigService 中的方法
- 保持对外 API 接口不变（submitVideoTask、queryTaskResult 等函数签名不变）

## MODIFIED Requirements

### Requirement: 系统设置页面
**修改文件**：src/pages/system/Settings.tsx
- 将现有内容重组为 Tabs 选项卡：通用设置、外观设置、AI 能力配置
- 新增 AI 能力配置选项卡，包含通用 AI 配置、视频生成 API、图片生成 API 三大区块
- 添加导入导出、重置、多环境切换功能

### Requirement: 视频生成服务
**修改文件**：src/services/videoGeneration.ts
- 移除 VIDEO_API_CONFIG 硬编码常量
- submitVideoTask 和 queryTaskResult 从 aiConfigStore 读取配置
- 保持对外接口不变

### Requirement: 图片生成服务
**修改文件**：src/services/imageGeneration.ts
- 移除 IMAGE_API_CONFIG 硬编码常量（保留 model_names 和 model_versions 映射，这些用于 KeyFrame 创建）
- submitImageTask 和 queryImageTaskResult 从 aiConfigStore 读取配置
- 保持对外接口不变

### Requirement: Tailwind 配置
**修改文件**：tailwind.config.js
- 在 plugins 中已包含 tailwindcss-animate，确认支持 tabs 组件动画

## REMOVED Requirements

### Requirement: 硬编码 API 配置
**原因**：VIDEO_API_CONFIG 和 IMAGE_API_CONFIG 中的 BASE_URL、req_keys、超时参数等改为可配置
**迁移**：保留 model_names 和 model_versions 映射（用于创建 KeyFrame 时设置 modelName/modelVersion），其余移至 AI 配置系统
