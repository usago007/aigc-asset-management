# 系统配置完善计划 - 修订版（逻辑审查后）

## 一、逻辑漏洞分析

### 漏洞 1：成员管理 vs 客户管理重叠
**问题**：系统中已存在"客户管理"（`/projects/customers`），Customer 类型包含 `roles` 字段。新增"成员管理"若不明确区分会导致概念混淆。

**解决方案**：
- **客户管理**：外部客户，属于项目管理范畴（已有，不动）
- **成员管理**：系统内部用户/团队成员，属于系统配置范畴（新增）
- 成员有完整的身份体系（邮箱、手机号、登录凭证），客户只有基本信息

### 漏洞 2：API 密钥与 AI 能力配置中的 apiKey 重叠
**问题**：aiConfigStore 的 `general.apiKey` 已经是系统级火山引擎 API 密钥。新增独立的 API 密钥管理页面会概念重复。

**解决方案**：API 密钥管理不作为独立模块，而是作为 AI 能力配置页面中的一个区块（类似 DeepSeek 配置）。管理多个平台的 API 密钥（火山引擎、DeepSeek 等）。

### 漏洞 3：用量统计缺乏数据基础
**问题**：当前系统使用 mock 数据，imageGeneration 有 `tokensUsed` 字段但未实际聚合展示。真实的用量统计需要实际 API 对接。

**解决方案**：作为"仪表盘"的扩展（Dashboard 层面），而非系统配置。本次仅做 mock 用量展示面板。

### 漏洞 4：安全审计与全局日志重叠
**问题**：SystemLogs 已记录系统运行日志，安全审计侧重用户操作/登录等，功能边界不清晰。

**解决方案**：将全局日志分为两个子 Tab：运行日志 + 审计日志，合并在同一页面内。

### 漏洞 5：成员如何与角色关联
**问题**：现有 Role 系统有 roleName/permissions/visibility，但没有"谁拥有这个角色"的概念。

**解决方案**：Member 类型包含 `roleIds: string[]` 字段，与现有 Role 系统关联。这是关键融合点。

## 二、与现有系统的融合关系

```
现有系统                    新增功能                      融合方式
─────────────────────────────────────────────────────────────────────
Role (角色权限)    ←─────   Member.members[].roleIds  ──  成员绑定角色
Task (任务管理)     ────   Member.assignedTasks        ──  成员关联任务
Review (审核管理)   ────   Member.reviews              ──  成员作为审核人
appStore            ────   members 状态 + CRUD         ──  复用 store 模式
AI Config           ────   API Keys 区块               ──  融入 AIConfigPanel
SystemLogs          ────   运行日志 + 审计日志 Tabs    ──  扩展日志页面
```

## 三、修正后的实施计划

### 模块 1：成员管理（P0 - 核心功能）

**文件变更清单**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/types/index.ts` | 修改 | 新增 Member 接口 |
| `src/store/appStore.ts` | 修改 | 新增 members 状态 + CRUD 方法 + mock 数据 |
| `src/utils/mockData.ts` | 修改 | 新增 generateMembers() |
| `src/pages/system/Members.tsx` | 新建 | 成员管理页面 |
| `src/components/Sidebar.tsx` | 修改 | 新增「成员管理」菜单项 |
| `src/components/Header.tsx` | 修改 | 新增面包屑 |
| `src/App.tsx` | 修改 | 新增路由 |

**Member 类型设计**：
```typescript
interface Member {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  roleIds: string[];        // ← 关联现有 Role 系统
  department: string;
  status: 'active' | 'disabled' | 'pending';
  lastLoginAt: string;
  joinedAt: string;
  invitedBy: string;
}
```

**成员管理页面功能**：
- 成员列表表格（头像、姓名、邮箱、角色标签、部门、状态、最后登录、操作）
- 新增成员（邀请）弹窗：姓名、邮箱、手机号、角色（多选，从现有 roles 中选）、部门
- 编辑成员弹窗
- 启用/禁用切换
- 删除成员（二次确认）
- 按角色筛选、按状态筛选
- 搜索（姓名/邮箱）
- 分页

### 模块 2：AI 能力配置新增 API 密钥管理区块（P0）

**文件变更清单**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/types/aiConfig.ts` | 修改 | 新增 ApiKeyConfig 类型 |
| `src/pages/system/AIConfigPanel.tsx` | 修改 | 新增 API 密钥管理区块 |

**说明**：在 AI 能力配置页面底部新增"API 密钥管理"区块，管理多个平台的密钥：
- 火山引擎（已存在于 general.apiKey，改为从统一密钥管理读取）
- DeepSeek（已存在于 deepseek.apiKey）
- 其他平台（预留）

### 模块 3：全局日志扩展为运行日志+审计日志（P1）

**文件变更清单**：

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/pages/system/SystemLogs.tsx` | 修改 | 新增 Tabs 切换运行日志/审计日志 |

**审计日志内容**（mock 数据 30+ 条）：
- 用户登录/登出
- 角色创建/编辑/删除
- 成员邀请/禁用/删除
- AI 配置修改
- 密钥创建/撤销

## 四、本次实施范围

**建议本次实施**：模块 1（成员管理）+ 模块 2（API 密钥区块）

**建议后续实施**：模块 3（审计日志）— 需要真实的用户认证系统后才能发挥价值

## 五、依赖关系

```
模块 1 (成员管理)
  └─ 依赖：现有 Role 系统（已完成）
  └─ 无其他依赖

模块 2 (API 密钥区块)
  └─ 依赖：现有 AIConfigPanel（已完成）
  └─ 依赖：DeepSeek 配置（已完成）

模块 3 (审计日志)
  └─ 依赖：模块 1（需要成员操作记录）
  └─ 后续实施
```
