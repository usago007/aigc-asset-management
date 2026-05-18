import { useState } from 'react'
import { FileText, Download, Search, Eye, X } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { matchesKeyword } from '@/utils/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import Pagination from '@/components/Pagination'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'

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
  error: { label: '错误', className: 'badge-error' },
  warning: { label: '警告', className: 'badge-warning' },
  info: { label: '信息', className: 'badge-info' },
  debug: { label: '调试', className: 'badge-secondary' },
}

const sourceMap: Record<string, { label: string; className: string }> = {
  'video-gen': { label: '视频生成', className: 'badge-secondary' },
  'image-gen': { label: '图片生成', className: 'badge-success' },
  system: { label: '系统', className: 'badge-info' },
  'user-action': { label: '用户操作', className: 'badge-warning' },
}

const ITEMS_PER_PAGE = 10

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [detailFilter, setDetailFilter] = useState<'all' | 'with-details' | 'without-details'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailLog, setDetailLog] = useState<LogEntry | null>(null)

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false
    if (filterSource !== 'all' && log.source !== filterSource) return false
    if (detailFilter === 'with-details' && !log.details) return false
    if (detailFilter === 'without-details' && log.details) return false
    if (!matchesKeyword(searchQuery, [log.message, log.details, log.timestamp, levelMap[log.level]?.label, sourceMap[log.source]?.label])) return false
    return true
  })

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
    <PageShell>
      <PageIntro
        title="全局日志"
        actions={<div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2" onClick={handleExport}>
            <Download size={14} />
            导出日志
          </Button>
        </div>}
      />

      <PageSection className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              placeholder="搜索日志消息或详细信息..."
              className="pl-10"
            />
          </div>
          <div>
            <NativeSelect
              value={filterLevel}
              onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1) }}
            >
              <option value="all">全部级别</option>
              <option value="error">错误</option>
              <option value="warning">警告</option>
              <option value="info">信息</option>
              <option value="debug">调试</option>
            </NativeSelect>
          </div>
          <div>
            <NativeSelect
              value={filterSource}
              onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1) }}
            >
              <option value="all">全部来源</option>
              <option value="video-gen">视频生成</option>
              <option value="image-gen">图片生成</option>
              <option value="system">系统</option>
              <option value="user-action">用户操作</option>
            </NativeSelect>
          </div>
          <div>
            <NativeSelect
              value={detailFilter}
              onChange={(e) => { setDetailFilter(e.target.value as typeof detailFilter); setCurrentPage(1) }}
            >
              <option value="all">全部详情状态</option>
              <option value="with-details">包含详情</option>
              <option value="without-details">仅主消息</option>
            </NativeSelect>
          </div>
        </div>

        <p className="filter-meta">
          共 {filteredLogs.length} 条日志，当前第 {currentPage}/{totalPages || 1} 页
        </p>

        <div className="card overflow-x-auto p-0 shadow-none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="table-header !px-2">时间</th>
                <th className="table-header !px-2">级别</th>
                <th className="table-header !px-2">来源</th>
                <th className="table-header !px-2">消息</th>
                <th className="table-header !px-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                  <td className="px-2 py-2.5 whitespace-nowrap body-muted">{log.timestamp}</td>
                  <td className="py-2.5 px-2">
                    <span className={`badge ${levelMap[log.level]?.className}`}>
                      {levelMap[log.level]?.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`badge ${sourceMap[log.source]?.className}`}>
                      {sourceMap[log.source]?.label}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 max-w-[400px] truncate body-text text-gray-900 dark:text-gray-100">{log.message}</td>
                  <td className="py-2.5 px-2 text-right">
                    <Button
                      onClick={() => setDetailLog(log)}
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Eye size={12} />
                      详情
                    </Button>
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center meta-text">
                    <FileText size={32} className="mx-auto mb-2 opacity-30" />
                    暂无日志记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} pageSize={ITEMS_PER_PAGE} totalItems={filteredLogs.length} onPageChange={setCurrentPage} />
      </PageSection>

      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm" onClick={() => setDetailLog(null)}>
          <div className="page-section w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-lg">日志详情</h3>
              <Button
                onClick={() => setDetailLog(null)}
                variant="ghost"
                size="icon"
              >
                <X size={16} className="text-gray-500" />
              </Button>
            </div>
            <ReadOnlySection>
              <ReadOnlyField label="时间" value={detailLog.timestamp} />
              <ReadOnlyField label="来源" value={<span className={`badge ${sourceMap[detailLog.source]?.className}`}>{sourceMap[detailLog.source]?.label}</span>} />
              <ReadOnlyField label="级别" value={<span className={`badge ${levelMap[detailLog.level]?.className}`}>{levelMap[detailLog.level]?.label}</span>} />
              <ReadOnlyField label="消息" value={detailLog.message} />
              <ReadOnlyField label="详细信息" value={detailLog.details} span="full" />
            </ReadOnlySection>
          </div>
        </div>
      )}
    </PageShell>
  )
}
