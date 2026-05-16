import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { useNavigate } from 'react-router-dom'
import { IMAGE_API_CONFIG } from '@/services/imageGeneration'
import type { ImageGenerationMode, TaskQueueStatus } from '@/types/generation'
import { Search, Download, RefreshCw, Maximize2, Trash2 } from 'lucide-react'

const statusMap: Record<TaskQueueStatus, { label: string; className: string }> = {
  submitting: { label: '提交中', className: 'badge-info' },
  in_queue: { label: '排队中', className: 'badge-warning' },
  generating: { label: '生成中', className: 'badge-info' },
  done: { label: '已完成', className: 'badge-success' },
  failed: { label: '失败', className: 'badge-error' },
  cancelled: { label: '已取消', className: 'badge-secondary' },
  expired: { label: '已过期', className: 'badge-error' },
  not_found: { label: '未找到', className: 'badge-warning' },
}

const modeMap: Record<ImageGenerationMode, string> = {
  'text-to-image': '文生图',
  'image-to-image': '图生图',
  'stylization-edit': '风格化编辑',
  'super-resolution': '智能超清',
  'inpainting': '局部重绘',
}

const STATUS_OPTIONS: { value: TaskQueueStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'done', label: '已完成' },
  { value: 'generating', label: '生成中' },
  { value: 'failed', label: '失败' },
  { value: 'in_queue', label: '排队中' },
]

const MODE_OPTIONS: { value: ImageGenerationMode | ''; label: string }[] = [
  { value: '', label: '全部模式' },
  { value: 'text-to-image', label: '文生图' },
  { value: 'image-to-image', label: '图生图' },
  { value: 'stylization-edit', label: '风格化编辑' },
  { value: 'super-resolution', label: '智能超清' },
  { value: 'inpainting', label: '局部重绘' },
]

export default function ImageGenerationHistory() {
  const { imageTasks, retryImageTask, deleteImageTask } = useAppStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskQueueStatus | ''>('')
  const [modeFilter, setModeFilter] = useState<ImageGenerationMode | ''>('')
  const [page, setPage] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const perPage = 10

  const filtered = useMemo(() => {
    return imageTasks.filter((t) => {
      if (search && !t.prompt.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter && t.status !== statusFilter) return false
      if (modeFilter && t.mode !== modeFilter) return false
      return true
    })
  }, [imageTasks, search, statusFilter, modeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageData = filtered.slice((page - 1) * perPage, page * perPage)

  const handleDownload = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated_image.png'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">图片生成历史</h1>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={16} />
            <input
              className="input-field pl-10"
              placeholder="搜索Prompt..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input-field w-40"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as TaskQueueStatus | ''); setPage(1) }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="input-field w-40"
            value={modeFilter}
            onChange={(e) => { setModeFilter(e.target.value as ImageGenerationMode | ''); setPage(1) }}
          >
            {MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Prompt</th>
                <th className="table-cell">模式</th>
                <th className="table-cell">状态</th>
                <th className="table-cell">参数</th>
                <th className="table-cell">创建时间</th>
                <th className="table-cell">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-600 dark:text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                pageData.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <td className="table-cell max-w-[200px] truncate" title={task.prompt}>
                      {task.prompt.slice(0, 30)}{task.prompt.length > 30 ? '...' : ''}
                    </td>
                    <td className="table-cell">{modeMap[task.mode]}</td>
                    <td className="table-cell">
                      <span className={`badge ${statusMap[task.status].className}`}>
                        {statusMap[task.status].label}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-gray-800 dark:text-gray-300">
                      {task.seed !== undefined && `Seed: ${task.seed}`}
                      {task.frameType && ` · ${task.frameType === 'Opening' ? '首图' : '尾图'}`}
                    </td>
                    <td className="table-cell text-xs">{formatDate(task.createdAt)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {task.status === 'done' && task.outputImageUrls.length > 0 && (
                          <button
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-400 transition-colors"
                            title="预览"
                            onClick={() => setPreviewUrl(task.outputImageUrls[0])}
                          >
                            <Maximize2 size={14} />
                          </button>
                        )}
                        {task.status === 'done' && task.outputImageUrls.length > 0 && (
                          <button
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-400 transition-colors"
                            title="下载"
                            onClick={() => handleDownload(task.outputImageUrls[0])}
                          >
                            <Download size={14} />
                          </button>
                        )}
                        {task.status === 'failed' && (
                          <button
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-400 transition-colors"
                            title="重试"
                            onClick={() => retryImageTask(task.id)}
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors"
                          title="删除"
                          onClick={() => deleteImageTask(task.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-400">
            共 {filtered.length} 条，第 {page}/{totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-xs"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </button>
            <button
              className="btn-secondary text-xs"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              onClick={() => setPreviewUrl(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
