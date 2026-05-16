# 仪表盘面包屑与时间戳修复 Spec

## Why
仪表盘4个子页面（总览/生成/资产/任务）在Header中面包屑显示为"页面"（fallback），没有正确的面包屑路径。同时各页面缺少最后更新时间戳，用户无法知道数据何时刷新。

## What Changes
- 在 Header.tsx 的 breadcrumbs 映射中添加4条仪表盘子路由
- 在每个仪表盘子页面标题旁添加"最后更新"时间戳

## Impact
- Affected code: `src/components/Header.tsx`（添加面包屑映射）、`src/pages/dashboard/Overview.tsx`、`src/pages/dashboard/Generation.tsx`、`src/pages/dashboard/DashboardAssets.tsx`、`src/pages/dashboard/DashboardTasks.tsx`

## ADDED Requirements

### Requirement: 仪表盘面包屑路径
Header SHALL 为4个仪表盘子路由显示正确的面包屑。

#### Scenario: 访问总览页面
- **WHEN** 用户访问 `/dashboard/overview`
- **THEN** 面包屑显示 "仪表盘 / 总览"

#### Scenario: 访问生成页面
- **WHEN** 用户访问 `/dashboard/generation`
- **THEN** 面包屑显示 "仪表盘 / 生成"

### Requirement: 页面更新时间戳
每个仪表盘子页面 SHALL 在页面标题旁显示"最后更新"时间戳。

#### Scenario: 查看总览页面
- **WHEN** 用户打开总览页面
- **THEN** 标题旁显示 "最后更新: HH:mm:ss"

## REMOVED Requirements
无
