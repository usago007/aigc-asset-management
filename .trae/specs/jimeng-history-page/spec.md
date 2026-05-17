# 即梦风格历史页面 Spec

## Why
当前历史页面采用表格列表视图，视觉效果较差。需要改造为即梦风格的时间线瀑布流网格，提升视觉体验和浏览效率。

## What Changes
- **BREAKING**：`GenerationHistory.tsx` 中的图片 Tab 和视频 Tab 内容改为时间线瀑布流
- 移除表格列表视图
- 按日期分组展示作品缩略图
- Hover 显示操作按钮

## Impact
- Affected code:
  - `src/pages/content/GenerationHistory.tsx`（重构图片/视频 Tab 内容）
  - `src/components/TimelineGrid.tsx`（引用）

## ADDED Requirements

### Requirement: 时间线瀑布流布局
The history page SHALL display items as a timeline grid:
- 按创建日期自动分组
- 日期标题显示（如"3月14日"），使用中文月份格式，需在 `src/utils/date.ts` 中新增中文日期格式化函数
- 瀑布流网格展示作品缩略图
- 默认4列布局，响应式适配（2-4列）
- 正方形 aspect-ratio 容器
- 列数配置必须使用静态 Tailwind 类名映射，禁止动态拼接

### Requirement: 图片历史 Tab
The image history tab SHALL display:
- 图片生成任务缩略图网格
- Hover 显示操作：预览、下载、删除、重试
- 显示状态 badge（已完成/生成中/失败等）
- 点击缩略图跳转到图片详情页（路由策略：保留原有 `/content/task/:id` 兼容性，新页面使用 `/content/image-detail/:id`）
- 支持搜索和筛选（状态、模式）
- 筛选条件以标签形式展示在顶部

### Requirement: 视频历史 Tab
The video history tab SHALL display:
- 视频生成任务缩略图网格（使用视频封面）
- Hover 显示操作：播放、下载、删除、重试、查看详情
- 显示状态 badge 和时长信息
- 点击缩略图跳转到视频详情页（路由策略：保留原有 `/content/task/:id` 兼容性，新页面使用 `/content/video-detail/:id`）
- 支持搜索和筛选（状态、模式）
- 筛选条件以标签形式展示在顶部

### Requirement: 筛选和搜索
The page SHALL provide filtering and search:
- 顶部搜索框（按 prompt 搜索）
- 状态筛选标签（全部/已完成/生成中/失败）
- 模式筛选标签（全部模式/各模式选项）
- 筛选条件以 Tag 形式展示，支持快速切换

## MODIFIED Requirements

### Requirement: 历史页面整体布局
The page layout SHALL follow Jimeng's design pattern:
- 顶部标题栏：页面标题 + 搜索框 + 筛选标签
- Tab 切换：图片 / 视频
- 内容区：时间线瀑布流网格
- 移除分页器，改为滚动加载或保留分页

## REMOVED Requirements

### Requirement: 表格列表视图
**Reason**: 即梦采用瀑布流网格，视觉效果更好
**Migration**: 全部改为时间线瀑布流展示
