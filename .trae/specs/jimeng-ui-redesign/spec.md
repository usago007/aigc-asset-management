# 即梦风格 UI 升级 Spec

## Why
当前的视频生成、图片生成工作台采用传统表单布局，与即梦AI的现代化简洁风格差异较大。需要参考即梦的UI设计语言，将生成工作台改造为更简洁、直观的Agent风格界面，同时优化图片和视频详情页，使其更接近即梦的作品展示体验。

## What Changes
- **BREAKING**：图片生成工作台完全重构为即梦风格（Agent模式 + 单输入区）
- **BREAKING**：视频生成工作台完全重构为即梦风格（Agent模式 + 单输入区）
- **BREAKING**：图片详情页改造为左右分栏的作品展示布局
- **BREAKING**：视频详情页改造为左右分栏的作品展示布局
- 移除传统表单布局，改为即梦式的简洁输入框 + 参数展开面板
- 历史记录从列表式改为时间线网格瀑布流
- 详情页采用主图大图 + 右侧参数面板布局

## Impact
- Affected specs: 图片生成工作台、视频生成工作台
- Affected code:
  - `src/pages/content/ImageGeneration.tsx`（完全重构）
  - `src/pages/content/VideoGeneration.tsx`（完全重构）
  - `src/pages/content/TaskDetail.tsx`（重构为即梦风格）
  - `src/pages/content/GenerationHistory.tsx`（重构为时间线网格）
  - `src/components/`（新增 ImageDetailPanel、VideoDetailPanel 组件）
  - `src/types/generation.ts`（可能新增 ImageGenerationTask detail 字段）

## ADDED Requirements

### Requirement: Agent 模式输入框
The system SHALL provide a Jimeng-style unified input box as the primary interface:
- 顶部大标题"开启你的 Agent 模式 · 即刻造梦！"
- 单行文本输入框，支持换行
- 左侧附件按钮（图片/视频上传），底部参数按钮
- 右侧语音输入按钮 + 提交按钮
- 输入框下方通过折叠面板显示生成参数

#### Scenario: 图片生成 Agent 模式
- **WHEN** 用户进入图片生成页面
- **THEN** 显示 Agent 模式标题 + 大输入框，底部有"自动"、"使用技能"等按钮，右侧有语音和提交按钮

#### Scenario: 展开参数面板
- **WHEN** 用户点击输入框下方的参数按钮
- **THEN** 在输入框下方展开参数面板，显示分辨率、宽高比、Seed等选项

### Requirement: 创作类型下拉菜单
The system SHALL provide a creation type dropdown that shows available modes:
- 图片生成、视频生成、数字人、配音生成、动作模仿
- Agent 模式下显示子类型：无限画布、Agent 模式、图片生成、视频生成
- 点击后切换对应的生成页面

### Requirement: 时间线历史记录
The system SHALL display generation history as a timeline grid:
- 按日期分组（如"3月14日"、"1月2日"）
- 每个日期下以瀑布流网格展示作品缩略图
- 点击缩略图进入详情页
- 支持批量操作按钮

### Requirement: 图片详情页
The image detail page SHALL use a split layout:
- 左侧：大图展示区，支持缩放、全屏查看
- 右侧：作品信息面板，包含：
  - 顶部：下载按钮、收藏、分享、更多操作
  - 图片提示词区域
  - 模型信息（智链参考 | 图片 4.1 | 1:1 | 2K）
  - 操作按钮组：生成视频、去画布编辑、编辑超清、细节修复、扩图、消除笔、对口型、图片编辑器、重新编辑、再次生成
  - 生成历史记录（折叠面板）

### Requirement: 视频详情页
The video detail page SHALL use a split layout:
- 左侧：视频播放器，支持进度条、音量、全屏
- 右侧：作品信息面板，包含：
  - 顶部：下载按钮、收藏、分享、更多操作
  - 视频提示词区域
  - 模型信息（Seedsance 1.5 Pro | 12s | 详细信息）
  - 操作按钮组：对口型、AI音效、AI配乐、补帧、智能超清、重新编辑、再次生成

## MODIFIED Requirements

### Requirement: 图片生成页面布局
The image generation page SHALL use Jimeng's design:
- 顶部大标题 + Agent模式标题
- 单输入框替代多区域表单
- 参数通过折叠面板展示
- 生成结果以卡片网格展示，而非传统列表
- 移除传统的"帧类型"、"关联镜头"等复杂选项（或将其简化到参数面板中）

### Requirement: 视频生成页面布局
The video generation page SHALL use Jimeng's design:
- 顶部大标题 + Agent模式标题
- 单输入框替代多区域表单
- 参考图像上传整合到输入框的附件功能中
- 参数通过折叠面板展示
- 活跃任务以卡片网格展示

### Requirement: 历史页面布局
The generation history page SHALL use a timeline grid:
- 图片 Tab 和视频 Tab 保持
- 内容改为按日期分组的瀑布流网格
- 每个作品以缩略图展示，hover 显示操作按钮
- 移除传统的表格列表视图

## REMOVED Requirements

### Requirement: 传统表单式工作台
**Reason**: 即梦采用Agent模式单输入框设计，更加简洁高效
**Migration**: 改造为即梦风格的单输入框 + 参数折叠面板

### Requirement: 列表式历史记录
**Reason**: 即梦采用时间线网格瀑布流，视觉效果更好
**Migration**: 改造为按日期分组的瀑布流网格布局

### Requirement: 图片生成页面中的复杂选项
**Reason**: 帧类型、关联镜头、Scale 等高级选项在即梦中被简化或整合
**Migration**: 将这些选项整合到参数折叠面板中，默认隐藏
