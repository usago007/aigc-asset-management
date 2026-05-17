# 即梦AI官方API对接升级方案

## 背景

当前系统基于 Mock 模式运行，reqKey 配置与火山引擎即梦AI官方文档不一致。需要将系统升级为与官方API完全兼容的状态，同时修正已下线的 API 能力。

**官方文档地址**：https://www.volcengine.com/docs/85621/1544716?lang=zh

## 官方可用能力清单

### 图像生成（5个）
| 官方名称 | 正确 reqKey | 当前系统状态 |
|----------|-------------|--------------|
| 图片生成4.0 | `jimeng_t2i_v40` | ✅ textToImage 使用正确 |
| 文生图3.1 | `jimeng_t2i_v31` | ❌ 缺失 |
| 文生图3.0 | `jimeng_t2i_v30` | ❌ 缺失 |
| 图生图3.0-智能参考 | `jimeng_i2i_v30` | ❌ textToImage 使用错误 |
| 文生图2.1 | `jimeng_t2i_v21` | ❌ 缺失 |

### 视频生成（4个可用 + 1个下线）
| 官方名称 | 正确 reqKey | 当前系统状态 |
|----------|-------------|--------------|
| 视频生成3.0 Pro | `jimeng_t2v_v30_pro` | ❌ 缺失 |
| 视频生成3.0 | `jimeng_t2v_v30` | ❌ 使用错误值 |
| 视频生成S2.0 Pro | `jimeng_t2v_s20_pro` | ⚠️ **陆续下线中，需移除** |
| 动作模仿 | `jimeng_action_imitation` | ❌ 缺失 |
| 数字人快速模式 | `jimeng_digital_human_fast` | ❌ 缺失 |

## 升级方案

### 阶段一：修正数据类型和配置结构

**文件**：`src/types/aiConfig.ts`

**修改内容**：
1. **视频配置结构调整**：
   - 当前结构：`textToVideo`、`imageToVideoFirst`、`imageToVideoFirstTail`（按使用模式分类）
   - 新结构：改为按官方能力分类 `video30Pro`、`video30`、`actionImitation`、`digitalHumanFast`
   - 移除 S2.0 Pro 相关配置

2. **图片配置结构调整**：
   - 当前结构：`textToImage`、`imageToImage`、`stylizationEdit`、`superResolution`、`inpainting`
   - 新结构：改为按官方能力分类 `image40`、`textToImage31`、`textToImage30`、`imageToImage30`、`textToImage21`

3. **更新默认 reqKey 值**：
```typescript
video: {
  video30Pro: DEFAULT_ENDPOINT('jimeng_t2v_v30_pro'),
  video30: DEFAULT_ENDPOINT('jimeng_t2v_v30'),
  actionImitation: DEFAULT_ENDPOINT('jimeng_action_imitation'),
  digitalHumanFast: DEFAULT_ENDPOINT('jimeng_digital_human_fast'),
},
image: {
  image40: DEFAULT_ENDPOINT('jimeng_t2i_v40'),
  textToImage31: DEFAULT_ENDPOINT('jimeng_t2i_v31'),
  textToImage30: DEFAULT_ENDPOINT('jimeng_t2i_v30'),
  imageToImage30: DEFAULT_ENDPOINT('jimeng_i2i_v30'),
  textToImage21: DEFAULT_ENDPOINT('jimeng_t2i_v21'),
},
```

### 阶段二：更新视频生成模式和页面

**文件**：
- `src/types/generation.ts`
- `src/pages/content/VideoGeneration.tsx`
- `src/services/aiConfigService.ts`

**修改内容**：
1. **更新 GenerationMode 类型**：
```typescript
export type GenerationMode =
  | 'text-to-video'           // 文生视频
  | 'image-to-video-first'    // 首帧图生视频
  | 'image-to-video-first-tail'  // 首尾帧图生视频
  | 'action-imitation'        // 动作模仿（新增）
  | 'digital-human-fast'      // 数字人快速模式（新增）
```

2. **更新 VIDEO_MODE_MAP 映射**：
```typescript
const VIDEO_MODE_MAP: Record<GenerationMode, keyof VideoAIConfig> = {
  'text-to-video': 'video30Pro',      // 默认使用3.0 Pro
  'image-to-video-first': 'video30Pro',
  'image-to-video-first-tail': 'video30Pro',
  'action-imitation': 'actionImitation',
  'digital-human-fast': 'digitalHumanFast',
};
```

3. **视频生成页面新增模式选项**：
   - 在现有3个模式基础上，新增"动作模仿"和"数字人快速模式"两个单选按钮
   - 动作模仿：需要上传动作参考视频
   - 数字人快速模式：需要上传人物照片和音频

4. **移除 S2.0 Pro 相关逻辑**：
   - 删除所有涉及 S2.0 Pro 的 reqKey 配置和引用

### 阶段三：更新图片生成模式和页面

**文件**：
- `src/types/generation.ts`
- `src/pages/content/ImageGeneration.tsx`
- `src/services/aiConfigService.ts`

**修改内容**：
1. **更新 ImageGenerationMode 类型**：
```typescript
export type ImageGenerationMode =
  | 'text-to-image'      // 文生图（使用图片4.0）
  | 'image-to-image'     // 图生图（使用图片4.0或图生图3.0）
  | 'text-to-image-31'   // 文生图3.1（新增）
  | 'text-to-image-30'   // 文生图3.0（新增）
  | 'text-to-image-21'   // 文生图2.1（新增）
```

2. **简化图片生成模式**：
   - 移除 `stylization-edit`、`super-resolution`、`inpainting`（这些功能已整合到图片4.0中）
   - 图片4.0 本身支持文生图/图生图/编辑/组图一体化

3. **图片生成页面调整**：
   - 模式选择改为：图片4.0、文生图3.1、文生图3.0、文生图2.1、图生图3.0
   - 图片4.0 模式下支持多图输入（最多10张）和组图生成（最多15张）

4. **更新 IMAGE_MODE_MAP 映射**：
```typescript
const IMAGE_MODE_MAP: Record<ImageGenerationMode, keyof ImageAIConfig> = {
  'text-to-image': 'image40',
  'image-to-image': 'image40',
  'text-to-image-31': 'textToImage31',
  'text-to-image-30': 'textToImage30',
  'text-to-image-21': 'textToImage21',
};
```

### 阶段四：更新 AI 配置面板

**文件**：`src/pages/system/AIConfigPanel.tsx`

**修改内容**：
1. **视频生成 API 配置卡片**：
   - 文生视频 → 视频生成3.0 Pro
   - 首帧图生视频 → 视频生成3.0
   - 首尾帧图生视频 → （合并到3.0 Pro，移除独立卡片）
   - 新增：动作模仿
   - 新增：数字人快速模式

2. **图片生成 API 配置卡片**：
   - 即梦图片4.0 → 保留
   - 即梦图片4.6（风格化） → 移除（已整合到4.0）
   - 即梦智能超清 → 移除（已整合到4.0）
   - 即梦交互编辑 → 移除（已整合到4.0）
   - 新增：文生图3.1
   - 新增：文生图3.0
   - 新增：图生图3.0-智能参考
   - 新增：文生图2.1

### 阶段五：更新 Store 和 Service

**文件**：
- `src/store/generationStore.ts`
- `src/store/appStore.ts`
- `src/services/videoGeneration.ts`
- `src/services/imageGeneration.ts`
- `src/services/aiConfigService.ts`

**修改内容**：
1. 更新 reqKey 获取逻辑，使用新的 VIDEO_MODE_MAP 和 IMAGE_MODE_MAP
2. 更新任务提交逻辑，适配新的能力配置
3. 更新 Mock 数据中的 reqKey 值

### 阶段六：更新 Mock 数据

**文件**：
- `src/data/mockGenerationData.ts`
- `src/utils/mockData.ts`

**修改内容**：
1. 将所有视频任务的 reqKey 更新为官方正确值
2. 将所有图片任务的 reqKey 更新为官方正确值
3. 移除 S2.0 Pro 相关的 Mock 数据

### 阶段七：验证和测试

1. TypeScript 编译检查：`npx tsc --noEmit`
2. 检查所有类型引用是否正确
3. 验证 AI 配置面板显示正确
4. 验证视频生成页面模式选项正确
5. 验证图片生成页面模式选项正确

## 影响范围

| 文件 | 修改类型 | 影响程度 |
|------|----------|----------|
| `src/types/aiConfig.ts` | 类型定义变更 | 高 |
| `src/types/generation.ts` | 类型定义变更 | 高 |
| `src/services/aiConfigService.ts` | 映射逻辑变更 | 高 |
| `src/pages/system/AIConfigPanel.tsx` | UI 组件变更 | 中 |
| `src/pages/content/VideoGeneration.tsx` | UI 组件变更 | 中 |
| `src/pages/content/ImageGeneration.tsx` | UI 组件变更 | 中 |
| `src/store/generationStore.ts` | 业务逻辑变更 | 中 |
| `src/store/appStore.ts` | 业务逻辑变更 | 中 |
| `src/services/videoGeneration.ts` | 服务逻辑变更 | 低 |
| `src/services/imageGeneration.ts` | 服务逻辑变更 | 低 |
| `src/data/mockGenerationData.ts` | 数据变更 | 低 |
| `src/utils/mockData.ts` | 数据变更 | 低 |

## 风险和注意事项

1. **兼容性**：升级后，旧的 localStorage 配置数据可能不兼容新版本，需要在初始化时进行数据迁移或清理
2. **功能保留**：图片4.0 已整合风格化编辑、超清、局部重绘等功能，但前端 UI 可能需要调整以体现这些能力的正确使用方式
3. **新能力集成**：动作模仿和数字人快速模式需要额外的参数和文件上传支持（视频/音频），需要在前端添加对应的输入组件
4. **S2.0 Pro 下线**：需要确保所有对 S2.0 Pro 的引用都被移除，避免调用已下线的 API
