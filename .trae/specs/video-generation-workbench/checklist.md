# Checklist

## 类型定义
- [x] VideoGenerationTask 接口包含所有必需字段（taskId、requestId、mode、reqKey、prompt等）
- [x] TaskQueueStatus 包含所有状态值（submitting、in_queue、generating、done、failed、expired、not_found）
- [x] API相关类型定义完整（SubmitTaskParams、SubmitTaskResponse、TaskResultResponse）

## API服务层
- [x] submitVideoTask 函数实现，支持三种模式参数
- [x] queryTaskResult 函数实现，正确解析返回数据
- [x] poller 实现每5秒轮询，正确处理状态终态停止
- [x] Mock适配器模拟异步延迟和状态流转
- [x] 图片处理工具函数正确校验格式、大小、比例
- [x] getImageAspectRatio 正确计算图片宽高比

## 状态管理
- [x] generationStore 包含 tasks、pollingTasks 状态
- [x] addTask、updateTask、deleteTask 操作正确
- [x] 轮询器正确启动和停止，不会内存泄漏
- [x] 视频URL过期检测定时器正确工作
- [x] Mock数据正确初始化到Store

## 组件
- [x] ImageUploader 支持拖拽上传和点击上传
- [x] ImageUploader 正确校验图片（格式、大小≤4.7MB、分辨率）
- [x] ImageUploader 显示图片预览和比例信息
- [x] VideoPlayer 支持播放/暂停/进度控制
- [x] TaskCard 正确显示任务状态、进度条、耗时
- [x] TaskCard 根据状态显示不同操作按钮
- [x] PromptInput 实时显示字数统计
- [x] PromptInput 超过限制时显示警告

## 视频生成工作台页面
- [x] 模式选择器正确切换三种模式
- [x] 图片上传区域根据模式动态显示/隐藏
- [x] 首尾帧模式下校验两图比例一致性
- [x] Prompt输入带字数统计和校验
- [x] 参数配置（时长、比例、Seed）正确工作
- [x] 提交按钮在表单不完整时禁用
- [x] 任务提交后创建轮询任务
- [x] 任务队列实时更新状态和进度
- [x] 任务状态变化时正确显示Toast通知

## 生成历史页面
- [x] 历史任务列表正确展示
- [x] 搜索功能按Prompt过滤
- [x] 状态筛选正确工作
- [x] 模式筛选正确工作
- [x] 分页功能正确
- [x] 点击查看任务详情正确跳转

## 任务详情页面
- [x] 展示任务完整信息（输入参数、输出结果）
- [x] 显示首帧/尾帧图片预览
- [x] 视频播放器正确加载和播放
- [x] 视频URL过期倒计时正确显示
- [x] 下载按钮触发浏览器下载
- [x] 重新生成按钮正确工作
- [x] 返回按钮正确跳转

## 路由和导航
- [x] /content/video-generation 路由正确
- [x] /content/generation-history 路由正确
- [x] /content/task/:id 路由正确
- [x] 侧边栏显示"视频生成"和"生成历史"导航项
- [x] 导航项高亮当前页面

## 错误处理
- [x] 输入审核失败（50411/50412/50413）显示不可重试提示
- [x] 输出审核失败（50511/50516）显示可重试提示
- [x] QPS/并发超限（50429/50430）自动重试
- [x] 任务过期/未找到正确显示
- [x] 视频URL过期前10分钟提醒

## 构建和类型检查
- [x] TypeScript 编译无错误
- [x] 无 ESLint 警告
- [x] 应用正常启动运行
