# 修复"创建"按钮无响应问题

## 问题描述
用户报告以下三个"创建"按钮点击异常：
1. **首图/尾图管理** - "创建" 按钮
2. **镜头管理** - "创建镜头" 按钮
3. **资产管理** - "创建资产" 按钮

## 根因分析

经过代码审查，发现以下关键问题：

### 问题1：缺少 `tailwindcss-animate` 插件（核心原因）
Dialog、Select、AlertDialog 等 shadcn/ui 组件大量使用动画类：
- `animate-in` / `animate-out`
- `fade-in-0` / `fade-out-0`
- `zoom-in-95` / `zoom-out-95`
- `slide-in-from-*` / `slide-out-to-*`

这些类由 `tailwindcss-animate` 插件提供，但当前 `tailwind.config.js` 的 `plugins: []` 为空，**未安装此插件**。导致：
- Dialog 打开时动画类不存在，CSS 无法正确渲染
- `data-[state=open]:animate-in` 等条件类完全无效
- Dialog 可能渲染了但视觉上不可见或行为异常

### 问题2：缺少 shadcn/ui CSS 变量
Button 组件使用了 `ring-offset-background` 和 `ring-ring` 类，这些引用了未定义的 CSS 变量：
- `--background`（ring-offset-background 引用）
- `--ring`（ring-ring 引用）
- `--foreground`、`--primary` 等

当前 `index.css` 和 `tailwind.config.js` 均未定义这些变量，导致组件样式异常。

### 问题3：残留 Vite 模板文件
- `src/main.ts` - Vite 原始模板入口，引用不存在的资源文件，导致 TS 编译报错
- `src/style.css` - Vite 模板样式，包含 `#app`、`#center` 等全局选择器
- `src/counter.ts` - Vite 模板计数器

虽然这些文件未被 React 应用加载，但它们的存在可能导致 IDE 误报和 TypeScript 编译错误。

## 修复步骤

### 步骤1：安装 tailwindcss-animate 插件
```bash
npm install -D tailwindcss-animate
```

### 步骤2：更新 tailwind.config.js
- 在 `plugins` 数组中添加 `require("tailwindcss-animate")`
- 添加 shadcn/ui 所需的 CSS 变量映射到 `theme.extend` 中

### 步骤3：在 index.css 中添加 shadcn/ui CSS 变量
在 `@layer base` 中为 `:root` 和 `.dark` 添加完整的 CSS 变量定义：
- `--background`、`--foreground`
- `--ring`、`--ring-offset`
- `--primary` 系列
- `--secondary` 系列
- `--muted` 系列
- `--accent` 系列
- `--destructive` 系列
- `--border`、`--input`、`--card` 等

### 步骤4：清理 Vite 模板残留文件
删除以下文件：
- `src/main.ts`
- `src/style.css`
- `src/counter.ts`
- `src/assets/typescript.svg`、`src/assets/vite.svg`、`src/assets/hero.png`（如果存在）

### 步骤5：验证修复
- 运行 `npx tsc --noEmit` 确认无编译错误
- 启动开发服务器
- 逐一测试三个"创建"按钮，确认弹窗正常打开
