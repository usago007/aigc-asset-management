const translations: Record<string, Record<string, string>> = {
  zh: {
    dashboard: '仪表盘',
    content_creation: '内容创作',
    keyframes: '首图/尾图',
    shots: '镜头管理',
    assets: '资产管理',
    generation_history: '生成记录',
    project_management: '项目管理',
    customers: '客户管理',
    brands: '品牌管理',
    projects: '项目管理',
    briefs: '提案管理',
    tasks: '任务管理',
    reviews: '审核管理',
    system_settings: '系统设置',
    roles: '角色权限',
    settings: '系统设置',
    create: '创建',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    search: '搜索',
    filter: '筛选',
    actions: '操作',
    status: '状态',
    name: '名称',
    type: '类型',
    model: '模型',
    version: '版本',
    created_at: '创建时间',
    updated_at: '更新时间',
  },
  en: {
    dashboard: 'Dashboard',
    content_creation: 'Content Creation',
    keyframes: 'KeyFrames',
    shots: 'Shots',
    assets: 'Assets',
    generation_history: 'Generation History',
    project_management: 'Project Management',
    customers: 'Customers',
    brands: 'Brands',
    projects: 'Projects',
    briefs: 'Briefs',
    tasks: 'Tasks',
    reviews: 'Reviews',
    system_settings: 'System Settings',
    roles: 'Roles',
    settings: 'Settings',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    actions: 'Actions',
    status: 'Status',
    name: 'Name',
    type: 'Type',
    model: 'Model',
    version: 'Version',
    created_at: 'Created At',
    updated_at: 'Updated At',
  }
};

let currentLang = 'zh';

export function setLanguage(lang: string): void {
  if (translations[lang]) {
    currentLang = lang;
  }
}

export function t(key: string): string {
  return translations[currentLang]?.[key] || key;
}

export function getCurrentLang(): string {
  return currentLang;
}
