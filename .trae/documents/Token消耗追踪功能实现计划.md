# Token消耗追踪功能实现计划

## 背景分析

当前系统中，图片/视频生成任务没有记录token消耗。通过查阅即梦API文档发现：

**图片生成API返回**（如即梦4.0-文生图）：
```json
"usage": {
  "prompt_tokens": 0,
  "completion_tokens": 0,
  "total_tokens": 15908,
  "output_tokens": 15908
}
```

**视频生成API返回**：
```json
"usage": {
  "prompt_tokens": 1,
  "completion_tokens": 1,
  "total_tokens": 2
}
```

即梦API的`total_tokens`并非传统LLM文本token，而是**算力/积分消耗**的等价表示。图片生成每次消耗约1.5万~2万token，视频生成消耗较少。这些数据在API响应中是真实返回的，可以被我们获取和展示。

## 实施步骤

### 步骤1：扩展类型定义，添加token字段

修改 `src/types/generation.ts`：
- `VideoGenerationTask` 添加 `tokensUsed?: number` 字段
- `ImageGenerationTask` 添加 `tokensUsed?: number` 字段
- `SubmitTaskResponse` 添加 `usage?: { total_tokens: number }` 
- `TaskResultResponse` 添加 `usage?: { total_tokens: number }`
- `ImageSubmitTaskResponse` 添加 `usage?: { total_tokens: number }`
- `ImageTaskResultResponse` 添加 `usage?: { total_tokens: number }`

### 步骤2：更新Mock数据，模拟真实token消耗

修改 `src/services/mockAdapter.ts`：
- `mockSubmitTask` 返回中增加 `usage: { total_tokens: 0 }`（提交时不消耗）
- `mockQueryTaskResult` 完成时返回 `usage: { total_tokens: 随机值(1000~5000) }`（视频token消耗较低）

修改 `src/services/imageMockAdapter.ts`：
- `mockImageSubmitTask` 返回中增加 `usage: { total_tokens: 0 }`
- `mockImageQueryTaskResult` 完成时返回 `usage: { total_tokens: 随机值(12000~25000) }`（图片token消耗较高）

修改 `src/utils/mockData.ts`：
- `generateVideoTasks` 为已完成任务随机分配 `tokensUsed`
- `generateImageTasks` 为已完成任务随机分配 `tokensUsed`

### 步骤3：更新Store，捕获token数据

修改 `src/store/generationStore.ts`：
- `submitTask` 完成后从API响应中提取 `usage.total_tokens` 更新到任务
- `retryTask` 同理
- `addTask` 中初始化 `tokensUsed: 0`

修改 `src/store/appStore.ts`：
- `submitImageTask` 完成后提取token数据
- `retryImageTask` 同理
- `createKeyFramesFromImages` 不需要token（它不是API调用）

### 步骤4：在生成Tab中展示token消耗

修改 `src/pages/dashboard/Generation.tsx`：
- 顶部统计卡片增加"总消耗Token"（汇总所有任务的tokensUsed）
- 模型使用排行中，hover显示该模型的累计token消耗
- 成功率卡片旁边增加平均每次生成的token消耗

### 步骤5：在生成任务列表页面展示token

修改 `src/pages/content/ImageGeneration.tsx` 和视频生成相关页面：
- 任务列表中增加token消耗列
- 任务卡片显示本次生成消耗的token数

### 步骤6：验证

运行 `npm run build` 确保编译通过，确认所有token相关数据流正确。
