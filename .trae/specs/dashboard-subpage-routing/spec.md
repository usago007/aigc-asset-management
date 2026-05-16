# 仪表盘Tab拆分为子页面路由 Spec

## Why
当前仪表盘将总览、生成、资产、任务四个维度全部放在同一页面的Tab切换中，不利于独立访问和URL分享。拆分为独立子页面后，每个维度拥有独立路由，用户可以直接访问特定页面，浏览器URL也能反映当前位置。

## What Changes
- 将当前Dashboard中的OverviewTab、GenerationTab、AssetTab、TaskTab四个组件拆分为独立的页面文件
- 新增路由 `/dashboard/overview`（总览）、`/dashboard/generation`（生成）、`/dashboard/assets`（资产）、`/dashboard/tasks`（任务）
- `/dashboard` 路由重定向到 `/dashboard/overview`
- 侧边栏导航对应更新，点击仪表盘子项跳转对应页面
- 移除Dashboard中的Tabs切换结构

## Impact
- Affected specs: dashboard-enhancement（前置spec已完成）
- Affected code: `src/App.tsx`（新增路由）、`src/pages/dashboard/`（新增4个子页面）、`src/components/Sidebar.tsx`（更新导航菜单）

## ADDED Requirements

### Requirement: 仪表盘子页面路由
系统 SHALL 为仪表盘提供四个子路由，每个对应一个独立页面。

#### Scenario: 访问仪表盘
- **WHEN** 用户访问 `/dashboard`
- **THEN** 自动重定向到 `/dashboard/overview`

#### Scenario: 访问生成页面
- **WHEN** 用户访问 `/dashboard/generation`
- **THEN** 显示生成维度的统计和图表数据

### Requirement: 侧边栏导航
侧边栏 SHALL 将仪表盘入口拆分为四个子菜单项，点击直接跳转对应路由。

#### Scenario: 点击仪表盘子菜单
- **WHEN** 用户点击侧边栏仪表盘下的"总览"子菜单
- **THEN** 导航到 `/dashboard/overview`，URL更新

## REMOVED Requirements

### Requirement: Dashboard内Tab切换
**Reason**: 拆分为独立页面后不再需要Tab切换结构
**Migration**: 原有Tab内容保持不变，仅迁移为独立页面组件
