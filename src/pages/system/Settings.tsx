import { useState, useEffect } from 'react'
import { Palette, Globe, Moon, Sun } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { storageGet, storageSet } from '@/utils/storage'

export default function Settings() {
  const [settings, setSettings] = useState({
    language: 'zh',
    theme: storageGet('theme', 'dark'),
    pageSize: '10',
    notifications: true,
    autoSave: true,
  })

  useEffect(() => {
    document.body.className = settings.theme === 'light'
      ? 'bg-gray-100 text-gray-900'
      : 'bg-primary-950 text-gray-100'
    storageSet('theme', settings.theme)
  }, [settings.theme])

  const handleSave = () => {
    storageSet('settings', settings)
    showToast('success', '设置保存成功')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-100">系统设置</h1>
        <p className="text-gray-500 mt-1">配置系统参数和偏好设置</p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
          <Palette size={18} className="text-accent-500" />
          外观设置
        </h2>
        <div className="space-y-4">
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
          <div>
            <label className="label-field">主题</label>
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  settings.theme === 'dark' ? 'border-accent-500 bg-accent-500/10 text-accent-500' : 'border-gray-700 text-gray-400'
                }`}
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
              >
                <Moon size={16} /> 深色
              </button>
              <button
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  settings.theme === 'light' ? 'border-accent-500 bg-accent-500/10 text-accent-500' : 'border-gray-700 text-gray-400'
                }`}
                onClick={() => setSettings({ ...settings, theme: 'light' })}
              >
                <Sun size={16} /> 浅色
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
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
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-300">启用通知</p>
              <p className="text-xs text-gray-500">接收系统通知和提醒</p>
            </div>
            <button
              className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-accent-500' : 'bg-gray-700'}`}
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'left-5' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-300">自动保存</p>
              <p className="text-xs text-gray-500">自动保存表单数据到本地存储</p>
            </div>
            <button
              className={`w-10 h-6 rounded-full transition-colors relative ${settings.autoSave ? 'bg-accent-500' : 'bg-gray-700'}`}
              onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoSave ? 'left-5' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={handleSave}>保存设置</button>
      </div>
    </div>
  )
}
