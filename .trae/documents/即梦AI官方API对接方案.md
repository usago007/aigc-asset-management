# 即梦AI API 官方对接方案

## 调研来源

- **官方文档地址**：https://www.volcengine.com/docs/85621/1544716?lang=zh
- **调研日期**：2026-05-17
- **文档最新更新**：2025-09-16

## 官方产品功能清单

### 图像生成（5个能力）
| # | 能力名称 | 状态 |
|---|----------|------|
| 1 | 即梦-图片生成4.0 | ✅ 可用 |
| 2 | 即梦-文生图3.1 | ✅ 可用 |
| 3 | 即梦-文生图3.0 | ✅ 可用 |
| 4 | 即梦-图生图3.0-智能参考 | ✅ 可用 |
| 5 | 即梦-文生图2.1 | ✅ 可用 |

### 视频生成（5个能力）
| # | 能力名称 | 状态 |
|---|----------|------|
| 1 | 即梦-视频生成3.0 Pro | ✅ 可用 |
| 2 | 即梦-视频生成3.0 | ✅ 可用 |
| 3 | 即梦-视频生成S2.0 Pro | ⚠️ **陆续下线中，不采纳** |
| 4 | 动作模仿 | ✅ 可用 |
| 5 | 数字人快速模式 | ✅ 可用 |

**已排除的能力（标记为下线/即将下线）**：
- ❌ 即梦-视频生成S2.0 Pro - 陆续下线中

## 当前系统与官方API的差异

### 1. reqKey 配置差异

| 当前系统 reqKey | 官方 API reqKey | 能力 | 状态 |
|-----------------|-----------------|------|------|
| jimeng_i2i_v30_cvtob | jimeng_t2i_v31 | 文生图3.1 | ❌ 需修正 |
| (缺失) | jimeng_t2i_v40 | 图片生成4.0 | ❌ 需新增 |
| jimeng_i2i_v30_cvtob | jimeng_i2i_v30 | 图生图3.0-智能参考 | ❌ 需修正 |
| jimeng_t2i_v30_cvtob | jimeng_t2i_v30 | 文生图3.0 | ❌ 需修正 |
| jimeng_i2i_v30_cvtob | jimeng_t2i_v21 | 文生图2.1 | ❌ 需修正 |
| jimeng_i2v_first_tail_v30_1080 | jimeng_t2v_v30_pro | 视频生成3.0 Pro | ❌ 需修正 |
| jimeng_t2v_v30_1080 | jimeng_t2v_v30 | 视频生成3.0 | ❌ 需修正 |
| jimeng_i2v_first_v30_1080 | (无对应) | S2.0 Pro(已下线) | ❌ 需移除 |

### 2. 视频生成模式差异

**当前系统模式**（基于 S2.0 Pro 架构）：
- text-to-video（文生视频）
- image-to-video-first（首帧图生视频）
- image-to-video-first-tail（首尾帧图生视频）

**官方视频生成3.0/3.0 Pro 支持的能力**：
- 文生视频
- 图生视频（首帧）
- 首尾帧图生视频

### 3. 图像生成模式差异

**当前系统模式**：
- text-to-image（文生图）
- image-to-image（图生图）
- stylization-edit（风格化编辑）
- super-resolution（智能超清）
- inpainting（局部重绘）

**官方图像生成能力**：
- 图片生成4.0（文生图/图生图/组图/编辑一体化）
- 文生图3.1
- 文生图3.0
- 图生图3.0-智能参考
- 文生图2.1

### 4. 接口调用方式差异

**官方统一接口**：
- 接口地址：https://visual.volcengineapi.com
- 请求方式：POST
- Content-Type: application/json
- Action: CVSync2AsyncSubmitTask
- Version: 2022-08-31

**当前系统**：
- 使用 Mock 适配器，未对接真实 API
- 通过 reqKey 区分不同能力

## 对接方案

### 阶段一：修正 reqKey 配置

更新 `src/types/aiConfig.ts` 中的默认 reqKey 值，使其与官方文档一致：

| 能力 | 正确 reqKey |
|------|-------------|
| 图片生成4.0 | `jimeng_t2i_v40` |
| 文生图3.1 | `jimeng_t2i_v31` |
| 文生图3.0 | `jimeng_t2i_v30` |
| 图生图3.0-智能参考 | `jimeng_i2i_v30` |
| 文生图2.1 | `jimeng_t2i_v21` |
| 视频生成3.0 Pro | `jimeng_t2v_v30_pro` |
| 视频生成3.0 | `jimeng_t2v_v30` |

### 阶段二：更新图像生成模式

**当前模式需调整为**：
- `text-to-image` → 对应官方：文生图3.1 / 文生图3.0 / 文生图2.1 / 图片生成4.0
- `image-to-image` → 对应官方：图生图3.0-智能参考 / 图片生成4.0
- 移除：`stylization-edit`、`super-resolution`、`inpainting`（这些功能已整合到图片生成4.0中）

或者，保留现有模式名称但将其映射到正确的官方 reqKey。

### 阶段三：更新视频生成模式

**保留现有模式**，因为官方视频生成3.0/3.0 Pro 均支持：
- 文生视频
- 首帧图生视频
- 首尾帧图生视频

但需要：
- 移除 S2.0 Pro 相关的 reqKey 配置
- 添加 3.0 Pro 的 reqKey 配置

### 阶段四：AIConfigPanel 更新

更新 AI 配置面板中的能力列表和说明，使其与官方文档一致：
- 图片生成：列出 5 个官方能力
- 视频生成：列出 4 个官方能力（排除 S2.0 Pro）

## 影响范围

- `src/types/aiConfig.ts` - 默认配置
- `src/types/generation.ts` - 类型定义
- `src/services/aiConfigService.ts` - 配置服务
- `src/pages/system/AIConfigPanel.tsx` - 配置面板
- `src/pages/content/VideoGeneration.tsx` - 视频生成页面
- `src/pages/content/ImageGeneration.tsx` - 图片生成页面
- `src/data/mockGenerationData.ts` - Mock 数据
- `src/utils/mockData.ts` - Mock 数据
