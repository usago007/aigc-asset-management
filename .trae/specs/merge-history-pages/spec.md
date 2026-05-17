# 合并图片历史与视频历史 Spec

## Why
当前图片历史（`/content/image-generation-history`）和视频历史（`/content/generation-history`）是两个独立的页面和路由，但它们的功能相似（都是查看生成任务历史），用户需要在两个页面之间切换，体验不佳。合并为一个统一的生成历史页面，通过 Tab 切换查看图片和视频任务，更加简洁高效。

## What Changes
- 创建统一的 `GenerationHistory` 组件，支持图片/视频双 Tab 切换
- 将原来的 `ImageGenerationHistory.tsx` 的图片列表表格视图整合为新页面的"图片" Tab
- 将原来的 `GenerationHistory.tsx` 的视频缩略图卡片视图整合为新页面的"视频" Tab
- 删除独立的 `ImageGenerationHistory.tsx` 文件
- 删除 `App.tsx` 中的 `/content/image-generation-history` 路由
- 更新 `Sidebar.tsx` 菜单，将"作品库"和"素材库"合并为"作品库"一个入口

## Impact
- Affected specs: 内容创作导航
- Affected code:
  - `src/pages/content/GenerationHistory.tsx`（重写）
  - `src/pages/content/ImageGenerationHistory.tsx`（删除）
  - `src/App.tsx`（删除路由）
  - `src/components/Sidebar.tsx`（合并菜单项）

## REMOVED Requirements
### Requirement: 独立的图片历史页面
**Reason**: 与视频历史功能重复，合并为统一入口提升用户体验
**Migration**: 整合到统一的 GenerationHistory 页面，使用 Tab 切换

## ADDED Requirements
### Requirement: 统一生成历史页面
The system SHALL provide a unified generation history page with Tab-based navigation between image and video tasks.

#### Scenario: 查看图片历史
- **WHEN** 用户点击"图片" Tab
- **THEN** 显示图片生成任务列表（表格视图），支持搜索、状态筛选、模式筛选、预览、下载、删除、重试

#### Scenario: 查看视频历史
- **WHEN** 用户点击"视频" Tab
- **THEN** 显示视频生成任务列表（卡片视图），支持搜索、状态筛选、模式筛选、播放、下载、重试、查看任务详情

## MODIFIED Requirements
### Requirement: 侧边栏菜单
将"作品库"和"素材库"合并为"作品库"一个菜单项，指向 `/content/generation-history`
