# 修复 SelectItem value="" 导致按钮无响应

## 根因

Radix UI 的 `<Select.Item />` 不允许 `value=""`（空字符串），因为空字符串被保留用于清除选择和显示 placeholder。当 Modal 中的 Select 渲染时抛出此错误，整个 Dialog 崩溃，导致"创建"按钮看起来无响应。

控制台错误：
```
Error: A <Select.Item /> must have a value prop that is not an empty string.
```

## 受影响文件（8 处）

| 文件 | 行号 | 当前代码 | 修复方案 |
|------|------|----------|----------|
| KeyFrames.tsx | 198 | `<SelectItem value="">选择镜头</SelectItem>` | 改为 `value="none"` + Select 绑定适配 |
| Shots.tsx | 132 | `<SelectItem value="">选择项目</SelectItem>` | 同上 |
| Shots.tsx | 134 | `<SelectItem value="">选择首图</SelectItem>` | 同上 |
| Shots.tsx | 135 | `<SelectItem value="">选择尾图</SelectItem>` | 同上 |
| Assets.tsx | 113 | `<SelectItem value="">选择镜头</SelectItem>` | 同上 |
| Brands.tsx | 136 | `<SelectItem value="">未选择</SelectItem>` | 同上 |
| Projects.tsx | 197 | `<SelectItem value="">未选择</SelectItem>` | 同上 |
| Tasks.tsx | 179 | `<SelectItem value="">未选择</SelectItem>` | 同上 |

## 修复策略

对于可选字段（如"关联镜头"、"所属项目"等），将 `<SelectItem value="">` 改为 `<SelectItem value="none">`，并在 `onValueChange` 中将 `"none"` 转换回空字符串：

```tsx
// 修复前
<Select value={formData.parentShotId} onValueChange={(val) => setFormData({ ...formData, parentShotId: val })}>
  <SelectTrigger><SelectValue placeholder="选择镜头" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="">选择镜头</SelectItem>
    ...
  </SelectContent>
</Select>

// 修复后
<Select value={formData.parentShotId || 'none'} onValueChange={(val) => setFormData({ ...formData, parentShotId: val === 'none' ? '' : val })}>
  <SelectTrigger><SelectValue placeholder="选择镜头" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="none">选择镜头</SelectItem>
    ...
  </SelectContent>
</Select>
```

关键改动：
1. `value=""` → `value="none"`（所有 SelectItem）
2. `value={formData.xxx}` → `value={formData.xxx || 'none'}`（Select 绑定空值时回退到 'none'）
3. `onValueChange={(val) => setFormData({ ..., xxx: val })}` → `onValueChange={(val) => setFormData({ ..., xxx: val === 'none' ? '' : val })}`（将 'none' 转换回空字符串存储）

## 修复步骤

### 步骤1：修复 KeyFrames.tsx（1处）
- 行198：`<SelectItem value="">选择镜头</SelectItem>` → `<SelectItem value="none">选择镜头</SelectItem>`
- 行196：Select value 绑定和 onValueChange 适配

### 步骤2：修复 Shots.tsx（3处）
- 行132：所属项目 Select
- 行134：首图 Select
- 行135：尾图 Select

### 步骤3：修复 Assets.tsx（1处）
- 行113：所属镜头 Select

### 步骤4：修复 Brands.tsx（1处）
- 行136：所属客户 Select

### 步骤5：修复 Projects.tsx（1处）
- 行197：所属品牌 Select

### 步骤6：修复 Tasks.tsx（1处）
- 行179：所属项目 Select

### 步骤7：验证
- 运行 `npx tsc --noEmit` 确认无编译错误
- 在浏览器中测试三个"创建"按钮
- 确认控制台无 SelectItem 错误
