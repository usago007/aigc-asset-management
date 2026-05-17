import { useState } from 'react'
import { FileText, Trash2, Download, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { matchesKeyword } from '@/utils/search'

interface LogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info' | 'debug'
  source: 'video-gen' | 'image-gen' | 'system' | 'user-action'
  message: string
  details?: string
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '2026-05-17 14:32:15', level: 'info', source: 'system', message: '系统启动完成', details: '版本: v2.1.0, 环境: production' },
  { id: '2', timestamp: '2026-05-17 14:32:18', level: 'info', source: 'system', message: '配置加载成功', details: '从 localStorage 加载 AI 配置' },
  { id: '3', timestamp: '2026-05-17 14:33:01', level: 'info', source: 'user-action', message: '用户 admin 登录系统' },
  { id: '4', timestamp: '2026-05-17 14:35:22', level: 'info', source: 'video-gen', message: '视频生成任务提交', details: '模式: text-to-video, req_key: jimeng_t2v_v30_pro' },
  { id: '5', timestamp: '2026-05-17 14:35:28', level: 'info', source: 'video-gen', message: 'API 响应成功', details: '任务 ID: v-t2v-20260517-001' },
  { id: '6', timestamp: '2026-05-17 14:36:45', level: 'info', source: 'video-gen', message: '轮询任务状态', details: '状态: processing, 进度: 35%' },
  { id: '7', timestamp: '2026-05-17 14:38:12', level: 'info', source: 'video-gen', message: '视频生成完成', details: '时长: 5s, 分辨率: 1080x1920, 文件大小: 12.3MB' },
  { id: '8', timestamp: '2026-05-17 14:39:00', level: 'info', source: 'image-gen', message: '图片生成任务提交', details: '模式: text-to-image, req_key: jimeng_t2i_v40' },
  { id: '9', timestamp: '2026-05-17 14:39:05', level: 'info', source: 'image-gen', message: 'API 响应成功', details: '任务 ID: i-t2i-20260517-001' },
  { id: '10', timestamp: '2026-05-17 14:39:32', level: 'info', source: 'image-gen', message: '图片生成完成', details: '分辨率: 1024x1024, 数量: 4' },
  { id: '11', timestamp: '2026-05-17 14:40:15', level: 'warning', source: 'video-gen', message: 'API 响应超时', details: '请求耗时 28000ms, 阈值: 30000ms' },
  { id: '12', timestamp: '2026-05-17 14:40:16', level: 'info', source: 'video-gen', message: '自动重试请求', details: '重试次数: 1/3' },
  { id: '13', timestamp: '2026-05-17 14:40:22', level: 'info', source: 'video-gen', message: '重试成功', details: '任务 ID: v-i2v-20260517-002' },
  { id: '14', timestamp: '2026-05-17 14:41:00', level: 'error', source: 'image-gen', message: 'API 返回错误', details: '错误码: InvalidParameter, 提示词长度超过限制' },
  { id: '15', timestamp: '2026-05-17 14:41:30', level: 'info', source: 'user-action', message: '用户修改了 AI 配置', details: '更新了文生视频端点的 timeout 值' },
  { id: '16', timestamp: '2026-05-17 14:42:00', level: 'info', source: 'video-gen', message: '首帧图生视频任务提交', details: '模式: image-to-video-first, 参考图: 已上传' },
  { id: '17', timestamp: '2026-05-17 14:43:45', level: 'info', source: 'video-gen', message: '轮询任务状态', details: '状态: processing, 进度: 72%' },
  { id: '18', timestamp: '2026-05-17 14:45:20', level: 'info', source: 'video-gen', message: '视频生成完成', details: '时长: 5s, 分辨率: 1080x1920, 文件大小: 15.1MB' },
  { id: '19', timestamp: '2026-05-17 14:46:00', level: 'debug', source: 'system', message: '内存使用率监控', details: '当前: 62%, 峰值: 78%, 阈值: 90%' },
  { id: '20', timestamp: '2026-05-17 14:46:05', level: 'debug', source: 'system', message: 'localStorage 存储统计', details: '已用: 2.3MB, 总量: 5MB' },
  { id: '21', timestamp: '2026-05-17 14:47:00', level: 'info', source: 'image-gen', message: '图生图任务提交', details: '模式: image-to-image, req_key: jimeng_t2i_v40' },
  { id: '22', timestamp: '2026-05-17 14:47:25', level: 'info', source: 'image-gen', message: '图生图完成', details: '分辨率: 1024x1024' },
  { id: '23', timestamp: '2026-05-17 14:48:00', level: 'warning', source: 'system', message: 'localStorage 接近上限', details: '已用: 4.7MB, 总量: 5MB' },
  { id: '24', timestamp: '2026-05-17 14:48:30', level: 'info', source: 'user-action', message: '用户导出 AI 配置', details: '导出文件: ai-config-1716002910000.json' },
  { id: '25', timestamp: '2026-05-17 14:49:00', level: 'error', source: 'video-gen', message: '任务轮询失败', details: '任务 ID: v-t2v-20260517-003, 错误: NotFound' },
  { id: '26', timestamp: '2026-05-17 14:49:05', level: 'info', source: 'video-gen', message: '标记任务为失败', details: '任务 ID: v-t2v-20260517-003, 原因: 任务不存在' },
  { id: '27', timestamp: '2026-05-17 14:50:00', level: 'info', source: 'image-gen', message: '文生图3.1任务提交', details: '模式: text-to-image-31, req_key: jimeng_t2i_v31' },
  { id: '28', timestamp: '2026-05-17 14:50:45', level: 'info', source: 'image-gen', message: '文生图3.1完成', details: '原始: 1024x1024' },
  { id: '29', timestamp: '2026-05-17 14:51:00', level: 'info', source: 'user-action', message: '用户删除了角色 "临时测试"', details: '角色 ID: role-temp-001' },
  { id: '30', timestamp: '2026-05-17 14:52:00', level: 'warning', source: 'image-gen', message: '图片 API 限流', details: '速率: 45/min, 上限: 60/min' },
  { id: '31', timestamp: '2026-05-17 14:52:30', level: 'debug', source: 'system', message: '路由切换', details: '从 /dashboard 切换到 /system/ai-config' },
  { id: '32', timestamp: '2026-05-17 14:53:00', level: 'info', source: 'user-action', message: '用户创建了角色 "内容审核员"', details: '权限: project:read, task:read, asset:read, review:*' },
  { id: '33', timestamp: '2026-05-17 14:54:00', level: 'info', source: 'video-gen', message: '首尾帧图生视频任务提交', details: '模式: image-to-video-first-tail, 帧数: 2' },
  { id: '34', timestamp: '2026-05-17 14:55:30', level: 'info', source: 'video-gen', message: '视频生成完成', details: '时长: 5s, 分辨率: 1080x1920, 文件大小: 18.2MB' },
  { id: '35', timestamp: '2026-05-17 14:56:00', level: 'error', source: 'image-gen', message: '图片上传失败', details: '错误: NetworkError, 文件: makeup-product-007.jpg' },
  { id: '36', timestamp: '2026-05-17 14:56:30', level: 'info', source: 'user-action', message: '用户切换了 AI 环境预设', details: '从 production 切换到 development' },
  { id: '37', timestamp: '2026-05-17 14:57:00', level: 'debug', source: 'system', message: '定时器清理', details: '清理了 3 个过期的轮询定时器' },
  { id: '52', timestamp: '2026-05-17 14:58:00', level: 'info', source: 'image-gen', message: '文生图3.0任务提交', details: '模式: text-to-image-30, req_key: jimeng_t2i_v30' },
  { id: '53', timestamp: '2026-05-17 14:58:25', level: 'info', source: 'image-gen', message: '文生图3.0完成', details: '输出: 1024x1024' },
  { id: '40', timestamp: '2026-05-17 14:59:00', level: 'info', source: 'system', message: '日志系统初始化完成', details: '日志条目: 40, 级别分布: error=3, warning=3, info=28, debug=6' },
]

const levelMap: Record<string, { label: string; className: string }> = {
  error: { label: '错误', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  warning: { label: '警告', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  info: { label: '信息', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  debug: { label: '调试', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

const sourceMap: Record<string, { label: string; className: string }> = {
  'video-gen': { label: '视频生成', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  'image-gen': { label: '图片生成', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  system: { label: '系统', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  'user-action': { label: '用户操作', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
}

const ITEMS_PER_PAGE = 10

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailLog, setDetailLog] = useState<LogEntry | null>(null)

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false
    if (filterSource !== 'all' && log.source !== filterSource) return false
    if (!matchesKeyword(searchQuery, [log.message, log.details, log.timestamp, levelMap[log.level]?.label, sourceMap[log.source]?.label])) return false
    return true
  })

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleClear = () => {
    if (confirm('确定要清空所有日志吗？此操作不可撤销。')) {
      setLogs([])
      setCurrentPage(1)
      showToast('success', '日志已清空')
    }
  }

  const handleExport = () => {
    const json = JSON.stringify(filteredLogs, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', `已导出 ${filteredLogs.length} 条日志`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText size={20} className="text-primary-500" />
            全局日志
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">查看系统运行日志和审计记录</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={handleExport}>
            <Download size={14} />
            导出日志
          </button>
          <button className="btn-secondary flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleClear}>
            <Trash2 size={14} />
            清空日志
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="搜索日志消息或详细信息..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
          <select
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100"
          >
            <option value="all">全部级别</option>
            <option value="error">错误</option>
            <option value="warning">警告</option>
            <option value="info">信息</option>
            <option value="debug">调试</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100"
          >
            <option value="all">全部来源</option>
            <option value="video-gen">视频生成</option>
            <option value="image-gen">图片生成</option>
            <option value="system">系统</option>
            <option value="user-action">用户操作</option>
          </select>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          共 {filteredLogs.length} 条日志，当前第 {currentPage}/{totalPages || 1} 页
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">时间</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">级别</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">来源</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">消息</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${levelMap[log.level]?.className}`}>
                      {levelMap[log.level]?.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sourceMap[log.source]?.className}`}>
                      {sourceMap[log.source]?.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-gray-900 dark:text-gray-100 truncate max-w-[400px]">{log.message}</td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => setDetailLog(log)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      <Eye size={12} />
                      详情
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-30" />
                    暂无日志记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              显示 {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} / 共 {filteredLogs.length} 条
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary-500 text-white'
                      : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDetailLog(null)}>
          <div className="card w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">日志详情</h3>
              <button
                onClick={() => setDetailLog(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">时间</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{detailLog.timestamp}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">来源</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{sourceMap[detailLog.source]?.label}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${levelMap[detailLog.level]?.className}`}>
                  {levelMap[detailLog.level]?.label}
                </span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">消息</p>
                <p className="text-gray-900 dark:text-gray-100">{detailLog.message}</p>
              </div>
              {detailLog.details && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">详细信息</p>
                  <pre className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {detailLog.details}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
