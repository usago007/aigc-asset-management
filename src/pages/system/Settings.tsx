import { useState } from 'react'
import { Palette, Globe, Moon, Sun, Monitor } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { useTheme } from '@/context/ThemeContext'
import { Switch } from '@/components/ui/switch'
import { storageGet, storageSet } from '@/utils/storage'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    language: storageGet('language', 'zh'),
    pageSize: storageGet('pageSize', '10'),
    notifications: storageGet('notifications', true),
    autoSave: storageGet('autoSave', true),
  })

  const handleSave = () => {
    storageSet('settings', settings)
    showToast('success', '设置保存成功')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">系统设置</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">配置系统参数和偏好设置</p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Palette size={18} className="text-accent-500" />
          外观设置
        </h2>
        <div className="space-y-6">
          <div>
            <label className="label-field">主题</label>
            <div className="flex gap-3">
              <button
                className={`px-5 py-3 rounded-xl border-2 transition-all flex items-center gap-2.5 font-medium text-sm ${
                  theme === 'dark'
                    ? 'border-accent-500 bg-accent-500/10 text-accent-500 dark:border-accent-500'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={16} />
                <div className="text-left">
                  <div>深色</div>
                  <div className="text-xs opacity-60 font-normal">适合暗光环境</div>
                </div>
              </button>
              <button
                className={`px-5 py-3 rounded-xl border-2 transition-all flex items-center gap-2.5 font-medium text-sm ${
                  theme === 'light'
                    ? 'border-accent-500 bg-accent-500/10 text-accent-500 dark:border-accent-500'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
                onClick={() => setTheme('light')}
              >
                <Sun size={16} />
                <div className="text-left">
                  <div>浅色</div>
                  <div className="text-xs opacity-60 font-normal">适合明亮环境</div>
                </div>
              </button>
            </div>
          </div>
          <div>
            <label className="label-field">语言</label>
            <select
              className="input-field max-w-xs"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Globe size={18} className="text-accent-500" />
          通用设置
        </h2>
        <div className="space-y-4">
          <div>
            <label className="label-field">默认每页条数</label>
            <select
              className="input-field max-w-xs"
              value={settings.pageSize}
              onChange={(e) => setSettings({ ...settings, pageSize: e.target.value })}
            >
              <option value="10">10条</option>
              <option value="20">20条</option>
              <option value="50">50条</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-300">启用通知</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">接收系统通知和提醒</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-300">自动保存</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">自动保存表单数据到本地存储</p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={handleSave}>保存设置</button>
      </div>
    </div>
  )
}
