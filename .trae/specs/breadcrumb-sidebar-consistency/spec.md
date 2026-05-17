# 统一面包屑路径与侧边栏导航名称

## Why
用户反馈发现页面面包屑路径名称与左侧导航栏二级菜单名称不一致，影响用户体验和系统一致性。

## What Changes
- 修改 Header.tsx 面包屑映射，使其与 Sidebar.tsx 侧边栏导航标签完全一致
- **BREAKING** 无，仅修改展示文本

## Impact
- Affected code: `src/components/Header.tsx`
- 影响面包屑显示的所有页面

## 差异分析

| 路由 | 侧边栏名称 | 面包屑名称 | 处理 |
|---|---|---|---|
| `/content/image-generation` | 图片创作 | AI 生图 | 面包屑改为"图片创作" |
| `/content/video-generation` | 视频创作 | AI 生视频 | 面包屑改为"视频创作" |
| `/content/generation-history` | 作品库 | 视频生成历史 | 面包屑改为"作品库" |
| `/content/assets` | 资产库 | 资产管理 | 面包屑改为"资产库" |
| `/content/shots` | 镜头 | 镜头管理 | 面包屑改为"镜头" |
| `/content/keyframes` | 关键帧 | 首图/尾图 | 面包屑改为"关键帧" |
| `/content/image-generation-history` | (侧边栏无此入口) | 图片生成历史 | 删除此条目 |
| `/dashboard` 系列 | 总览/生成/资产/任务 | 总览/生成/资产/任务 | 一致，无需修改 |
| `/projects/*` 系列 | 一致 | 一致 | 无需修改 |
| `/system/*` 系列 | 一致 | 一致 | 无需修改 |

## 修订方案

### 修改 Header.tsx breadcrumbs 对象
将不一致的 6 个条目修改为与侧边栏一致，删除不存在侧边栏入口的 `image-generation-history` 条目。
