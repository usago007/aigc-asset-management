# 即梦风格图片详情页 Spec

## Why
当前图片详情页采用任务信息表格形式，与即梦的作品展示体验差异较大。需要改造为即梦风格的左右分栏布局，左侧大图展示 + 右侧参数信息面板，提升作品浏览和操作体验。

## What Changes
- **BREAKING**：新建 `ImageDetail.tsx` 替代原有 TaskDetail 中的图片详情部分
- 采用左右分栏布局
- 左侧大图展示区（支持缩放、全屏）
- 右侧作品信息面板（提示词、模型信息、操作按钮组）
- 操作按钮组采用即梦风格的2列网格布局

## Impact
- Affected code:
  - `src/pages/content/ImageDetail.tsx`（新增）
  - `src/App.tsx`（新增路由）
  - `src/pages/content/GenerationHistory.tsx`（跳转链接更新）
  - `src/components/Header.tsx`（面包屑更新）

## ADDED Requirements

### Requirement: 左右分栏布局
The page SHALL use a split layout:
- 左侧：大图展示区，占据约 60-70% 宽度
- 右侧：作品信息面板，占据约 30-40% 宽度
- 移动端自动切换为上下布局
- 背景为深色/中性色，突出作品

### Requirement: 大图展示区
The image display area SHALL provide:
- 图片居中展示，自适应容器大小
- 支持点击放大全屏查看
- 支持鼠标滚轮缩放
- 显示图片基本信息（尺寸）
- 返回按钮（左上角）

### Requirement: 右侧信息面板 - 顶部操作栏
The right panel top bar SHALL contain:
- 下载按钮（带图标）
- 收藏星标按钮
- 分享按钮
- 更多操作按钮（...）

### Requirement: 右侧信息面板 - 作品信息
The right panel SHALL display work information:
- 图片提示词区域（完整展示 prompt，支持展开/收起）
- 模型信息行：图标 + "图片 4.1" + "1:1" + "2K" + "详细信息"按钮
- 生成时间、任务ID等技术信息（折叠显示）

### Requirement: 右侧信息面板 - 操作按钮组
The action button grid SHALL provide 2-column layout:
- 生成视频（带视频图标）
- 去画布编辑（带画布图标）
- 编辑超清（带超清图标）
- 细节修复（带修复图标）
- 扩图（带扩展图标）
- 消除笔（带笔图标）
- 对口型（带口型图标）
- 图片编辑器（带编辑图标）
- 重新编辑（带编辑图标）
- 再次生成（带刷新图标）
- 每个按钮带图标 + 文字
- Hover 有背景高亮效果

### Requirement: 生成历史记录
The page SHALL show generation history:
- 折叠面板展示
- 显示该作品的生成历史（同 prompt 的不同生成结果）
- 点击缩略图可切换到对应版本

## MODIFIED Requirements

### Requirement: 路由配置
The routing SHALL include:
- `/content/image-detail/:id` 路由指向 ImageDetail 组件
- 保留原有 `/content/task/:id` 路由（TaskDetail 组件），两者共存
- 新页面从图片历史页面点击时跳转至 `/content/image-detail/:id`
- 旧路由 `/content/task/:id` 继续支持，后续版本可逐步迁移
