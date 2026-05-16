import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import Pagination from '@/components/Pagination'
import { Search, Download, Eye, RefreshCw } from 'lucide-react'
import type { TaskQueueStatus, GenerationMode, VideoGenerationTask } from '@/types/generation'

const statusMap: Record<TaskQueueStatus, { label: string; className: string }> = {
  submitting: { label: '提交中', className: 'badge-info' },
  in_queue: { label: '排队中', className: 'badge-warning' },
  generating: { label: '生成中', className: 'badge-info' },
  done: { label: '已完成', className: 'badge-success' },
  failed: { label: '失败', className: 'badge-error' },
  expired: { label: '已过期', className: 'badge-error' },
  not_found: { label: '未找到', className: 'badge-warning' },
}

const modeMap: Record<GenerationMode, string> = {
  'text-to-video': '文生视频',
  'image-to-video-first': '首帧图生',
  'image-to-video-first-tail': '首尾帧图生',
}

const truncate = (text: string, maxLen = 60) =>
  text.length <= maxLen ? text : text.slice(0, maxLen) + '...'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'done', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'expired', label: '已过期' },
  { value: 'in_queue', label: '排队中' },
  { value: 'generating', label: '生成中' },
]

const MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部模式' },
  { value: 'text-to-video', label: '文生视频' },
  { value: 'image-to-video-first', label: '首帧图生' },
  { value: 'image-to-video-first-tail', label: '首尾帧图生' },
]

export default function GenerationHistory() {
  const navigate = useNavigate()
  const { tasks, retryTask } = useGenerationStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredItems = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        searchQuery === '' || task.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || task.status === statusFilter
      const matchMode = modeFilter === 'all' || task.mode === modeFilter
      return matchSearch && matchStatus && matchMode
    })
  }, [tasks, searchQuery, statusFilter, modeFilter])

  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredItems, currentPage],
  )

  const handleDownload = (task: VideoGenerationTask) => {
    if (task.videoUrl) {
      const a = document.createElement('a')
      a.href = task.videoUrl
      a.download = `video_${task.taskId}.mp4`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">生成历史</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索提示词..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <select
          className="input-field max-w-[160px]"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="input-field max-w-[180px]"
          value={modeFilter}
          onChange={(e) => {
            setModeFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          {MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">Prompt</th>
              <th className="table-header">模式</th>
              <th className="table-header">状态</th>
              <th className="table-header">参数</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((task) => (
              <tr
                key={task.id}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                <td className="table-cell font-medium text-gray-200 max-w-xs truncate">
                  {truncate(task.prompt)}
                </td>
                <td className="table-cell">{modeMap[task.mode]}</td>
                <td className="table-cell">
                  <span className={`badge ${statusMap[task.status].className}`}>
                    {statusMap[task.status].label}
                  </span>
                </td>
                <td className="table-cell text-sm text-gray-400">
                  {task.frames}帧 / {task.aspectRatio}
                </td>
                <td className="table-cell text-gray-500">{formatDate(task.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      onClick={() => navigate(`/content/task/${task.id}`)}
                      title="查看详情"
                    >
                      <Eye size={14} className="text-gray-400" />
                    </button>
                    {task.status === 'done' && (
                      <button
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                        onClick={() => handleDownload(task)}
                        title="下载"
                      >
                        <Download size={14} className="text-success" />
                      </button>
                    )}
                    {task.status === 'failed' && (
                      <button
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                        onClick={() => retryTask(task.id)}
                        title="重试"
                      >
                        <RefreshCw size={14} className="text-warning" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && (
          <div className="py-12 text-center text-gray-500">暂无数据</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredItems.length}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
