import { useState } from 'react'
import { BellRing, Database, Globe, Monitor, Moon, Palette, Save, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { PageIntro, PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { storageGet, storageSet } from '@/utils/storage'
import { showToast } from '@/utils/toast'
import { syncNotificationsEnabled } from '@/utils/shellState'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    language: storageGet('language', 'zh'),
    pageSize: storageGet('pageSize', '10'),
    notifications: storageGet('notifications', true),
    autoSave: storageGet('autoSave', true),
    theme: storageGet('theme', theme),
  })

  const handleSave = () => {
    storageSet('language', settings.language)
    storageSet('pageSize', settings.pageSize)
    storageSet('notifications', settings.notifications)
    storageSet('autoSave', settings.autoSave)
    storageSet('theme', settings.theme)
    storageSet('settings', settings)
    syncNotificationsEnabled(settings.notifications)
    setTheme(settings.theme)
    showToast('success', '设置保存成功')
  }

  return (
    <PageShell>
      <PageIntro
        title="系统设置"
        actions={
          <Button onClick={handleSave} className="gap-2">
            <Save size={16} />
            保存设置
          </Button>
        }
      />

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Globe size={18} className="text-gray-500" />
          通用设置
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label-field">显示语言</label>
            <NativeSelect
              value={settings.language}
              onChange={(event) => setSettings({ ...settings, language: event.target.value })}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </NativeSelect>
            <p className="helper-text mt-2">用于切换系统界面与基础提示文案。</p>
          </div>
          <div>
            <label className="label-field">默认每页条数</label>
            <NativeSelect
              value={settings.pageSize}
              onChange={(event) => setSettings({ ...settings, pageSize: event.target.value })}
            >
              <option value="10">10 条</option>
              <option value="20">20 条</option>
              <option value="50">50 条</option>
            </NativeSelect>
            <p className="helper-text mt-2">作用于列表页、表格页与部分结果区的初始展示密度。</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Palette size={18} className="text-gray-500" />
          外观设置
        </h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
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
      </div>

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <BellRing size={18} className="text-gray-500" />
          通知与保存
        </h2>
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
      </div>

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Database size={18} className="text-gray-500" />
          运行说明
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div>
    </PageShell>
  )
}
