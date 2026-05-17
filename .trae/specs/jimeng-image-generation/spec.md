# 即梦风格图片生成工作台 Spec

## Why
当前图片生成工作台采用传统表单布局（多区域分散），与即梦AI的现代化简洁风格差异较大。需要改造为即梦 Agent 模式风格，提升用户体验和视觉质感。

## What Changes
- **BREAKING**：`ImageGeneration.tsx` 完全重构为即梦风格
- 移除传统多区域表单，改为单输入框 + 参数折叠面板
- 添加 Agent 模式标题
- 添加创作类型切换菜单
- 生成结果从列表改为卡片网格
- 移除"帧类型"、"关联镜头"等复杂选项（这些是视频生成概念，图片生成不需要）

## Impact
- Affected code:
  - `src/pages/content/ImageGeneration.tsx`（完全重构）
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
- 左侧图片上传按钮（最多10张）
- 底部参数按钮（点击展开 ParamPanel）
- 右侧语音输入 + 提交按钮
- 支持 Ctrl/Cmd + Enter 快捷提交
- 字数统计显示（0/800）

### Requirement: 参数折叠面板
The page SHALL display parameters in a collapsible panel:
- 生成模式选择：图片4.0、图生图、文生图3.1、文生图3.0、文生图2.1
- 分辨率选择：1K / 2K / 4K
- 宽高比选择：16:9 / 4:3 / 1:1 / 3:4 / 9:16 / 21:9
- Seed 设置：随机 / 自定义
- 强制单图开关
- 文本影响程度 Scale 滑块（0-100）

### Requirement: 生成结果展示
The generated results SHALL be displayed as a card grid:
- 2-4 列响应式网格布局
- 图片正方形展示
- Hover 显示预览和下载按钮
- 显示消耗 Token 信息
- 支持点击放大预览

### Requirement: 活跃任务展示
Active tasks SHALL be displayed below the input:
- 任务卡片列表
- 显示进度条
- 显示任务状态和模式
- 支持取消操作

## MODIFIED Requirements

### Requirement: 图片生成页面整体布局
The page layout SHALL follow Jimeng's design pattern:
- 页面居中布局，最大宽度限制
- 输入框位于页面中上部
- 参数面板紧随输入框下方
- 活跃任务在输入框下方展示
- 生成结果在页面底部展示
