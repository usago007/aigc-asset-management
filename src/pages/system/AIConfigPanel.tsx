import { useState } from 'react'
import { Settings, Video, Image, Upload, Download, RotateCcw, Check, AlertTriangle, Sparkles, Key, Copy, Eye as EyeIcon, EyeOff, Trash2 } from 'lucide-react'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { AI_PRESETS, type AIPresetEnv } from '@/types/aiConfig'
import { showToast } from '@/utils/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { ActionIconButton } from '@/components/ui/action-icon-button'
import { PageIntro, PageShell } from '@/components/PageShell'

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
    <div className={`rounded-2xl border p-4 transition-all ${enabled ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900' : 'border-gray-100 bg-gray-50/70 opacity-60 dark:border-gray-800 dark:bg-gray-950'}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="body-text font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onToggle(true)}
            variant="ghost"
            size="sm"
            className={enabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300' : 'text-gray-400 dark:text-gray-500'}
          >
            启用
          </Button>
          <Button
            onClick={() => onToggle(false)}
            variant="ghost"
            size="sm"
            className={!enabled ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300' : 'text-gray-400 dark:text-gray-500'}
          >
            禁用
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="meta-text mb-1 block font-medium">req_key</label>
          <Input
            value={reqKey}
            onChange={(e) => onChange('reqKey', e.target.value)}
            disabled={!enabled}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="meta-text mb-1 block font-medium">超时 (ms)</label>
            <Input
              type="number"
              value={timeout}
              onChange={(e) => onChange('timeout', parseInt(e.target.value) || 30000)}
              disabled={!enabled}
              min={1000}
              max={300000}
            />
          </div>
          <div>
            <label className="meta-text mb-1 block font-medium">重试次数</label>
            <Input
              type="number"
              value={maxRetries}
              onChange={(e) => onChange('maxRetries', parseInt(e.target.value) || 3)}
              disabled={!enabled}
              min={0}
              max={10}
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
    <PageShell>
      <PageIntro
        eyebrow="系统管理 / AI 基础设施"
        title="AI 能力配置"
        description="按环境管理图片与视频模型端点、请求键和调用策略，保持模拟服务与真实接口契约一致。"
        actions={(
          <NativeSelect
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value as AIPresetEnv)}
          >
            <option value="development">开发环境</option>
            <option value="staging">测试环境</option>
            <option value="production">生产环境</option>
          </NativeSelect>
        )}
      />

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Settings size={18} className="text-gray-500" />
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
            <div className="surface-panel">
              <p className="meta-text mb-1 font-medium">图片过期时间</p>
              <p className="body-text text-gray-900 dark:text-gray-100">{formatMs(config.general.imageExpiryMs)} ({config.general.imageExpiryMs} ms)</p>
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
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Video size={18} className="text-gray-500" />
          视频生成 API
        </h2>
        <div className="space-y-4">
          <EndpointCard
            title="视频生成3.0 Pro"
            enabled={config.video.video30Pro.enabled}
            reqKey={config.video.video30Pro.reqKey}
            timeout={config.video.video30Pro.timeout}
            maxRetries={config.video.video30Pro.maxRetries}
            onToggle={(enabled) => updateVideoEndpoint('text-to-video', { enabled })}
            onChange={(field, value) => updateVideoEndpoint('text-to-video', { [field]: value })}
          />
          <EndpointCard
            title="视频生成3.0"
            enabled={config.video.video30.enabled}
            reqKey={config.video.video30.reqKey}
            timeout={config.video.video30.timeout}
            maxRetries={config.video.video30.maxRetries}
            onToggle={(enabled) => updateVideoEndpoint('image-to-video-first', { enabled })}
            onChange={(field, value) => updateVideoEndpoint('image-to-video-first', { [field]: value })}
          />
          <EndpointCard
            title="动作模仿"
            enabled={config.video.actionImitation.enabled}
            reqKey={config.video.actionImitation.reqKey}
            timeout={config.video.actionImitation.timeout}
            maxRetries={config.video.actionImitation.maxRetries}
            onToggle={(enabled) => updateVideoEndpoint('action-imitation', { enabled })}
            onChange={(field, value) => updateVideoEndpoint('action-imitation', { [field]: value })}
          />
          <EndpointCard
            title="数字人快速模式"
            enabled={config.video.digitalHumanFast.enabled}
            reqKey={config.video.digitalHumanFast.reqKey}
            timeout={config.video.digitalHumanFast.timeout}
            maxRetries={config.video.digitalHumanFast.maxRetries}
            onToggle={(enabled) => updateVideoEndpoint('digital-human-fast', { enabled })}
            onChange={(field, value) => updateVideoEndpoint('digital-human-fast', { [field]: value })}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Image size={18} className="text-gray-500" />
          图片生成 API
        </h2>
        <div className="space-y-4">
          <EndpointCard
            title="即梦图片4.0"
            enabled={config.image.image40.enabled}
            reqKey={config.image.image40.reqKey}
            timeout={config.image.image40.timeout}
            maxRetries={config.image.image40.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('text-to-image', { enabled })}
            onChange={(field, value) => updateImageEndpoint('text-to-image', { [field]: value })}
          />
          <EndpointCard
            title="文生图3.1"
            enabled={config.image.textToImage31.enabled}
            reqKey={config.image.textToImage31.reqKey}
            timeout={config.image.textToImage31.timeout}
            maxRetries={config.image.textToImage31.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('text-to-image-31', { enabled })}
            onChange={(field, value) => updateImageEndpoint('text-to-image-31', { [field]: value })}
          />
          <EndpointCard
            title="文生图3.0"
            enabled={config.image.textToImage30.enabled}
            reqKey={config.image.textToImage30.reqKey}
            timeout={config.image.textToImage30.timeout}
            maxRetries={config.image.textToImage30.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('text-to-image-30', { enabled })}
            onChange={(field, value) => updateImageEndpoint('text-to-image-30', { [field]: value })}
          />
          <EndpointCard
            title="图生图3.0-智能参考"
            enabled={config.image.imageToImage30.enabled}
            reqKey={config.image.imageToImage30.reqKey}
            timeout={config.image.imageToImage30.timeout}
            maxRetries={config.image.imageToImage30.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('image-to-image', { enabled })}
            onChange={(field, value) => updateImageEndpoint('image-to-image', { [field]: value })}
          />
          <EndpointCard
            title="文生图2.1"
            enabled={config.image.textToImage21.enabled}
            reqKey={config.image.textToImage21.reqKey}
            timeout={config.image.textToImage21.timeout}
            maxRetries={config.image.textToImage21.maxRetries}
            onToggle={(enabled) => updateImageEndpoint('text-to-image-21', { enabled })}
            onChange={(field, value) => updateImageEndpoint('text-to-image-21', { [field]: value })}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Sparkles size={18} className="text-gray-500" />
          DeepSeek AI 配置（提示词优化）
        </h2>
        <div className={`rounded-2xl border p-4 transition-all ${config.deepseek.enabled ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900' : 'border-gray-100 bg-gray-50/70 opacity-60 dark:border-gray-800 dark:bg-gray-950'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="body-text font-semibold text-gray-900 dark:text-gray-100">DeepSeek 提示词优化</h4>
              <p className="meta-text mt-0.5">使用 DeepSeek AI 优化生图/生视频的提示词质量</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => updateDeepSeek({ enabled: true })}
                variant="ghost"
                size="sm"
                className={config.deepseek.enabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300' : 'text-gray-400 dark:text-gray-500'}
              >
                启用
              </Button>
              <Button
                onClick={() => updateDeepSeek({ enabled: false })}
                variant="ghost"
                size="sm"
                className={!config.deepseek.enabled ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300' : 'text-gray-400 dark:text-gray-500'}
              >
                禁用
              </Button>
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
                <NativeSelect
                  value={config.deepseek.model}
                  onChange={(e) => updateDeepSeek({ model: e.target.value })}
                  disabled={!config.deepseek.enabled}
                >
                  <option value="deepseek-chat">deepseek-chat</option>
                  <option value="deepseek-coder">deepseek-coder</option>
                  <option value="deepseek-reasoner">deepseek-reasoner</option>
                </NativeSelect>
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
                <p className="meta-text mt-1">较低值更确定，较高值更随机</p>
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
                <p className="meta-text mt-1">单次响应的最大 token 数量</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title mb-6 flex items-center gap-2">
          <Key size={18} className="text-gray-500" />
          API 密钥管理
        </h2>
        <div className="space-y-4">
          {apiKeys.map(key => (
            <div key={key.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="body-text font-semibold text-gray-900 dark:text-gray-100">{key.name}</h4>
                <div className="flex items-center gap-1">
                  <ActionIconButton
                    onClick={() => toggleKeyVisibility(key.id)}
                    title={visibleKeys[key.id] ? '隐藏' : '显示'}
                  >
                    {visibleKeys[key.id] ? <EyeOff size={14} className="text-gray-600 dark:text-gray-400" /> : <EyeIcon size={14} className="text-gray-600 dark:text-gray-400" />}
                  </ActionIconButton>
                  <ActionIconButton
                    onClick={() => copyKey(key.id, key.value)}
                    title="复制"
                    disabled={!key.value}
                  >
                    <Copy size={14} className={copiedKey === key.id ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'} />
                  </ActionIconButton>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type={visibleKeys[key.id] ? 'text' : 'password'}
                  value={key.value}
                  onChange={(e) => key.onUpdate(e.target.value)}
                  className="flex-1 font-mono"
                  placeholder={key.placeholder}
                />
                {key.value && (
                  <ActionIconButton
                    tone="danger"
                    onClick={() => key.onUpdate('')}
                    title="清除"
                  >
                    <Trash2 size={14} />
                  </ActionIconButton>
                )}
              </div>
              <p className="meta-text mt-2">
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
              <h3 className="card-title">确认重置配置</h3>
            </div>
            <p className="body-muted mb-6">此操作将恢复所有 AI 配置为默认值，无法撤销。是否继续？</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleReset}
                variant="destructive"
              >
                确认重置
              </Button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg mx-4">
            <h3 className="card-title mb-4">导入配置</h3>
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={12}
              className="font-mono resize-none"
              placeholder='{"general": {...}, "video": {...}, "image": {...}}'
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => { setShowImport(false); setImportJson('') }}
              >
                取消
              </Button>
              <Button
                onClick={handleImport}
                className="gap-2"
              >
                <Check size={14} />
                确认导入
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <Button
            onClick={() => {
              showToast('success', 'AI 配置保存成功')
            }}
            className="gap-2"
          >
            <Check size={14} />
            保存配置
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowImport(true)}
            className="gap-2"
          >
            <Upload size={14} />
            导入配置
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            className="gap-2"
          >
            <Download size={14} />
            导出配置
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowResetConfirm(true)}
            className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <RotateCcw size={14} />
            重置默认
          </Button>
        </div>
      </div>
    </PageShell>
  )
}

const AI_PRESETS_LABELS: Record<AIPresetEnv, string> = {
  development: '开发环境',
  staging: '测试环境',
  production: '生产环境',
}
