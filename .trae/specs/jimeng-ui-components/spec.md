# 即梦风格共享 UI 组件 Spec

## Why
即梦风格改造需要多个页面共享一致的 UI 组件。将这些组件抽离为独立可复用组件，避免代码重复，确保设计一致性。

## What Changes
- 新增 `JimengInput.tsx` - Agent 风格统一输入框
- 新增 `CreationTypeMenu.tsx` - 创作类型下拉菜单
- 新增 `ParamPanel.tsx` - 参数折叠面板
- 新增 `TimelineGrid.tsx` - 时间线瀑布流网格

## Impact
- Affected code:
  - `src/components/JimengInput.tsx`（新增）
  - `src/components/CreationTypeMenu.tsx`（新增）
  - `src/components/ParamPanel.tsx`（新增）
  - `src/components/TimelineGrid.tsx`（新增）

## ADDED Requirements

### Requirement: JimengInput 输入框组件
The component SHALL provide a Jimeng-style unified input box:
- 圆角大输入框，支持多行文本
- 左侧附件上传按钮（支持图片/视频）
- 底部操作栏（参数按钮、自动模式等）
- 右侧语音输入按钮 + 提交按钮
- 支持图片预览条（上传后显示缩略图）
- 支持字数统计
- 支持聚焦时边框高亮动画
- 支持 disabled 状态
- 支持自定义左侧/底部操作按钮

### Requirement: CreationTypeMenu 下拉菜单
The component SHALL provide a creation type selection dropdown:
- 显示当前选中类型及图标
- 点击展开下拉选项
- 支持分组（如 Agent 模式下的子选项）
- 支持图标 + 标签 + 描述
- 选中项高亮标记
- 点击外部自动关闭
- onChange 回调返回选中的类型 ID，调用方需自行实现路由跳转逻辑

### Requirement: ParamPanel 参数面板
The component SHALL provide a collapsible parameter panel:
- 标题栏显示参数名称和数量徽章
- 点击标题栏展开/收起内容
- 内容区域支持多个参数分组
- 每个分组可带图标和标签
- 支持默认展开/收起状态
- 半透明背景，与页面融合

### Requirement: TimelineGrid 时间线网格
The component SHALL provide a timeline-based grid display:
- 按日期自动分组
- 日期标题显示（如"3月14日"），使用中文月份格式
- 网格布局展示缩略图（默认4列，响应式2-4列）
- 正方形 aspect-ratio 容器
- Hover 显示操作按钮覆盖层（渐变背景）
- 显示 badge 标签
- 显示 prompt 预览
- 支持自定义操作按钮
- 空状态提示
- 列数配置必须使用静态 Tailwind 类名映射，禁止动态拼接（如 `md:grid-cols-4` 必须在源码中完整出现）
