# 系统设置完善计划

## 问题概述
1. **系统设置 - 外观设置**：缺少保存按钮（外观设置修改主题后立即生效，需要添加保存确认按钮）
2. **AI 能力配置**：缺少保存按钮，且缺少 DeepSeek AI 配置区块（用于优化提示词）
3. **系统配置菜单**：缺少全局日志功能

## 实施步骤

### 1. 系统设置 - 外观设置添加保存按钮
- **文件**：`src/pages/system/Settings.tsx`
- **改动**：在外观设置 TabContent 底部添加保存按钮，调用 `handleSave` 保存外观相关设置到 localStorage
- **细节**：将 `theme` 也存入 settings 对象，统一通过保存按钮持久化

### 2. AI 能力配置添加保存按钮
- **文件**：`src/pages/system/AIConfigPanel.tsx`
- **改动**：在页面底部操作按钮区左侧添加「保存配置」按钮（绿色主按钮），放在「导入配置」「导出配置」「重置默认」按钮左侧
- **细节**：保存按钮调用 `useAIConfigStore` 的持久化（aiConfigStore 的 `updateGeneral`/`updateVideoEndpoint`/`updateImageEndpoint` 已经自动保存到 localStorage，保存按钮作为视觉确认和 toast 提示）

### 3. AI 能力配置添加 DeepSeek AI 配置区块
- **文件**：`src/types/aiConfig.ts`、`src/services/aiConfigService.ts`、`src/store/aiConfigStore.ts`、`src/pages/system/AIConfigPanel.tsx`
- **改动**：
  - 类型定义中新增 `DeepSeekConfig` 接口：包含 `enabled`、`baseUrl`、`apiKey`、`model`（如 deepseek-chat）、`temperature`、`maxTokens`、`timeout`
  - `AIConfig` 接口新增 `deepseek: DeepSeekConfig` 字段
  - `getDefaultAIConfig()` 新增 deepseek 默认值
  - `aiConfigService` 新增 `getDeepSeekConfig()` 方法
  - `aiConfigStore` 新增 `updateDeepSeek()` 方法
  - `AIConfigPanel.tsx` 新增 DeepSeek AI 配置区块（在图片生成 API 之后），包含所有上述字段的表单
  - DeepSeek 用途说明：用于优化提示词（prompt optimization）

### 4. 系统配置菜单新增全局日志
- **文件**：`src/components/Sidebar.tsx`、`src/components/Header.tsx`、`src/App.tsx`
- **改动**：
  - Sidebar.tsx 系统配置 children 新增 `{ path: '/system/logs', label: '全局日志' }`
  - Header.tsx 面包屑新增 `'/system/logs': ['系统配置', '全局日志']`
  - App.tsx 新增路由 `<Route path="system/logs" element={<SystemLogs />} />`
  - 创建 `src/pages/system/SystemLogs.tsx`：全局日志查看页面
    - 模拟日志数据（至少 30 条）
    - 日志级别筛选（全部/Error/Warning/Info/Debug）
    - 日志来源筛选（全部/视频生成/图片生成/系统/用户操作）
    - 时间范围筛选
    - 日志表格：时间戳、级别、来源、消息、操作（查看详情）
    - 分页
    - 支持清空日志
    - 支持导出日志为文件

## 依赖关系
- 步骤 3 中类型定义 → 服务层 → Store → UI 组件 的顺序
- 步骤 1、2、4 可以并行执行
