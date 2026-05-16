# 仪表盘多维度完善 Spec

## Why
当前仪表盘仅包含6个统计卡片、项目进度列表和近期审核列表三个板块，信息维度单一，无法为管理者提供全局业务概览。系统拥有丰富的数据源（任务、资产、生成、镜头、模型使用等），需要从多个维度拆解仪表盘，使其成为真正的管理中心。

## What Changes
- 将仪表盘从单页面扩展为多Tab布局，包含"总览"、"生成"、"资产"、"任务"四个维度视图
- 总览Tab保留现有统计卡片并增强，新增活跃项目、风险预警、近期活动
- 新增生成Tab：图片/视频生成任务统计、模型使用分布、生成成功率
- 新增资产Tab：资产类型分布、资产状态统计、存储概览
- 新增任务Tab：任务状态分布、逾期任务提醒、人员工作负载

## Impact
- Affected specs: 无（纯前端展示增强）
- Affected code: `src/pages/dashboard/Dashboard.tsx`（主文件重构）

## ADDED Requirements

### Requirement: 多Tab仪表盘布局
仪表盘 SHALL 采用Tab切换结构，包含"总览"、"生成"、"资产"、"任务"四个Tab页签。

#### Scenario: 切换Tab
- **WHEN** 用户点击不同Tab
- **THEN** 显示对应维度的数据卡片和图表，URL保持不变

### Requirement: 总览Tab增强
总览Tab SHALL 包含以下板块：
1. 核心统计卡片（保留现有6项，增加"生成中"统计）
2. 项目阶段分布（按Planning/InProduction/Review/Completed分组计数）
3. 风险预警列表（风险等级为High的项目）
4. 近期活动时间线（按时间倒序显示最近5条创建记录）

#### Scenario: 查看风险项目
- **WHEN** 存在风险等级为High的项目
- **THEN** 在风险预警板块显示项目名称、负责人、风险等级

### Requirement: 生成Tab
生成Tab SHALL 包含以下板块：
1. 图片生成任务统计（按状态分布：done/generating/in_queue/failed）
2. 视频生成任务统计（按状态分布）
3. 模型使用排行（统计各模型被使用次数）
4. 生成成功率概览（Completed / 总生成数）

#### Scenario: 查看生成状态
- **WHEN** 用户切换到生成Tab
- **THEN** 显示图片和视频生成任务的状态分布及成功率

### Requirement: 资产Tab
资产Tab SHALL 包含以下板块：
1. 资产类型分布（Image/Video/Script的数量和占比）
2. 资产状态分布（Draft/Final/Approved的数量）
3. 最新资产列表（按创建时间倒序显示最近5个）

#### Scenario: 查看资产分布
- **WHEN** 用户切换到资产Tab
- **THEN** 显示按类型和状态分类的资产统计

### Requirement: 任务Tab
任务Tab SHALL 包含以下板块：
1. 任务状态分布（Pending/InProgress/Completed）
2. 任务类型分布（生成/审核/交付）
3. 逾期任务提醒（deadline已过且状态非Completed的任务）
4. 人员工作负载（按负责人统计未完成任务数）

#### Scenario: 查看逾期任务
- **WHEN** 存在deadline已过且未完成的任务
- **THEN** 在逾期任务板块高亮显示任务名称、负责人、截止日期

## REMOVED Requirements
无
