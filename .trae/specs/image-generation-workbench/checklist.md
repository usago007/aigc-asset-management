# Checklist

## 类型定义
- [x] ImageGenerationMode 包含五种模式
- [x] ImageGenerationTask 包含所有必需字段（含 keyFrameIds、shotId、frameType 关联字段）
- [x] API相关类型完整（ImageSubmitTaskParams, ImageSubmitTaskResponse, ImageTaskResultResponse）

## API服务层
- [x] imageGeneration.ts 支持四种接口，req_key映射正确
- [x] imageMockAdapter.ts 模拟图片生成API，支持组图输出
- [x] poller.ts 支持图片任务轮询（复用现有轮询逻辑）

## appStore扩展
- [x] imageTasks 状态添加到 appStore
- [x] 图片生成任务 CRUD 方法正确
- [x] submitImageTask 提交任务并启动轮询
- [x] createKeyFramesFromImages 为每张输出图创建 KeyFrame 并更新 Shot 的 firstFrameId/lastFrameId
- [x] Mock数据正确初始化

## 图片生成工作台页面
- [x] 五种模式切换正确，UI根据模式动态变化
- [x] 帧类型选择（Opening/Ending）正确
- [x] 关联镜头下拉框正确显示可用镜头列表
- [x] 多图上传按模式限制数量（文生图0、图生图1-10、风格化1-14、超清1、inpainting 1）
- [x] 参数配置完整（分辨率1K-4K、宽高比、forceSingle、scale、seed）
- [x] 任务提交后启动轮询
- [x] 任务队列实时更新
- [x] 结果图片网格展示，支持预览、下载
- [x] "设为首帧/尾帧"功能正确更新 Shot 关联

## 图片生成历史页面
- [x] 历史列表正确展示
- [x] 搜索、筛选、分页正确
- [x] 图片预览和下载正确
- [x] 重新关联到镜头功能正确

## 路由和导航
- [x] /content/image-generation 路由正确
- [x] /content/image-generation-history 路由正确
- [x] 侧边栏显示"图片生成"和"图片历史"导航项
- [x] 导航项高亮当前页面

## 系统整合验证
- [x] 图片生成结果正确创建为 KeyFrame 记录
- [x] KeyFrame 的 modelName/modelVersion/promptText 正确设置
- [x] 关联镜头后，Shot 的 firstFrameId/lastFrameId 正确更新
- [x] 在首图/尾图管理页面可以看到新生成的图片
- [x] 在镜头管理页面可以看到关联的首尾图

## 构建和类型检查
- [x] TypeScript 编译无错误
- [x] 应用正常启动运行
