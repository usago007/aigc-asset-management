# Tasks

- [x] 任务 1：创建 JimengInput 组件
  - [x] 创建 `src/components/JimengInput.tsx`
  - [x] 实现圆角大输入框（多行文本）
  - [x] 实现左侧附件上传按钮（图片/视频）
  - [x] 实现底部操作栏（参数按钮）
  - [x] 实现右侧语音输入 + 提交按钮
  - [x] 实现图片预览条
  - [x] 实现字数统计
  - [x] 实现聚焦高亮动画
  - [x] 实现 disabled 状态

- [x] 任务 2：创建 CreationTypeMenu 组件
  - [x] 创建 `src/components/CreationTypeMenu.tsx`
  - [x] 实现下拉选择器
  - [x] 实现分组支持
  - [x] 实现图标 + 标签 + 描述
  - [x] 实现选中高亮
  - [x] 实现点击外部关闭

- [x] 任务 3：创建 ParamPanel 组件
  - [x] 创建 `src/components/ParamPanel.tsx`
  - [x] 实现折叠/展开功能
  - [x] 实现参数分组
  - [x] 实现数量徽章
  - [x] 实现默认展开/收起

- [ ] 任务 4：创建 TimelineGrid 组件
  - [ ] 创建 `src/components/TimelineGrid.tsx`
  - [ ] 实现日期自动分组
  - [ ] 实现瀑布流网格布局
  - [ ] 实现 Hover 操作按钮覆盖层
  - [ ] 实现 badge 标签
  - [ ] 实现 prompt 预览
  - [ ] 实现空状态提示

- [x] 任务 5：重构图片生成工作台
  - [x] 重写 `src/pages/content/ImageGeneration.tsx` 使用 JimengInput + ParamPanel + CreationTypeMenu
  - [x] 实现 Agent 模式标题"开启你的 Agent 模式 · 即刻造梦！"
  - [x] 实现创作类型下拉菜单
  - [x] 实现单输入框布局
  - [x] 实现参数折叠面板（生成模式、分辨率、宽高比、Seed、Scale、帧类型、关联镜头）
  - [x] 实现生成结果卡片网格展示
  - [x] 实现活跃任务展示
  - [x] 保留所有现有功能（Store 调用、任务提交等）

# Task Dependencies
- 任务 1-3 无依赖，可并行执行
- 任务 5 依赖于 任务 1-3 完成
- 任务 4 无依赖
