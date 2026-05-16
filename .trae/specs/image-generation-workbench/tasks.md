# Tasks

- [x] Task 1: 扩展图片生成类型定义
  - [x] Task 1.1: 在 src/types/generation.ts 中追加 ImageGenerationMode 类型
  - [x] Task 1.2: 追加 ImageGenerationTask 接口（含 keyFrameIds、shotId、frameType 关联字段）
  - [x] Task 1.3: 追加 ImageSubmitTaskParams、ImageSubmitTaskResponse、ImageTaskResultResponse 类型

- [x] Task 2: 创建图片生成API服务层
  - [x] Task 2.1: 创建 src/services/imageGeneration.ts，支持四种接口（图片4.0、4.6、智能超清、inpainting）
  - [x] Task 2.2: 创建 src/services/imageMockAdapter.ts，模拟图片生成API（支持组图输出）
  - [x] Task 2.3: 扩展现有 poller.ts 以支持图片任务轮询

- [x] Task 3: 扩展 appStore 支持图片生成
  - [x] Task 3.1: 在 src/store/appStore.ts 中添加 imageTasks 状态
  - [x] Task 3.2: 实现图片生成任务 CRUD 方法
  - [x] Task 3.3: 实现 submitImageTask、retryImageTask、cancelImageTask 方法
  - [x] Task 3.4: 实现 createKeyFramesFromImages 方法：为每张输出图创建 KeyFrame，更新 Shot 关联
  - [x] Task 3.5: 在 mockData 中添加模拟图片生成任务数据

- [x] Task 4: 创建图片生成工作台页面
  - [x] Task 4.1: 创建 src/pages/content/ImageGeneration.tsx
  - [x] Task 4.2: 实现五种模式切换（文生图/图生图/风格化编辑/智能超清/局部重绘）
  - [x] Task 4.3: 实现帧类型选择（Opening/Ending）
  - [x] Task 4.4: 实现关联镜头选择下拉框
  - [x] Task 4.5: 实现多图上传区域（按模式限制数量）
  - [x] Task 4.6: 实现参数配置（分辨率、宽高比、强制单图、scale、seed）
  - [x] Task 4.7: 实现任务提交逻辑（调用 appStore.submitImageTask）
  - [x] Task 4.8: 实现任务队列展示
  - [x] Task 4.9: 实现结果图片网格（预览、下载）

- [x] Task 5: 创建图片生成历史页面
  - [x] Task 5.1: 创建 src/pages/content/ImageGenerationHistory.tsx
  - [x] Task 5.2: 实现历史列表（搜索、状态筛选、模式筛选、分页）
  - [x] Task 5.3: 实现图片预览和下载
  - [x] Task 5.4: 实现重新关联到镜头功能

- [x] Task 6: 更新路由和导航
  - [x] Task 6.1: 更新 src/App.tsx，添加新路由
  - [x] Task 6.2: 更新 src/components/Sidebar.tsx，添加导航项

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1, Task 2]
- [Task 4] depends on [Task 2, Task 3]
- [Task 5] depends on [Task 3]
- [Task 6] depends on [Task 4, Task 5]
