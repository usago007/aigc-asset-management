# Tasks

- [x] Task 1: 创建 AI 配置数据类型定义
  - [x] SubTask 1.1: 创建 src/types/aiConfig.ts，定义 AIEndpointConfig、VideoAIConfig、ImageAIConfig、AIGeneralConfig、AIConfig 类型
  - [x] SubTask 1.2: 定义默认配置常量函数 getDefaultAIConfig()

- [x] Task 2: 创建 AI 配置服务层
  - [x] SubTask 2.1: 创建 src/services/aiConfigService.ts，实现 getAIConfig、saveAIConfig、resetAIConfig
  - [x] SubTask 2.2: 实现 getVideoReqKey、getImageReqKey、getVideoEndpointConfig、getImageEndpointConfig

- [x] Task 3: 创建 AI 配置 Zustand Store
  - [x] SubTask 3.1: 创建 src/store/aiConfigStore.ts，定义 AIConfigState 接口和 zustand store
  - [x] SubTask 3.2: 实现 loadConfig、updateGeneral、updateVideoEndpoint、updateImageEndpoint、resetToDefaults、exportConfig、importConfig 方法
  - [x] SubTask 3.3: 在 store 初始化时自动加载配置（通过 App.tsx 中的 AIConfigLoader 组件）

- [x] Task 4: 改造视频生成服务
  - [x] SubTask 4.1: 修改 src/services/videoGeneration.ts，移除 VIDEO_API_CONFIG 硬编码常量
  - [x] SubTask 4.2: getReqKeyForMode 改为从 aiConfigStore 读取
  - [x] SubTask 4.3: submitVideoTask 和 queryTaskResult 使用动态配置

- [x] Task 5: 改造图片生成服务
  - [x] SubTask 5.1: 修改 src/services/imageGeneration.ts，移除 IMAGE_API_CONFIG 中的 BASE_URL、POLL_INTERVAL、EXPIRY 等
  - [x] SubTask 5.2: getReqKeyForMode 改为从 aiConfigStore 读取
  - [x] SubTask 5.3: 保留 model_names 和 model_versions 映射

- [x] Task 6: 创建 AI 能力配置 UI 组件
  - [x] SubTask 6.1: 创建 src/pages/system/AIConfigPanel.tsx，实现 AI 配置管理界面
  - [x] SubTask 6.2: 实现通用 AI 配置区块（BASE_URL、apiKey、appId、轮询、过期）
  - [x] SubTask 6.3: 实现视频生成 API 配置区块（3 个端点）
  - [x] SubTask 6.4: 实现图片生成 API 配置区块（5 个端点）
  - [x] SubTask 6.5: 实现导入导出、重置、多环境切换功能
  - [x] SubTask 6.6: 实现表单校验

- [x] Task 7: 整合系统设置页面
  - [x] SubTask 7.1: 修改 src/pages/system/Settings.tsx，使用 Tabs 重组为三个选项卡
  - [x] SubTask 7.2: 选项卡1：通用设置（语言、每页条数、通知、自动保存）
  - [x] SubTask 7.3: 选项卡2：外观设置（主题切换）
  - [x] SubTask 7.4: 选项卡3：AI 能力配置（嵌入 AIConfigPanel）

- [x] Task 8: 验证与测试
  - [x] SubTask 8.1: 运行 npx tsc --noEmit 确认 TypeScript 编译通过
  - [x] SubTask 8.2: 启动开发服务器，验证设置页面 Tabs 切换正常
  - [x] SubTask 8.3: 验证 AI 配置的 CRUD 操作
  - [x] SubTask 8.4: 验证导入导出功能
  - [x] SubTask 8.5: 验证视频和图片生成服务仍正常工作

# Task Dependencies

- Task 2 依赖 Task 1
- Task 3 依赖 Task 1 和 Task 2
- Task 4 依赖 Task 2 和 Task 3
- Task 5 依赖 Task 2 和 Task 3
- Task 6 依赖 Task 3
- Task 7 依赖 Task 6
- Task 8 依赖 Task 4、Task 5、Task 7
