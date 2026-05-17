# 即梦AI官方API对接升级 Spec

## Why
当前系统的 reqKey 配置与火山引擎即梦AI官方文档不一致，部分 API 能力（S2.0 Pro）已标记为陆续下线。需要将系统升级为与官方 API 完全兼容的状态，修正配置结构、类型定义和 UI 展示。

## What Changes
- **BREAKING**：`VideoAIConfig` 接口从按使用模式分类改为按官方能力分类
- **BREAKING**：`ImageAIConfig` 接口从现有5个能力改为官方5个能力
- **BREAKING**：`ImageGenerationMode` 类型移除 stylization-edit、super-resolution、inpainting
- 新增 `action-imitation` 和 `digital-human-fast` 视频生成模式
- 所有 reqKey 默认值更新为官方文档正确值
- AI 配置面板 UI 更新以反映新的能力结构
- 图片/视频生成页面模式选项更新

## Impact
- Affected specs: 图片生成工作台、视频生成工作台、AI配置面板
- Affected code: 
  - `src/types/aiConfig.ts`（类型定义）
  - `src/types/generation.ts`（类型定义）
  - `src/services/aiConfigService.ts`（映射逻辑）
  - `src/pages/system/AIConfigPanel.tsx`（配置UI）
  - `src/pages/content/VideoGeneration.tsx`（视频生成UI）
  - `src/pages/content/ImageGeneration.tsx`（图片生成UI）
  - `src/store/generationStore.ts`（Store逻辑）
  - `src/store/appStore.ts`（Store逻辑）
  - `src/data/mockGenerationData.ts`（Mock数据）
  - `src/utils/mockData.ts`（Mock数据）

## ADDED Requirements

### Requirement: 视频生成新能力
The system SHALL support the following new video generation capabilities:
- 动作模仿（action-imitation）
- 数字人快速模式（digital-human-fast）

#### Scenario: 选择动作模仿模式
- **WHEN** 用户在视频生成页面选择"动作模仿"模式
- **THEN** 显示动作参考视频上传区域，提交任务时使用 `jimeng_action_imitation` reqKey

#### Scenario: 选择数字人快速模式
- **WHEN** 用户在视频生成页面选择"数字人快速模式"
- **THEN** 显示人物照片和音频上传区域，提交任务时使用 `jimeng_digital_human_fast` reqKey

### Requirement: 图片生成新能力
The system SHALL support the following image generation capabilities matching official API:
- 图片生成4.0（jimeng_t2i_v40）
- 文生图3.1（jimeng_t2i_v31）
- 文生图3.0（jimeng_t2i_v30）
- 图生图3.0-智能参考（jimeng_i2i_v30）
- 文生图2.1（jimeng_t2i_v21）

#### Scenario: 选择文生图3.1模式
- **WHEN** 用户在图片生成页面选择"文生图3.1"模式
- **THEN** 提交任务时使用 `jimeng_t2i_v31` reqKey

## MODIFIED Requirements

### Requirement: VideoAIConfig 类型结构
The `VideoAIConfig` interface SHALL be restructured:
- `textToVideo` → `video30Pro`（视频生成3.0 Pro）
- `imageToVideoFirst` → `video30`（视频生成3.0）
- `imageToVideoFirstTail` → **REMOVED**（合并到 video30Pro）
- ADD `actionImitation`（动作模仿）
- ADD `digitalHumanFast`（数字人快速模式）

### Requirement: ImageAIConfig 类型结构
The `ImageAIConfig` interface SHALL be restructured:
- `textToImage` → `image40`（图片生成4.0）
- `imageToImage` → **REMOVED**（合并到 image40）
- `stylizationEdit` → **REMOVED**（已整合到图片4.0）
- `superResolution` → **REMOVED**（已整合到图片4.0）
- `inpainting` → **REMOVED**（已整合到图片4.0）
- ADD `textToImage31`（文生图3.1）
- ADD `textToImage30`（文生图3.0）
- ADD `imageToImage30`（图生图3.0-智能参考）
- ADD `textToImage21`（文生图2.1）

### Requirement: GenerationMode 类型
The `GenerationMode` type SHALL include:
- `text-to-video`（映射到 video30Pro）
- `image-to-video-first`（映射到 video30Pro）
- `image-to-video-first-tail`（映射到 video30Pro）
- `action-imitation`（映射到 actionImitation）
- `digital-human-fast`（映射到 digitalHumanFast）

### Requirement: ImageGenerationMode 类型
The `ImageGenerationMode` type SHALL include:
- `text-to-image`（映射到 image40）
- `image-to-image`（映射到 image40）
- `text-to-image-31`（映射到 textToImage31）
- `text-to-image-30`（映射到 textToImage30）
- `text-to-image-21`（映射到 textToImage21）

### Requirement: AIConfigPanel 视频配置区域
The AI configuration panel video section SHALL display:
- 视频生成3.0 Pro（jimeng_t2v_v30_pro）
- 视频生成3.0（jimeng_t2v_v30）
- 动作模仿（jimeng_action_imitation）
- 数字人快速模式（jimeng_digital_human_fast）

### Requirement: AIConfigPanel 图片配置区域
The AI configuration panel image section SHALL display:
- 即梦图片4.0（jimeng_t2i_v40）
- 文生图3.1（jimeng_t2i_v31）
- 文生图3.0（jimeng_t2i_v30）
- 图生图3.0-智能参考（jimeng_i2i_v30）
- 文生图2.1（jimeng_t2i_v21）

## REMOVED Requirements

### Requirement: S2.0 Pro 视频生成
**Reason**: 官方标记为"陆续下线中"
**Migration**: 所有 S2.0 Pro 相关配置和逻辑移除，使用 video30Pro 或 video30 替代

### Requirement: 图片风格化编辑/超清/局部重绘独立能力
**Reason**: 已整合到图片生成4.0统一框架中
**Migration**: 使用图片4.0的图像编辑功能替代，通过 prompt 指令控制编辑行为
