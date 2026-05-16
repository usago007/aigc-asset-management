# 视频生成工作台 Spec

## Why
基于即梦AI视频生成3.0系列接口（文生视频、图生视频-首帧、图生视频-首尾帧），为AIGC数字资产管理系统构建完整的视频生成工作台，覆盖从创意输入到视频产出的全流程，实现任务提交、状态轮询、版本对比和生成历史管理。

## What Changes
- 新增视频生成相关类型定义（VideoGenerationTask、TaskQueueStatus）
- 新增API服务层（视频生成API调用、任务轮询器、图片处理工具）
- 新增生成任务状态管理（generationStore）
- 新增视频生成工作台页面（快速生成模式、任务队列实时跟踪）
- 新增生成历史页面（列表筛选、任务详情查看）
- 新增视频播放器和图片上传组件
- 新增Prompt输入组件（字数统计、格式校验）
- 新增任务卡片组件（状态展示、进度条）
- 更新路由配置和侧边栏导航
- 实现Mock适配器（模拟异步任务提交、状态流转、视频URL过期）

## Impact
- 影响能力：内容创作模块 - 新增视频生成能力
- 影响代码：
  - 新增文件：types/generation.ts、services/videoGeneration.ts、services/poller.ts、store/generationStore.ts、多个页面和组件
  - 修改文件：App.tsx（路由）、Sidebar.tsx（导航）

## ADDED Requirements

### Requirement: 视频生成任务类型
系统 SHALL 定义视频生成任务的完整数据结构，包含任务标识、生成配置、图片输入、参数、状态、结果和错误信息。

#### 场景：任务数据结构定义
- **WHEN** 定义VideoGenerationTask类型
- **THEN** 包含taskId、requestId、mode、reqKey、prompt、firstFrameUrl/lastFrameUrl、seed、frames、aspectRatio、status、videoUrl等字段

### Requirement: 生成模式选择
系统 SHALL 支持三种视频生成模式：文生视频、图生视频-首帧、图生视频-首尾帧。

#### 场景：选择文生视频模式
- **WHEN** 用户选择"文生视频"模式
- **THEN** 仅显示Prompt输入框，隐藏图片上传区域

#### 场景：选择首帧图生视频模式
- **WHEN** 用户选择"首帧图生视频"模式
- **THEN** 显示Prompt输入框和单张图片上传区域（首帧）

#### 场景：选择首尾帧图生视频模式
- **WHEN** 用户选择"首尾帧图生视频"模式
- **THEN** 显示Prompt输入框和两张图片上传区域（首帧+尾帧），并校验两图比例是否一致

### Requirement: 图片上传与校验
系统 SHALL 提供图片上传功能，并自动校验格式、大小和比例。

#### 场景：上传合法图片
- **WHEN** 用户上传JPEG/PNG格式、大小≤4.7MB的图片
- **THEN** 显示图片预览，记录图片比例

#### 场景：上传不合法图片
- **WHEN** 用户上传格式不支持、大小超限或比例异常的图片
- **THEN** 显示错误提示，拒绝上传

#### 场景：首尾帧比例校验
- **WHEN** 用户上传首帧和尾帧图片
- **THEN** 自动检查两图比例是否一致，不一致时显示警告

### Requirement: Prompt输入
系统 SHALL 提供Prompt输入功能，带实时字数统计和格式校验。

#### 场景：输入Prompt
- **WHEN** 用户在Prompt输入框中输入文字
- **THEN** 实时显示字数统计，超过400字时显示警告，超过800字时禁止提交

### Requirement: 参数配置
系统 SHALL 支持生成参数配置，包括时长、宽高比和随机种子。

#### 场景：配置基础参数
- **WHEN** 用户选择时长和宽高比
- **THEN** 时长可选5秒(121帧)或10秒(241帧)，宽高比可选16:9、4:3、1:1、3:4、9:16、21:9

#### 场景：配置随机种子
- **WHEN** 用户选择Seed模式
- **THEN** 可选择"随机"(-1)或输入自定义正整数

### Requirement: 任务提交
系统 SHALL 支持提交视频生成任务，并返回task_id。

#### 场景：提交任务成功
- **WHEN** 用户填写完整信息并点击提交
- **THEN** 调用提交API，返回task_id，创建轮询任务，显示成功Toast

#### 场景：提交任务失败
- **WHEN** 提交过程中发生错误（审核失败、参数错误等）
- **THEN** 显示错误提示，记录错误码和错误信息

### Requirement: 任务状态轮询
系统 SHALL 自动轮询任务状态，直到任务完成或失败。

#### 场景：轮询任务状态
- **WHEN** 任务提交成功后
- **THEN** 每5秒轮询一次，更新进度条，状态流转：in_queue → generating → done/failed

#### 场景：任务完成
- **WHEN** 任务状态变为done
- **THEN** 停止轮询，显示视频播放器，记录videoUrl和过期时间

#### 场景：任务失败
- **WHEN** 任务状态变为failed
- **THEN** 停止轮询，显示错误信息，提供重试按钮

### Requirement: 任务队列展示
系统 SHALL 实时展示当前任务队列，包含状态、进度、耗时和操作按钮。

#### 场景：查看任务队列
- **WHEN** 用户访问视频生成工作台
- **THEN** 显示所有活跃任务（submitting/in_queue/generating），支持查看详情、下载、取消操作

### Requirement: 生成历史
系统 SHALL 提供生成历史列表，支持筛选和搜索。

#### 场景：浏览生成历史
- **WHEN** 用户访问生成历史页面
- **THEN** 显示所有历史任务，支持按状态、模式筛选，支持按Prompt搜索

#### 场景：查看任务详情
- **WHEN** 用户点击任务详情
- **THEN** 展示任务完整信息（输入参数、输出结果、耗时、request_id等）

### Requirement: 视频播放与下载
系统 SHALL 提供视频播放和下载功能。

#### 场景：播放生成视频
- **WHEN** 任务完成且videoUrl有效
- **THEN** 显示视频播放器，支持播放/暂停/进度控制

#### 场景：下载生成视频
- **WHEN** 用户点击下载按钮
- **THEN** 触发浏览器下载视频文件

### Requirement: 视频URL过期管理
系统 SHALL 管理视频URL的有效期（1小时），并在过期前提醒用户。

#### 场景：视频URL即将过期
- **WHEN** 视频URL剩余有效期<10分钟
- **THEN** 显示过期提醒Toast，建议用户下载保存

#### 场景：视频URL已过期
- **WHEN** 视频URL超过1小时有效期
- **THEN** 标记任务为expired，显示"已过期"状态，提示重新生成

### Requirement: Mock适配器
系统 SHALL 提供Mock适配器，模拟API行为用于开发测试。

#### 场景：Mock任务提交
- **WHEN** 调用Mock提交接口
- **THEN** 延迟1-2秒后返回模拟task_id

#### 场景：Mock任务状态流转
- **WHEN** 开始轮询Mock任务
- **THEN** 模拟状态流转：in_queue(2秒) → generating(5-15秒随机) → done

#### 场景：Mock失败场景
- **WHEN** 配置特定任务为失败
- **THEN** 返回指定错误码（50411审核失败、50413文本审核失败等）

### Requirement: 错误处理
系统 SHALL 处理API返回的所有错误码，并提供友好的用户提示。

#### 场景：输入审核失败
- **WHEN** 返回50411(图片)或50412/50413(文本)错误
- **THEN** 提示用户更换图片/修改Prompt，不提供重试按钮

#### 场景：输出审核失败
- **WHEN** 返回50511(图片)或50516(视频)错误
- **THEN** 提示审核未通过，提供重试按钮

#### 场景：QPS/并发超限
- **WHEN** 返回50429或50430错误
- **THEN** 自动延迟后重试，提示用户稍候

## MODIFIED Requirements

### Requirement: 路由配置
系统 SHALL 更新路由配置，添加视频生成相关页面路由。

**修改文件**：src/App.tsx
- 新增路由：`/content/video-generation`（视频生成工作台）
- 新增路由：`/content/generation-history`（生成历史）
- 新增路由：`/content/task/:id`（任务详情）

### Requirement: 侧边栏导航
系统 SHALL 更新侧边栏，添加视频生成相关导航项。

**修改文件**：src/components/Sidebar.tsx
- "内容创作"分组下新增：
  - "视频生成" → `/content/video-generation`
  - "生成历史" → `/content/generation-history`

## REMOVED Requirements
无
