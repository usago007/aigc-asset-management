import { useState } from 'react'
import { Settings, Video, Image, Upload, Download, RotateCcw, Check, AlertTriangle, Sparkles, Key, Copy, Eye as EyeIcon, EyeOff, Trash2 } from 'lucide-react'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { AI_PRESETS, type AIPresetEnv } from '@/types/aiConfig'
import { showToast } from '@/utils/toast'

interface EndpointCardProps {
  title: string
  enabled: boolean
  reqKey: string
  timeout: number
  maxRetries: number
  onToggle: (enabled: boolean) => void
  onChange: (field: string, value: string | number) => void
}

function EndpointCard({ title, enabled, reqKey, timeout, maxRetries, onToggle, onChange }: EndpointCardProps) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${enabled ? 'border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/30' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60'}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(true)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${enabled ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'}`}
          >
            启用
          </button>
          <button
            onClick={() => onToggle(false)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${!enabled ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'}`}
          >
            禁用
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">req_key</label>
          <input
            type="text"
            value={reqKey}
            onChange={(e) => onChange('reqKey', e.target.value)}
            disabled={!enabled}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">超时 (ms)</label>
            <input
              type="number"
              value={timeout}
              onChange={(e) => onChange('timeout', parseInt(e.target.value) || 30000)}
              disabled={!enabled}
              min={1000}
              max={300000}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">重试次数</label>
            <input
              type="number"
              value={maxRetries}
              onChange={(e) => onChange('maxRetries', parseInt(e.target.value) || 3)}
              disabled={!enabled}
              min={0}
              max={10}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIConfigPanel() {
  const config = useAIConfigStore(s => s.config)
  const updateGeneral = useAIConfigStore(s => s.updateGeneral)
  const updateVideoEndpoint = useAIConfigStore(s => s.updateVideoEndpoint)
  const updateImageEndpoint = useAIConfigStore(s => s.updateImageEndpoint)
  const updateDeepSeek = useAIConfigStore(s => s.updateDeepSeek)
  const resetToDefaults = useAIConfigStore(s => s.resetToDefaults)
  const applyPreset = useAIConfigStore(s => s.applyPreset)
  const exportConfig = useAIConfigStore(s => s.exportConfig)
  const importConfig = useAIConfigStore(s => s.importConfig)

  const [preset, setPreset] = useState<AIPresetEnv>('production')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const apiKeys = [
    { id: 'volcengine', name: '火山引擎', value: config.general.apiKey, placeholder: 'sk-volcengine-••••••••', onUpdate: (v: string) => updateGeneral({ apiKey: v }) },
    { id: 'deepseek', name: 'DeepSeek', value: config.deepseek.apiKey, placeholder: 'sk-deepseek-••••••••', onUpdate: (v: string) => updateDeepSeek({ apiKey: v }) },
  ]

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyKey = (id: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedKey(id)
    showToast('success', '密钥已复制到剪贴板')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleExport = () => {
    const json = exportConfig()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', '配置导出成功')
  }

  const handleImport = () => {
    if (!importJson.trim()) {
      showToast('error', '请输入 JSON 配置')
      return
    }
    const success = importConfig(importJson)
    if (success) {
      showToast('success', '配置导入成功')
      setShowImport(false)
      setImportJson('')
    } else {
      showToast('error', '配置导入失败，请检查 JSON 格式')
    }
  }

  const handleReset = () => {
    resetToDefaults()
    setShowResetConfirm(false)
    showToast('success', '已恢复默认配置')
  }

  const handlePresetChange = (value: AIPresetEnv) => {
    setPreset(value)
    applyPreset(value)
    showToast('success', `已切换到${AI_PRESETS_LABELS[value]}`)
  }

  const formatMs = (ms: number) => {
    const seconds = ms / 1000
    const minutes = seconds / 60
    const hours = minutes / 60
    if (hours >= 1) return `${hours}小时`
    if (minutes >= 1) return `${minutes}分钟`
    return `${seconds}秒`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings size={20} className="text-primary-500" />
            AI 能力配置
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理 AI 生图、生视频 API 配置</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value as AIPresetEnv)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
          >
            <option value="development">开发环境</option>
            <option value="staging">测试环境</option>
            <option value="production">生产环境</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Settings size={18} className="text-primary-500" />
          通用 AI 配置
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">API 基础地址</label>
              <input
                type="text"
                value={config.general.baseUrl}
                onChange={(e) => updateGeneral({ baseUrl: e.target.value })}
                className="input-field"
                placeholder="https://visual.volcengineapi.com"
              />
            </div>
            <div>
              <label className="label-field">API 密钥</label>
              <input
                type="password"
                value={config.general.apiKey}
                onChange={(e) => updateGeneral({ apiKey: e.target.value })}
                className="input-field"
                placeholder="••••••••••••••••"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">应用 ID</label>
              <input
                type="text"
                value={config.general.appId}
                onChange={(e) => updateGeneral({ appId: e.target.value })}
                className="input-field"
                placeholder="••••••••••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">轮询间隔 (ms)</label>
                <input
                  type="number"
                  value={config.general.pollInterval}
                  onChange={(e) => updateGeneral({ pollInterval: parseInt(e.target.value) || 5000 })}
                  min={1000}
                  max={60000}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">轮询最大次数</label>
                <input
                  type="number"
                  value={config.general.pollMaxAttempts}
                  onChange={(e) => updateGeneral({ pollMaxAttempts: parseInt(e.target.value) || 120 })}
                  min={1}
                  max={1000}
                  className="input-field"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">视频过期时间</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{formatMs(config.general.videoExpiryMs)} ({config.general.videoExpiryMs} ms)</p>
              <input
                type="number"
                value={config.general.videoExpiryMs}
                onChange={(e) => updateGeneral({ videoExpiryMs: parseInt(e.target.value) || 3600000 })}
                className="input-field mt-2"
              />
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">图片过期时间</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{formatMs(config.general.imageExpiryMs)} ({config.general.imageExpiryMs} ms)</p>
              <input
                type="number"
                value={config.general.imageExpiryMs}
                onChange={(e) => updateGeneral({ imageExpiryMs: parseInt(e.target.value) || 86400000 })}
                className="input-field mt-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Video size={18} className="text-primary-500" />
          视频生成 API
        </h2>
        <div className="space-y-4">
          <EndpointCard
            title="文生视频"
            enabled={config.video.textToVideo.enabled}
            reqKey={config.video.textToVideo.reqKey}
            timeout={config.video.textToVideo.timeout}
            maxRetries={config.video.textToVideo.maxRetries}
            onToggle={(enabled) => updateVideoEndpoint('text-to-video', { enabled })}
            onChange={(field, value) => updateVideoEndpoint('text-to-video', { [field]: value })}
          />
          <EndpointCard
            title="首帧图生视频"
            enabled={config.video.imageToVideoFirst.enabled}
            reqKey={config.video.imageToVideoFirst.reqKey}
            timeout={config.video.imageToVideoFirst.timeout}
            maxRetries={config.video.imageToVideoFirst.maxRetries}
            onToggle={(enabled) => updateVideoEndpoint('image-to-video-first', { enabled })}
            onChange={(field, value) => updateVideoEndpoint('image-to-video-first', { [field]: value })}
          />
          <EndpointCard
            title="首尾帧图生视频"
            enabled={config.video.imageToVideoFirstTail.enabled}
            reqKey={config.video.imageToVideoFirstTail.reqKey}
            timeout={config.video.imageToVideoFirstTail.timeout}
            maxRetries={config.video.imageToVideoFirstTail.maxRetries}
            onToggle={(enabled) => updateVideoEndpoint('image-to-video-first-tail', { enabled })}
            onChange={(field, value) => updateVideoEndpoint('image-to-video-first-tail', { [field]: value })}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Image size={18} className="text-primary-500" />
          图片生成 API
        </h2>
        <div className="space-y-4">
          <EndpointCard
            title="即梦图片4.0（文生图/图生图）"
            enabled={config.image.textToImage.enabled}
            reqKey={config.image.textToImage.reqKey}
            timeout={config.image.textToImage.timeout}
            maxRetries={config.image.textToImage.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('text-to-image', { enabled })}
            onChange={(field, value) => updateImageEndpoint('text-to-image', { [field]: value })}
          />
          <EndpointCard
            title="即梦图片4.6（风格化/平面/人像）"
            enabled={config.image.stylizationEdit.enabled}
            reqKey={config.image.stylizationEdit.reqKey}
            timeout={config.image.stylizationEdit.timeout}
            maxRetries={config.image.stylizationEdit.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('stylization-edit', { enabled })}
            onChange={(field, value) => updateImageEndpoint('stylization-edit', { [field]: value })}
          />
          <EndpointCard
            title="即梦智能超清"
            enabled={config.image.superResolution.enabled}
            reqKey={config.image.superResolution.reqKey}
            timeout={config.image.superResolution.timeout}
            maxRetries={config.image.superResolution.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('super-resolution', { enabled })}
            onChange={(field, value) => updateImageEndpoint('super-resolution', { [field]: value })}
          />
          <EndpointCard
            title="即梦交互编辑（inpainting）"
            enabled={config.image.inpainting.enabled}
            reqKey={config.image.inpainting.reqKey}
            timeout={config.image.inpainting.timeout}
            maxRetries={config.image.inpainting.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('inpainting', { enabled })}
            onChange={(field, value) => updateImageEndpoint('inpainting', { [field]: value })}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Sparkles size={18} className="text-primary-500" />
          DeepSeek AI 配置（提示词优化）
        </h2>
        <div className={`rounded-xl border p-4 transition-all ${config.deepseek.enabled ? 'border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/30' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">DeepSeek 提示词优化</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">使用 DeepSeek AI 优化生图/生视频的提示词质量</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateDeepSeek({ enabled: true })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${config.deepseek.enabled ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'}`}
              >
                启用
              </button>
              <button
                onClick={() => updateDeepSeek({ enabled: false })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${!config.deepseek.enabled ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'}`}
              >
                禁用
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">API 基础地址</label>
                <input
                  type="text"
                  value={config.deepseek.baseUrl}
                  onChange={(e) => updateDeepSeek({ baseUrl: e.target.value })}
                  disabled={!config.deepseek.enabled}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://api.deepseek.com"
                />
              </div>
              <div>
                <label className="label-field">API 密钥</label>
                <input
                  type="password"
                  value={config.deepseek.apiKey}
                  onChange={(e) => updateDeepSeek({ apiKey: e.target.value })}
                  disabled={!config.deepseek.enabled}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="sk-••••••••••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">模型</label>
                <select
                  value={config.deepseek.model}
                  onChange={(e) => updateDeepSeek({ model: e.target.value })}
                  disabled={!config.deepseek.enabled}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="deepseek-chat">deepseek-chat</option>
                  <option value="deepseek-coder">deepseek-coder</option>
                  <option value="deepseek-reasoner">deepseek-reasoner</option>
                </select>
              </div>
              <div>
                <label className="label-field">超时 (ms)</label>
                <input
                  type="number"
                  value={config.deepseek.timeout}
                  onChange={(e) => updateDeepSeek({ timeout: parseInt(e.target.value) || 30000 })}
                  disabled={!config.deepseek.enabled}
                  min={1000}
                  max={120000}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Temperature (0-2)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.deepseek.temperature}
                  onChange={(e) => updateDeepSeek({ temperature: parseFloat(e.target.value) || 0.7 })}
                  disabled={!config.deepseek.enabled}
                  min={0}
                  max={2}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">较低值更确定，较高值更随机</p>
              </div>
              <div>
                <label className="label-field">最大 Token 数</label>
                <input
                  type="number"
                  value={config.deepseek.maxTokens}
                  onChange={(e) => updateDeepSeek({ maxTokens: parseInt(e.target.value) || 4096 })}
                  disabled={!config.deepseek.enabled}
                  min={1}
                  max={8192}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">单次响应的最大 token 数量</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Key size={18} className="text-primary-500" />
          API 密钥管理
        </h2>
        <div className="space-y-4">
          {apiKeys.map(key => (
            <div key={key.id} className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{key.name}</h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleKeyVisibility(key.id)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title={visibleKeys[key.id] ? '隐藏' : '显示'}
                  >
                    {visibleKeys[key.id] ? <EyeOff size={14} className="text-gray-600 dark:text-gray-400" /> : <EyeIcon size={14} className="text-gray-600 dark:text-gray-400" />}
                  </button>
                  <button
                    onClick={() => copyKey(key.id, key.value)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="复制"
                    disabled={!key.value}
                  >
                    <Copy size={14} className={copiedKey === key.id ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={visibleKeys[key.id] ? 'text' : 'password'}
                  value={key.value}
                  onChange={(e) => key.onUpdate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all font-mono"
                  placeholder={key.placeholder}
                />
                {key.value && (
                  <button
                    onClick={() => key.onUpdate('')}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="清除"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {key.id === 'volcengine' ? '火山引擎视觉智能 API 密钥，用于生图/生视频服务' : 'DeepSeek API 密钥，用于提示词优化'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">确认重置配置</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">此操作将恢复所有 AI 配置为默认值，无法撤销。是否继续？</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">导入配置</h3>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none resize-none"
              placeholder='{"general": {...}, "video": {...}, "image": {...}}'
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowImport(false); setImportJson('') }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all flex items-center gap-2"
              >
                <Check size={14} />
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            onClick={() => {
              showToast('success', 'AI 配置保存成功')
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Check size={14} />
            保存配置
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload size={14} />
            导入配置
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={14} />
            导出配置
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-secondary flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <RotateCcw size={14} />
            重置默认
          </button>
        </div>
      </div>
    </div>
  )
}

const AI_PRESETS_LABELS: Record<AIPresetEnv, string> = {
  development: '开发环境',
  staging: '测试环境',
  production: '生产环境',
}
