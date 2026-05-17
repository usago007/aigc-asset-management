# Tasks

- [ ] 任务 1：创建共享 UI 组件
  - [ ] 创建 `src/components/JimengInput.tsx` - 即梦风格 Agent 输入框组件
  - [ ] 创建 `src/components/ParamPanel.tsx` - 参数折叠面板组件
  - [ ] 创建 `src/components/TimelineGrid.tsx` - 时间线瀑布流网格组件
  - [ ] 创建 `src/components/CreationTypeMenu.tsx` - 创作类型下拉菜单组件

- [ ] 任务 2：重构图片生成工作台
  - [ ] 重写 `ImageGeneration.tsx` 使用 JimengInput + ParamPanel
  - [ ] 实现 Agent 模式标题和单输入框布局
  - [ ] 实现创作类型下拉菜单（Agent 模式/图片生成/视频生成等）
  - [ ] 参数面板包含：分辨率、宽高比、Seed、Scale 等
  - [ ] 生成结果改为卡片网格展示

- [ ] 任务 3：重构视频生成工作台
  - [ ] 重写 `VideoGeneration.tsx` 使用 JimengInput + ParamPanel
  - [ ] 实现 Agent 模式标题和单输入框布局
  - [ ] 参考图像上传整合到输入框附件功能
  - [ ] 参数面板包含：时长、宽高比、Seed 等
  - [ ] 活跃任务卡片网格展示

- [ ] 任务 4：重构历史页面为时间线网格
  - [ ] 重写 `GenerationHistory.tsx` 使用 TimelineGrid
  - [ ] 图片 Tab 显示时间线瀑布流
  - [ ] 视频 Tab 显示时间线瀑布流
  - [ ] 按日期分组显示
  - [ ] Hover 显示操作按钮（预览、下载、删除）

- [ ] 任务 5：创建图片详情页
  - [ ] 新建 `src/pages/content/ImageDetail.tsx`
  - [ ] 左侧大图展示区（缩放、全屏）
  - [ ] 右侧参数面板（提示词、模型信息、操作按钮）
  - [ ] 操作按钮：生成视频、编辑超清、消除笔、图片编辑器、再次生成等
  - [ ] 添加路由 `/content/image-detail/:id`

- [ ] 任务 6：创建视频详情页
  - [ ] 新建 `src/pages/content/VideoDetail.tsx`
  - [ ] 左侧视频播放器
  - [ ] 右侧参数面板（提示词、模型信息、操作按钮）
  - [ ] 操作按钮：对口型、AI音效、AI配乐、补帧、智能超清、再次生成等
  - [ ] 添加路由 `/content/video-detail/:id`

- [ ] 任务 7：更新 App.tsx 路由
  - [ ] 添加 `/content/image-detail/:id` 路由
  - [ ] 添加 `/content/video-detail/:id` 路由
  - [ ] 保持现有路由兼容

- [ ] 任务 8：更新 Sidebar 菜单
  - [ ] 确保菜单项与新的创作类型对应

- [ ] 任务 9：验证
  - [ ] TypeScript 编译无错误：npx tsc --noEmit
  - [ ] 应用正常启动
  - [ ] 图片生成页面正常
  - [ ] 视频生成页面正常
  - [ ] 历史页面时间线网格正常
  - [ ] 图片详情页正常
  - [ ] 视频详情页正常

# Task Dependencies
- 任务 2 依赖于 任务 1 完成
- 任务 3 依赖于 任务 1 完成
- 任务 4 依赖于 任务 1 完成
- 任务 5 依赖于 任务 1 完成
- 任务 6 依赖于 任务 1 完成
- 任务 7 依赖于 任务 5 和 任务 6 完成
- 任务 8 依赖于 任务 2 和 任务 3 完成
- 任务 9 依赖于 所有任务完成
