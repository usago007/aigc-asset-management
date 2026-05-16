# 旧 Store 迁移计划

## 背景

系统中目前存在两套状态管理 Store：
- **旧 Store**：`src/store/generationStore.ts`（基于 Zustand，主要用于视频生成任务）
- **新 Store**：`src/store/appStore.ts`（已扩展支持图片生成任务）

经过全量排查，发现仍有 **5 个文件** 在使用旧的 `useGenerationStore`，需要统一迁移到 `appStore`。

## 审计结果

### 仍在使用旧 Store 的文件

| 文件 | 状态 | 迁移难度 |
|------|------|----------|
| `src/pages/content/VideoGeneration.tsx` | 视频生成主页面 | 中 |
| `src/pages/content/GenerationHistory.tsx` | 视频生成历史页面 | 中 |
| `src/pages/content/TaskDetail.tsx` | 任务详情页面 | 高 |
| `src/pages/dashboard/Overview.tsx` | 仪表盘总览页面 | 低 |
| `src/pages/dashboard/Generation.tsx` | 仪表盘统计页面 | 低 |

### 混合使用两个 Store 的文件

`Overview.tsx` 和 `Generation.tsx` 同时引用了 `useAppStore` 和 `useGenerationStore`，是迁移的优先目标。

### 已废弃但仍存在的代码

- `src/store/generationStore.ts`：迁移完成后需删除
- 相关类型定义（已移至 `src/types/generation.ts`）：
  - `VideoGenerationTask`
  - `VideoGenerationMode`
  - `TaskQueueStatus`
  - `submitTask`、`retryTask`、`cancelTask`、`deleteTask` 等方法

## 迁移方案

### 第一阶段：扩展 appStore 支持视频任务

1. 在 `appStore.ts` 中添加视频任务状态：
   - `videoTasks: VideoGenerationTask[]`
   - `submitVideoTask()`、`retryVideoTask()`、`cancelVideoTask()`、`deleteVideoTask()`
   - `checkExpiringVideos()`（视频过期检测逻辑）

2. 更新 `src/types/generation.ts`：
   - 保留 `VideoGenerationTask` 类型
   - 确保类型定义完整

### 第二阶段：逐页面迁移

#### 2.1 Overview.tsx（仪表盘总览）
- 移除 `useGenerationStore` 引用
- 将 `const { tasks: videoTasks } = useGenerationStore()` 改为从 `useAppStore()` 获取
- 更新相关计算逻辑

#### 2.2 Generation.tsx（仪表盘统计）
- 移除 `useGenerationStore` 引用
- 将 `const { tasks: videoTasks } = useGenerationStore()` 改为从 `useAppStore()` 获取
- 更新统计图表数据源

#### 2.3 VideoGeneration.tsx（视频生成主页面）
- 移除 `useGenerationStore` 引用
- 将 `submitTask`、`retryTask`、`cancelTask` 改为调用 `appStore` 对应方法
- 更新任务列表数据源

#### 2.4 GenerationHistory.tsx（视频生成历史）
- 移除 `useGenerationStore` 引用
- 将任务列表获取改为 `appStore`
- 保留 `VideoThumbnailCard` 等 UI 组件

#### 2.5 TaskDetail.tsx（任务详情）
- 移除 `useGenerationStore` 引用
- 将 `updateTask` 等方法改为 `appStore` 调用
- 更新视频播放器、过期倒计时等逻辑

### 第三阶段：清理旧代码

1. 删除 `src/store/generationStore.ts`
2. 检查并移除相关的无用导入
3. 运行 TypeScript 编译检查，确保无类型错误
4. 运行应用验证功能正常

## 实施步骤

1. 扩展 `appStore.ts` 添加视频任务管理
2. 迁移 `Overview.tsx` 和 `Generation.tsx`（混合使用，优先级高）
3. 迁移 `VideoGeneration.tsx`
4. 迁移 `GenerationHistory.tsx`
5. 迁移 `TaskDetail.tsx`
6. 删除 `generationStore.ts`
7. 运行 `npm run lint` 和 `npm run typecheck` 验证
8. 提交代码

## 风险评估

- **低风险**：Overview.tsx 和 Generation.tsx 仅读取任务数据用于展示
- **中风险**：VideoGeneration.tsx 涉及任务提交和状态管理
- **高风险**：TaskDetail.tsx 涉及任务更新、视频播放器等复杂逻辑

迁移过程中需保持功能等价，确保所有视频生成相关功能正常工作。
