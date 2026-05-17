# 修复 Dashboard 页面默认主题为 Light Mode

## 问题
用户反馈 Dashboard 页面显示异常太暗，标题都是暗色的。当前默认主题为 dark，不符合用户期望。

## 修复步骤

### 1. 修改 ThemeContext.tsx 默认主题
**文件**: `src/context/ThemeContext.tsx`
- 将 `theme` 默认值从 `'dark'` 改为 `'light'`
- 具体修改 `useState` 初始值函数：
  - 第 22 行：`return 'dark'` → `return 'light'`

### 2. 修改 index.html 默认主题
**文件**: `index.html`
- 将 `<script>` 中的默认主题从 `'dark'` 改为 `'light'`
- 具体修改第 15 行：`theme = 'dark'` → `theme = 'light'`

### 3. 验证
- 刷新页面确认背景为浅灰色（`bg-gray-50`）
- 确认标题文字为深色（`text-gray-900`）
- 确认所有 Dashboard 子页面颜色正常
