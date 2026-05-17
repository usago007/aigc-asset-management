# 即梦风格视频生成工作台 Spec

## Why
当前视频生成工作台采用传统表单布局，与即梦AI的现代化简洁风格差异较大。需要改造为即梦 Agent 模式风格，提升用户体验。

## What Changes
- **BREAKING**：`VideoGeneration.tsx` 完全重构为即梦风格
- 移除传统多区域表单，改为单输入框 + 参数折叠面板
- 添加 Agent 模式标题
- 添加创作类型切换菜单
- 参考图像上传整合到输入框附件功能
- 活跃任务以卡片网格展示
- 创作类型菜单选择后需要路由跳转到对应页面（图片生成或视频生成页），调用方需使用 `useNavigate` 实现路由跳转

## Impact
- Affected code:
  - `src/pages/content/VideoGeneration.tsx`（完全重构）
  - `src/components/JimengInput.tsx`（引用）
  - `src/components/ParamPanel.tsx`（引用）
  - `src/components/CreationTypeMenu.tsx`（引用）

## ADDED Requirements

### Requirement: Agent 模式标题
The page SHALL display a Jimeng-style header:
- 大标题"开启你的 Agent 模式 · 即刻造梦！"
- "Agent 模式"文字为蓝色高亮
- 标题下方为创作类型下拉菜单

### Requirement: 单输入框布局
The page SHALL use a unified input box:
- 使用 JimengInput 组件
- 左侧附件上传按钮（首帧图/尾帧图/参考视频）
- 底部参数按钮（点击展开 ParamPanel）
- 右侧语音输入 + 提交按钮
- 支持 Ctrl/Cmd + Enter 快捷提交
- 字数统计显示（0/800）

### Requirement: 参数折叠面板
The page SHALL display parameters in a collapsible panel:
- 生成模式选择：文生视频 / 首帧图生 / 首尾帧图生
- 时长选择：5秒(121帧) / 10秒(241帧)
- 宽高比选择：16:9 / 4:3 / 1:1 / 3:4 / 9:16 / 21:9
- Seed 设置：随机 / 自定义
- 首尾帧宽高比检测警告（整合到参数面板）

### Requirement: 活跃任务展示
Active tasks SHALL be displayed as card grid:
- 使用 TaskCard 组件
- 1-3 列响应式网格布局
- 显示任务缩略图/加载动画
- 显示任务状态和进度
- 支持查看详情、重试、取消操作
- 查看详情跳转至 `/content/video-detail/:id` 路由

## MODIFIED Requirements

### Requirement: 视频生成页面整体布局
The page layout SHALL follow Jimeng's design pattern:
- 页面居中布局，最大宽度限制
- 输入框位于页面中上部
- 参数面板紧随输入框下方
- 活跃任务在输入框下方以卡片网格展示
- 创作类型菜单切换时，使用 `useNavigate` 跳转到对应页面（如 `/content/image-generation` 或 `/content/video-generation`）
