import { useState } from 'react'
import { BellRing, Database, Globe, Monitor, Moon, Palette, Save, Sun } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { useTheme } from '@/context/ThemeContext'
import { Switch } from '@/components/ui/switch'
import { storageGet, storageSet } from '@/utils/storage'
import { NativeSelect } from '@/components/ui/native-select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PageIntro, PageShell } from '@/components/PageShell'

type SettingsSection = 'general' | 'appearance' | 'automation' | 'runtime'

const sectionItems: { id: SettingsSection; title: string; description: string; icon: typeof Globe }[] = [
  { id: 'general', title: '通用偏好', description: '语言、分页和基础使用偏好', icon: Globe },
  { id: 'appearance', title: '界面与主题', description: '主题、界面观感与阅读方式', icon: Palette },
  { id: 'automation', title: '通知与自动保存', description: '消息提醒与本地保存策略', icon: BellRing },
  { id: 'runtime', title: '本地数据与运行说明', description: '当前运行方式与本地存储说明', icon: Database },
]

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [settings, setSettings] = useState({
    language: storageGet('language', 'zh'),
    pageSize: storageGet('pageSize', '10'),
    notifications: storageGet('notifications', true),
    autoSave: storageGet('autoSave', true),
    theme: storageGet('theme', theme),
  })

  const jumpToSection = (section: SettingsSection) => {
    setActiveSection(section)
    document.getElementById(`settings-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSave = () => {
    storageSet('language', settings.language)
    storageSet('pageSize', settings.pageSize)
    storageSet('notifications', settings.notifications)
    storageSet('autoSave', settings.autoSave)
    storageSet('theme', settings.theme)
    storageSet('settings', settings)
    setTheme(settings.theme)
    showToast('success', '设置保存成功')
  }

  return (
    <PageShell className="page-shell-workbench">
      <PageIntro
        eyebrow="系统管理"
        title="系统设置"
        description="集中管理系统偏好、界面观感、通知策略和本地运行方式。这一页不再只是单个表单卡片，而是完整的配置中心。"
      />

      <div className="summary-grid xl:grid-cols-4">
        <div className="summary-card">
          <p className="field-label">默认语言</p>
          <p className="summary-value">{settings.language === 'zh' ? '中文' : 'EN'}</p>
          <p className="summary-label">当前系统展示语言</p>
        </div>
        <div className="summary-card">
          <p className="field-label">分页容量</p>
          <p className="summary-value">{settings.pageSize}</p>
          <p className="summary-label">列表页默认每页条数</p>
        </div>
        <div className="summary-card">
          <p className="field-label">通知状态</p>
          <p className="summary-value">{settings.notifications ? '开启' : '关闭'}</p>
          <p className="summary-label">系统提醒与状态消息</p>
        </div>
        <div className="summary-card">
          <p className="field-label">当前主题</p>
          <p className="summary-value">{settings.theme === 'dark' ? '深色' : '浅色'}</p>
          <p className="summary-label">阅读模式与界面观感</p>
        </div>
      </div>

      <div className="config-layout">
        <aside className="config-nav">
          {sectionItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => jumpToSection(item.id)}
                className={`config-nav-item ${isActive ? 'config-nav-item-active' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-xl border px-2.5 py-2 ${isActive ? 'border-white/20 bg-white/10 text-white dark:border-gray-950/10 dark:bg-gray-950/10 dark:text-gray-950' : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className={`panel-title ${isActive ? 'text-white dark:text-gray-950' : ''}`}>{item.title}</p>
                    <p className={`helper-text ${isActive ? 'text-white/80 dark:text-gray-700' : ''}`}>{item.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </aside>

        <div className="config-pane">
          <section id="settings-general" className="config-block">
            <div className="config-block-head">
              <p className="eyebrow">General</p>
              <h2 className="section-title">通用偏好</h2>
              <p className="section-subtitle">控制基础阅读体验与列表使用习惯，作为整站的默认偏好。</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>显示语言</Label>
                <NativeSelect
                  value={settings.language}
                  onChange={(event) => setSettings({ ...settings, language: event.target.value })}
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </NativeSelect>
                <p className="helper-text">用于切换系统界面与基础提示文案。</p>
              </div>
              <div className="space-y-2">
                <Label>默认每页条数</Label>
                <NativeSelect
                  value={settings.pageSize}
                  onChange={(event) => setSettings({ ...settings, pageSize: event.target.value })}
                >
                  <option value="10">10 条</option>
                  <option value="20">20 条</option>
                  <option value="50">50 条</option>
                </NativeSelect>
                <p className="helper-text">作用于表格页、列表页和部分结果区的初始展示密度。</p>
              </div>
            </div>
          </section>

          <section id="settings-appearance" className="config-block">
            <div className="config-block-head">
              <p className="eyebrow">Appearance</p>
              <h2 className="section-title">界面与主题</h2>
              <p className="section-subtitle">统一系统阅读方式和界面风格，不扩展新主题，只收口现有两种模式。</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <button
                type="button"
                className={`rounded-3xl border p-5 text-left transition-colors ${
                  settings.theme === 'light'
                    ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                    : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100'
                }`}
                onClick={() => setSettings({ ...settings, theme: 'light' })}
              >
                <div className="flex items-center gap-3">
                  <Sun size={18} />
                  <p className="panel-title text-inherit">浅色模式</p>
                </div>
                <p className="mt-3 text-sm opacity-80">适合日间浏览与演示场景，保持更高的内容可读性。</p>
              </button>
              <button
                type="button"
                className={`rounded-3xl border p-5 text-left transition-colors ${
                  settings.theme === 'dark'
                    ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                    : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100'
                }`}
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
              >
                <div className="flex items-center gap-3">
                  <Moon size={18} />
                  <p className="panel-title text-inherit">深色模式</p>
                </div>
                <p className="mt-3 text-sm opacity-80">适合长时间操作或低亮环境，降低高亮背景带来的视觉干扰。</p>
              </button>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="surface-panel">
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-gray-500" />
                  <p className="panel-title">界面风格</p>
                </div>
                <p className="body-muted mt-2">当前系统已统一为浅底、细线、弱装饰、强秩序的后台工作台风格。</p>
              </div>
              <div className="surface-panel">
                <div className="flex items-center gap-2">
                  <Palette size={16} className="text-gray-500" />
                  <p className="panel-title">视觉节奏</p>
                </div>
                <p className="body-muted mt-2">标题、表格、表单与详情页共用同一套排版与密度标准。</p>
              </div>
              <div className="surface-panel">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-gray-500" />
                  <p className="panel-title">使用建议</p>
                </div>
                <p className="body-muted mt-2">若以团队演示和日常录屏为主，建议默认使用浅色模式。</p>
              </div>
            </div>
          </section>

          <section id="settings-automation" className="config-block">
            <div className="config-block-head">
              <p className="eyebrow">Automation</p>
              <h2 className="section-title">通知与自动保存</h2>
              <p className="section-subtitle">管理本地使用体验，不引入新的业务字段，只增强现有展示结构。</p>
            </div>
            <div className="space-y-4">
              <div className="surface-panel flex items-center justify-between gap-6">
                <div>
                  <p className="panel-title">启用系统通知</p>
                  <p className="body-muted mt-1">接收任务状态、生成进度和关键提醒，适合需要盯进度的工作流。</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              </div>
              <div className="surface-panel flex items-center justify-between gap-6">
                <div>
                  <p className="panel-title">自动保存本地设置</p>
                  <p className="body-muted mt-1">保存分页、主题和基础偏好，减少每次进入系统都要重新设置的成本。</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                />
              </div>
            </div>
          </section>

          <section id="settings-runtime" className="config-block">
            <div className="config-block-head">
              <p className="eyebrow">Runtime</p>
              <h2 className="section-title">本地数据与运行说明</h2>
              <p className="section-subtitle">说明当前页面使用方式与本地保存边界，避免误把展示层设置当成服务端配置。</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="surface-panel">
                <p className="field-label">运行入口</p>
                <p className="panel-title mt-2">本地前端工作台</p>
                <p className="body-muted mt-2">日常视觉验收优先通过本地服务访问，构建预览只用于交付前检查，不承担实时更新职责。</p>
              </div>
              <div className="surface-panel">
                <p className="field-label">数据边界</p>
                <p className="panel-title mt-2">偏好仅保存在本地</p>
                <p className="body-muted mt-2">当前页面保存的是本地偏好与界面配置，不会改动业务路由、接口契约或任务数据结构。</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="config-action-bar">
        <div>
          <p className="panel-title">准备保存当前配置</p>
          <p className="helper-text mt-1">保存后立即写入本地偏好，并同步当前主题设置。</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save size={16} />
          保存设置
        </Button>
      </div>
    </PageShell>
  )
}
