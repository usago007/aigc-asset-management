# Tasks

- [x] Task 1: 创建视频生成类型定义
  - [x] Task 1.1: 在 src/types/generation.ts 中定义 VideoGenerationTask 接口
  - [x] Task 1.2: 定义 TaskQueueStatus 联合类型
  - [x] Task 1.3: 定义 SubmitTaskParams、SubmitTaskResponse、TaskResultResponse 等API相关类型

- [x] Task 2: 创建Mock API服务层
  - [x] Task 2.1: 创建 src/services/videoGeneration.ts，定义 submitVideoTask 和 queryTaskResult 接口
  - [x] Task 2.2: 创建 src/services/poller.ts，实现任务轮询器
  - [x] Task 2.3: 创建 Mock 适配器，模拟任务提交、状态流转、失败场景
  - [x] Task 2.4: 创建图片处理工具函数（fileToBase64、validateImage、getImageAspectRatio）

- [x] Task 3: 创建状态管理 Store
  - [x] Task 3.1: 创建 src/store/generationStore.ts
  - [x] Task 3.2: 实现任务列表状态管理（addTask、updateTask、deleteTask）
  - [x] Task 3.3: 实现轮询任务管理（startPolling、stopPolling）
  - [x] Task 3.4: 实现视频URL过期检测逻辑

- [x] Task 4: 创建基础UI组件
  - [x] Task 4.1: 创建 src/components/ImageUploader.tsx（图片上传、预览、校验、比例显示）
  - [x] Task 4.2: 创建 src/components/VideoPlayer.tsx（视频播放控制）
  - [x] Task 4.3: 创建 src/components/TaskCard.tsx（任务状态、进度条、操作按钮）
  - [x] Task 4.4: 创建 src/components/PromptInput.tsx（字数统计、格式提示）

- [x] Task 5: 创建视频生成工作台页面
  - [x] Task 5.1: 创建 src/pages/content/VideoGeneration.tsx
  - [x] Task 5.2: 实现生成模式选择（文生视频/首帧/首尾帧）
  - [x] Task 5.3: 实现图片上传区域（根据模式动态显示）
  - [x] Task 5.4: 实现Prompt输入和参数配置区域
  - [x] Task 5.5: 实现任务提交逻辑
  - [x] Task 5.6: 实现任务队列展示区域

- [x] Task 6: 创建生成历史页面
  - [x] Task 6.1: 创建 src/pages/content/GenerationHistory.tsx
  - [x] Task 6.2: 实现历史任务列表（搜索、状态筛选、模式筛选、分页）
  - [x] Task 6.3: 实现任务详情模态框或跳转详情页

- [x] Task 7: 创建任务详情页面
  - [x] Task 7.1: 创建 src/pages/content/TaskDetail.tsx
  - [x] Task 7.2: 展示任务完整信息（输入参数、输出结果、耗时）
  - [x] Task 7.3: 实现视频播放和下载功能
  - [x] Task 7.4: 实现重新生成和返回功能

- [x] Task 8: 更新路由和导航
  - [x] Task 8.1: 更新 src/App.tsx，添加新路由
  - [x] Task 8.2: 更新 src/components/Sidebar.tsx，添加导航项

- [x] Task 9: 添加Mock数据到Store
  - [x] Task 9.1: 创建模拟历史任务数据
  - [x] Task 9.2: 初始化 generationStore 的 mock 数据

# Task Dependencies

- [Task 2] depends on [Task 1]（API服务需要类型定义）
- [Task 3] depends on [Task 1, Task 2]（Store需要类型和API服务）
- [Task 4] depends on [Task 1]（组件需要类型定义）
- [Task 5] depends on [Task 2, Task 3, Task 4]（页面需要API、Store和组件）
- [Task 6] depends on [Task 3, Task 4]（历史页面需要Store和组件）
- [Task 7] depends on [Task 3, Task 4.2]（详情页面需要Store和视频播放器）
- [Task 8] depends on [Task 5, Task 6, Task 7]（路由需要所有页面）
- [Task 9] can run in parallel with Task 4, Task 5
