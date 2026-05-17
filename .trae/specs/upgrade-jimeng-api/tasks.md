# Tasks

- [x] 任务 1：更新类型定义 - aiConfig.ts
  - [x] 修改 VideoAIConfig 接口：video30Pro、video30、actionImitation、digitalHumanFast
  - [x] 修改 ImageAIConfig 接口：image40、textToImage31、textToImage30、imageToImage30、textToImage21
  - [x] 更新 getDefaultAIConfig 默认 reqKey 值
  - [x] 移除 S2.0 Pro 相关配置

- [x] 任务 2：更新类型定义 - generation.ts
  - [x] 修改 GenerationMode 类型：新增 action-imitation、digital-human-fast
  - [x] 修改 ImageGenerationMode 类型：移除 stylization-edit、super-resolution、inpainting，新增 text-to-image-31、text-to-image-30、text-to-image-21
  - [x] 更新 SubmitTaskParams 和 ImageSubmitTaskParams 中的 reqKey 相关逻辑

- [x] 任务 3：更新配置服务 - aiConfigService.ts
  - [x] 更新 VIDEO_MODE_MAP 映射到新配置键名
  - [x] 更新 IMAGE_MODE_MAP 映射到新配置键名
  - [x] 验证 getVideoReqKey、getImageReqKey 等方法正常工作

- [x] 任务 4：更新 AI 配置面板 - AIConfigPanel.tsx
  - [x] 视频配置区域：显示 3.0 Pro、3.0、动作模仿、数字人快速模式
  - [x] 图片配置区域：显示图片4.0、文生图3.1、文生图3.0、图生图3.0、文生图2.1
  - [x] 移除已下线/整合能力的配置卡片

- [x] 任务 5：更新视频生成页面 - VideoGeneration.tsx
  - [x] 模式选项保持不变：文生视频、首帧图生、首尾帧图生
  - [x] 验证提交任务时正确获取 reqKey

- [x] 任务 6：更新图片生成页面 - ImageGeneration.tsx
  - [x] 模式选项更新：图片4.0、文生图、文生图3.1、文生图3.0、文生图2.1
  - [x] 移除风格化编辑、智能超清、局部重绘模式按钮

- [x] 任务 7：更新 Store 逻辑
  - [x] generationStore.ts：更新 submitTask 方法的 reqKey 获取逻辑
  - [x] appStore.ts：更新 submitImageTask 方法的 reqKey 获取逻辑
  - [x] aiConfigStore.ts：更新 VIDEO_MODE_KEYS 和 IMAGE_MODE_KEYS 映射

- [x] 任务 8：更新 Mock 数据
  - [x] mockGenerationData.ts：更新所有 reqKey 为官方正确值
  - [x] mockData.ts：更新模拟任务的 mode 选项
  - [x] SystemLogs.tsx：更新日志中的 reqKey 引用
  - [x] imageGeneration.ts：更新 IMAGE_MODEL_NAMES 和 IMAGE_MODEL_VERSIONS

- [x] 任务 9：验证
  - [x] TypeScript 编译无错误：npx tsc --noEmit 通过
  - [x] AI 配置面板显示正确
  - [x] 视频生成页面模式选项正确
  - [x] 图片生成页面模式选项正确

# Task Dependencies
- 任务 2 依赖于 任务 1 完成
- 任务 3 依赖于 任务 1 和 任务 2 完成
- 任务 4 依赖于 任务 1 完成
- 任务 5 依赖于 任务 3 完成
- 任务 6 依赖于 任务 3 完成
- 任务 7 依赖于 任务 3 完成
- 任务 8 依赖于 任务 1 和 任务 2 完成
- 任务 9 依赖于 所有任务完成
