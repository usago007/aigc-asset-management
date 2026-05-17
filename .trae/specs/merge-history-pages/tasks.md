# Tasks

- [x] 任务 1：重写 GenerationHistory.tsx 为双 Tab 统一历史页面
  - [x] 添加 Tab 切换组件（图片/视频）
  - [x] 图片 Tab：集成原 ImageGenerationHistory 的表格视图
  - [x] 视频 Tab：保留原 GenerationHistory 的卡片视图
  - [x] 两个 Tab 独立维护各自的搜索/筛选状态

- [x] 任务 2：删除 ImageGenerationHistory.tsx
  - [x] 删除 `src/pages/content/ImageGenerationHistory.tsx` 文件

- [x] 任务 3：更新 App.tsx 路由配置
  - [x] 删除 `/content/image-generation-history` 路由
  - [x] 保留 `/content/generation-history` 路由

- [x] 任务 4：更新 Sidebar.tsx 菜单
  - [x] 将"作品库"和"素材库"合并为"作品库"一个菜单项
  - [x] 指向 `/content/generation-history`

- [x] 任务 5：验证
  - [x] TypeScript 编译无错误
  - [x] 图片 Tab 功能正常
  - [x] 视频 Tab 功能正常
  - [x] 菜单显示正确

# Task Dependencies
- 任务 2 依赖于 任务 1 完成
- 任务 3 依赖于 任务 1 完成
- 任务 4 依赖于 任务 1 完成
- 任务 5 依赖于 所有任务完成
