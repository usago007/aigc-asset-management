# 统一表格和页面样式不一致问题

## 问题描述

对比首图/尾图管理页面（标准样式）与客户管理页面（旧样式），发现多处样式不一致：

| 元素 | 标准样式（KeyFrames 等） | 旧样式（Customers/Brands/Projects/Tasks） |
|------|-------------------------|----------------------------------------|
| 表头分隔线 | `border-b border-gray-200 dark:border-gray-800` | `border-b border-gray-700/50` |
| 行分隔线 | `border-b border-gray-200/50 dark:border-gray-800/50` | `border-b border-gray-700/30` |
| 行悬停 | `hover:bg-gray-100 dark:hover:bg-gray-800/30` | `hover:bg-gray-800/30` |
| 描述文字 | `text-gray-600 dark:text-gray-500 mt-1` | `text-gray-500 dark:text-gray-400 mt-1` |
| 搜索图标 | `text-gray-500 dark:text-gray-400` | `text-gray-500` |
| 搜索区容器 | `flex items-center gap-4` 内有状态筛选 | 仅搜索框无 gap |

## 根因

UI 升级过程中，新页面（KeyFrames/Shots/Assets）使用了正确的 dual-theme 样式，但部分旧页面（Customers/Brands/Projects/Tasks）仍保留了暗色优先时代的单一样式类。

## 修复方案

将所有不一致的样式统一为标准样式（与 KeyFrames.tsx 一致）。

### 步骤1：修复 Customers.tsx（4 处）
- 行82: `text-gray-500 dark:text-gray-400` → `text-gray-600 dark:text-gray-500`
- 行90: `text-gray-500` → `text-gray-500 dark:text-gray-400`
- 行102: `border-b border-gray-700/50` → `border-b border-gray-200 dark:border-gray-800`
- 行113: `border-b border-gray-700/30 hover:bg-gray-800/30` → `border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30`

### 步骤2：修复 Brands.tsx（5 处）
- 行76: `text-gray-500 dark:text-gray-400` → `text-gray-600 dark:text-gray-500`
- 行84: `text-gray-500` → `text-gray-500 dark:text-gray-400`
- 行91: `border-b border-gray-700/50` → `border-b border-gray-200 dark:border-gray-800`
- 行102: `border-b border-gray-700/30 hover:bg-gray-800/30` → `border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30`
- 行147: `text-gray-500` → `text-gray-500 dark:text-gray-400`（搜索图标 dark 模式）

### 步骤3：修复 Projects.tsx（4 处）
- 行100: `text-gray-500 dark:text-gray-400` → `text-gray-600 dark:text-gray-500`
- 行108: `text-gray-500` → `text-gray-500 dark:text-gray-400`
- 行120: `border-b border-gray-700/50` → `border-b border-gray-200 dark:border-gray-800`
- 行133: `border-b border-gray-700/30 hover:bg-gray-800/30` → `border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30`

### 步骤4：修复 Tasks.tsx（5 处）
- 行99: `text-gray-500 dark:text-gray-400` → `text-gray-600 dark:text-gray-500`
- 行108: `text-gray-500` → `text-gray-500 dark:text-gray-400`
- 行127: `border-b border-gray-700/50` → `border-b border-gray-200 dark:border-gray-800`
- 行139: `border-b border-gray-700/30 hover:bg-gray-800/30` → `border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30`
- 搜索图标 dark 模式适配

### 步骤5：验证
- `npx tsc --noEmit` 确认编译通过
- 浏览器中对比各页面表格样式一致性
