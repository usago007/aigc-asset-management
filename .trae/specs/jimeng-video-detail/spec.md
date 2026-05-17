# 即梦风格视频详情页 Spec

## Why
当前视频详情页采用任务信息卡片形式，与即梦的作品展示体验差异较大。需要改造为即梦风格的左右分栏布局，左侧视频播放器 + 右侧参数信息面板，提升作品浏览和操作体验。

## What Changes
- **BREAKING**：新建 `VideoDetail.tsx` 替代原有 TaskDetail 中的视频详情部分
- 采用左右分栏布局
- 左侧视频播放器（支持进度条、音量、全屏、倍速）
- 右侧作品信息面板（提示词、模型信息、操作按钮组）
- 操作按钮组采用即梦风格的2列网格布局

## Impact
- Affected code:
  - `src/pages/content/VideoDetail.tsx`（新增）
  - `src/App.tsx`（新增路由）
  - `src/pages/content/GenerationHistory.tsx`（跳转链接更新）
  - `src/components/Header.tsx`（面包屑更新）
  - `src/components/VideoPlayer.tsx`（可能需要增强）

## ADDED Requirements

### Requirement: 左右分栏布局
The page SHALL use a split layout:
- 左侧：视频播放器区域，占据约 60-70% 宽度
- 右侧：作品信息面板，占据约 30-40% 宽度
- 移动端自动切换为上下布局
- 背景为深色/中性色，突出作品

### Requirement: 视频播放器
The video player SHALL provide:
- 视频居中展示，自适应容器大小（16:9 或原始比例）
- 播放/暂停控制
- 进度条（支持拖动跳转）
- 音量控制
- 全屏按钮
- 倍速选择（0.5x / 1x / 1.5x / 2x）
- 当前时间/总时长显示

### Requirement: 右侧信息面板 - 顶部操作栏
The right panel top bar SHALL contain:
- 下载按钮（带图标）
- 收藏星标按钮（可切换）
- 分享按钮
- 更多操作按钮（...）

### Requirement: 右侧信息面板 - 作品信息
The right panel SHALL display work information:
- 视频提示词区域（完整展示 prompt，支持展开/收起）
- 模型信息行：图标 + "Seedsance 1.5 Pro" + "12s" + "详细信息"按钮
- 生成参数：时长、宽高比、Seed（折叠显示）
- 首帧/尾帧缩略图（如适用）
- 生成时间、任务ID等技术信息（折叠显示）
- 视频过期倒计时（如适用）

### Requirement: 右侧信息面板 - 操作按钮组
The action button grid SHALL provide 2-column layout:
- 对口型（带口型图标）
- AI 音效（带音效图标）
- AI 配乐（带音乐图标）
- 补帧（带帧图标）
- 智能超清（带超清图标）
- 重新编辑（带编辑图标）
- 再次生成（带刷新图标）
- 每个按钮带图标 + 文字
- Hover 有背景高亮效果
- 部分按钮标注"即将开放"

### Requirement: 生成历史记录
The page SHALL show generation history:
- 折叠面板展示
- 显示该作品的生成历史（同 prompt 的不同生成结果）
- 点击缩略图可切换到对应版本

### Requirement: 失败/过期状态
For failed or expired videos:
- 显示错误信息卡片（红色背景）
- 显示过期提示卡片（黄色背景）
- 提供重试/重新生成按钮
- 视频播放器区域显示占位状态

## MODIFIED Requirements

### Requirement: 路由配置
The routing SHALL include:
- `/content/video-detail/:id` 路由指向 VideoDetail 组件
- 保留原有 `/content/task/:id` 路由（TaskDetail 组件），两者共存
- 新页面从视频历史页面点击时跳转至 `/content/video-detail/:id`
- 旧路由 `/content/task/:id` 继续支持，后续版本可逐步迁移
