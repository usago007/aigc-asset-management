# Tasks

- [x] Task 1: 创建4个仪表盘子页面文件
  - [x] SubTask 1.1: 创建 `src/pages/dashboard/Overview.tsx`，内容为原OverviewTab组件
  - [x] SubTask 1.2: 创建 `src/pages/dashboard/Generation.tsx`，内容为原GenerationTab组件
  - [x] SubTask 1.3: 创建 `src/pages/dashboard/DashboardAssets.tsx`，内容为原AssetTab组件
  - [x] SubTask 1.4: 创建 `src/pages/dashboard/DashboardTasks.tsx`，内容为原TaskTab组件

- [x] Task 2: 更新App.tsx路由配置
  - [x] SubTask 2.1: 新增 `/dashboard` 重定向到 `/dashboard/overview`
  - [x] SubTask 2.2: 新增 `/dashboard/overview` 路由指向Overview组件
  - [x] SubTask 2.3: 新增 `/dashboard/generation` 路由指向Generation组件
  - [x] SubTask 2.4: 新增 `/dashboard/assets` 路由指向DashboardAssets组件
  - [x] SubTask 2.5: 新增 `/dashboard/tasks` 路由指向DashboardTasks组件

- [x] Task 3: 更新侧边栏导航
  - [x] SubTask 3.1: 将仪表盘菜单改为展开子菜单形式，包含总览/生成/资产/任务四项
  - [x] SubTask 3.2: 子菜单项路由分别对应 `/dashboard/overview`、`/dashboard/generation`、`/dashboard/assets`、`/dashboard/tasks`

- [x] Task 4: 重构原Dashboard.tsx
  - [x] SubTask 4.1: 将Dashboard.tsx简化为重定向到 `/dashboard/overview` 或直接移除Tabs结构

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1]
