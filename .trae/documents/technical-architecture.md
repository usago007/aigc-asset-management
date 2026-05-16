## 1. 架构设计

```mermaid
graph TD
    A[前端表现层 React Components] --> B[状态管理层 React Hooks/Context]
    B --> C[数据层 Mock Data + LocalStorage]
    C --> D[工具层 Utils Functions]
    A --> E[路由层 React Router]
    E --> A
```

## 2. 技术说明

- 前端框架：React@18 + Vite
- 样式方案：CSS变量 + CSS Modules
- 路由管理：React Router DOM@6
- 图标库：Lucide React
- 构建工具：Vite@5
- 数据模拟：LocalStorage + Mock JS数据
- 状态管理：React Context + useReducer

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 重定向到/dashboard |
| /dashboard | 仪表盘首页 |
| /content/keyframes | 首图/尾图列表 |
| /content/shots | 镜头列表 |
| /content/assets | 资产列表 |
| /projects/customers | 客户列表 |
| /projects/brands | 品牌列表 |
| /projects/projects | 项目列表 |
| /projects/briefs | 简报列表 |
| /projects/tasks | 任务列表 |
| /projects/reviews | 审核列表 |
| /system/roles | 角色权限管理 |
| /system/settings | 系统设置 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    Customer {
        uuid id PK
        string customerName
        string contactPerson
        array roles
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    Brand {
        uuid id PK
        string brandName
        uuid customerId FK
        string owner
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    Project {
        uuid id PK
        string projectName
        uuid brandId FK
        string projectOwner
        int progress
        string stage
        string riskLevel
        int pendingReviews
        datetime createdAt
        datetime updatedAt
    }
    
    Brief {
        uuid id PK
        string briefTitle
        uuid projectId FK
        text description
        string targetAudience
        string platform
        datetime deadline
        string fileUrl
        uuid currentVersionId
        datetime createdAt
        datetime updatedAt
    }
    
    Shot {
        uuid id PK
        string shotName
        uuid projectId FK
        uuid firstFrameId FK
        uuid lastFrameId FK
        string promptId
        string modelName
        string modelVersion
        string status
        datetime createdAt
        datetime updatedAt
    }
    
    KeyFrame {
        uuid id PK
        string name
        string type
        text promptText
        string modelName
        string modelVersion
        datetime createdAt
        string status
        uuid parentShotId FK
        datetime updatedAt
    }
    
    GenerationVersion {
        uuid id PK
        uuid keyFrameId FK
        string modelName
        string modelVersion
        int versionNumber
        string status
        boolean isSelected
        datetime generatedAt
    }
    
    Asset {
        uuid id PK
        string assetName
        string type
        uuid shotId FK
        uuid promptId FK
        string modelName
        string modelVersion
        datetime createdAt
        array parentAssetIds
        string status
        string fileUrl
        datetime updatedAt
    }
    
    Task {
        uuid id PK
        string taskName
        uuid projectId FK
        string assignedTo
        string status
        string type
        datetime deadline
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    Review {
        uuid id PK
        uuid targetId FK
        string targetType
        string reviewer
        string reviewType
        string status
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    Role {
        uuid id PK
        string roleName
        array permissions
        string visibility
        datetime createdAt
    }
    
    Customer ||--o{ Brand : "owns"
    Brand ||--o{ Project : "contains"
    Project ||--o{ Shot : "contains"
    Project ||--o{ Brief : "has"
    Project ||--o{ Task : "has"
    Shot ||--o| KeyFrame : "has_first"
    Shot ||--o| KeyFrame : "has_last"
    KeyFrame ||--o{ GenerationVersion : "generates"
    Shot ||--o{ Asset : "contains"
    Asset ||--o{ Review : "has"
```

### 4.2 生成记录字段说明

**GenerationVersion表**：
- `id`：UUID，版本唯一标识
- `keyFrameId`：关联的首图/尾图ID
- `modelName`：使用的AI模型名称
- `modelVersion`：模型版本号
- `versionNumber`：生成的版本号序号（1,2,3...）
- `status`：生成状态（Pending/Completed/Failed）
- `isSelected`：是否被选为最终版本
- `generatedAt`：生成时间戳

### 4.3 审计追溯字段

所有核心对象包含：
- `createdAt`：创建时间
- `updatedAt`：最后更新时间
- 生成记录完整保留，不被删除，仅状态变更
