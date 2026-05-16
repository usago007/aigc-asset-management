# 全页面模拟数据填充方案

## 目标

为所有页面填充至少 30 条模拟数据，完善分页显示和进度条。涉及图片的页面使用化妆品相关图片。

## 现状

当前 appStore 中 Mock 数据总计约 40 条，各页面数据量从 2~6 条不等，分页器无法发挥作用。

## 实施计划

### 第一部分：创建统一的 Mock 数据生成工具

**文件**: `src/utils/mockData.ts`（新建）

包含：
- `generateCustomers(count: number)` — 生成客户数据
- `generateBrands(count: number, customers: Customer[])` — 生成品牌数据
- `generateProjects(count: number, brands: Brand[])` — 生成项目数据
- `generateBriefs(count: number, projects: Project[])` — 生成简报数据
- `generateTasks(count: number, projects: Project[])` — 生成任务数据
- `generateReviews(count: number)` — 生成审核数据
- `generateKeyFrames(count: number, shots: Shot[])` — 生成首图/尾图
- `generateShots(count: number, projects: Project[])` — 生成镜头数据
- `generateAssets(count: number, shots: Shot[])` — 生成资产数据
- `generateImageTasks(count: number)` — 生成图片生成任务
- `generateVideoTasks(count: number)` — 生成视频生成任务
- 化妆品图片 URL 池（使用 picsum.photos 和 unsplash 的化妆品相关图片）

**化妆品图片 URL 池（30+ 张）**：
```
https://images.unsplash.com/photo-1596462502278-27bfd9478d5e3w=400&h=300&fit=crop
https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop
https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop
... (共 30+ 张，涵盖护肤品、彩妆、香水等)
```

### 第二部分：更新 appStore.ts 的初始数据

**文件**: `src/store/appStore.ts`

将现有的硬编码 Mock 数据（3~5 条）替换为调用 mockData 生成器，每种类型至少 35 条。

数据量目标：
| 数据类型 | 当前数量 | 目标数量 |
|----------|---------|---------|
| Customer | 3 | 35 |
| Brand | 4 | 35 |
| Project | 3 | 35 |
| Brief | 2 | 35 |
| Task | 3 | 35 |
| Review | 3 | 35 |
| KeyFrame | 5 | 35 |
| Shot | 3 | 35 |
| Asset | 3 | 35 |
| GenerationVersion | 5 | 35 |
| Role | 6 | 6 (保持不变) |
| ImageGenerationTask | 0 | 35 |

### 第三部分：更新 generationStore.ts 的初始数据

**文件**: `src/store/generationStore.ts`

添加 35 条 VideoGenerationTask 模拟数据，覆盖所有 TaskQueueStatus 状态。

### 第四部分：检查并完善分页组件

**文件**: `src/components/Pagination.tsx`

确认现有 Pagination 组件能正确处理 30+ 条数据的分页显示（当前 pageSize=10，应能显示 4 页）。

检查各页面的 `pageSize` 设置，确保：
- 标准表格页面使用 `pageSize = 10` 或 `15`
- 图片网格页面也应有分页或进度指示

### 第五部分：Dashboard 进度条

**文件**: `src/pages/dashboard/Dashboard.tsx`

确保仪表盘中的统计卡片、最近活动、快捷操作等模块能正确展示大量数据下的摘要信息。

### 第六部分：图片生成历史记录分页

**文件**: `src/pages/content/ImageGenerationHistory.tsx`

确认当前手动实现的上一页/下一页按钮在 35 条数据下正常工作。

## 详细 Mock 数据设计

### Customer (35条)
公司名称池: 华美集团、星辰科技、绿意生活、美妆时代、雅诗集团、兰蔻中国、欧莱雅集团、资生堂中国、SK-II中国、香奈儿美妆...
联系人池: 张经理、李总监、王女士、赵总、刘经理、陈主管、周总监、黄经理、林总监、吴主管...
角色组合: [项目经理], [创意人员], [审核人员], [项目经理, 创意人员], [创意人员, 审核人员]...

### Brand (35条)
品牌名称池: 雅诗兰黛、兰蔻、迪奥、香奈儿、SK-II、资生堂、欧莱雅、玉兰油、倩碧、娇韵诗...
行业: 护肤品、彩妆、香水、个人护理、男士护理、母婴护肤、敏感肌专用、抗衰老...

### Project (35条)
项目名称池: 2024春季护肤新品广告、夏日防晒 campaign、秋冬彩妆系列、男士护肤升级、抗老精华发布...
阶段: Planning, InProduction, Review, Completed

### KeyFrame (35条)
名称池: 开场-产品特写、结尾-品牌LOGO、场景-实验室、氛围-SPA体验、对比-使用前后...
类型: Opening / Ending 各半
状态: Pending, Completed, Failed

### Shot (35条)
镜头名称池: 开场镜头、产品特写、模特使用、成分展示、效果对比、品牌结尾...
描述涵盖: 运镜方式、场景描述、技术要求

### Asset (35条)
名称池: 产品渲染图、模特精修图、成分信息图、效果对比图、品牌VI元素...
类型: Image, Video, 3D Model, Audio
格式: PNG, JPG, MP4, MOV, GLB

### Brief (35条)
名称池: Q1护肤广告Brief、夏日彩妆Brief、新品发布Brief、节日促销Brief...
状态: Draft, InProgress, Completed, Archived

### Task (35条)
名称池: 视频剪辑、特效制作、配音录制、字幕翻译、调色处理...
类型: 生成, 审核, 交付
状态: Pending, InProgress, Completed

### Review (35条)
名称池: V1初版审核、客户反馈修改、最终版本确认、内部审核...
状态: Pending, Approved, Rejected
类型: Internal, Client

### ImageGenerationTask (35条)
提示词池: 高端护肤品广告图、口红色号展示、香水产品摄影、面膜使用场景...
模式: text-to-image, image-to-image, stylization-edit...
状态: done, generating, in_queue, failed

### VideoGenerationTask (35条)
提示词池: 30秒护肤品广告、产品展示动画、模特使用场景...
模式: text-to-video, image-to-video-first, image-to-video-first-tail
状态: done, generating, in_queue, failed, cancelled
