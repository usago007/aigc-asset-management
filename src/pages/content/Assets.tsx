import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Search, FileText, Play, Image as ImageIcon, Maximize2, X } from 'lucide-react'
import type { Asset, AssetStatus } from '@/types'

const statusMap: Record<AssetStatus, { label: string; variant: 'info' | 'warning' | 'success' }> = {
  Draft: { label: '草稿', variant: 'info' },
  Final: { label: '终稿', variant: 'warning' },
  Approved: { label: '已审核', variant: 'success' },
}

const ASSET_PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/asset1/100/100',
  'https://picsum.photos/seed/asset2/100/100',
  'https://picsum.photos/seed/asset3/100/100',
  'https://picsum.photos/seed/asset4/100/100',
  'https://picsum.photos/seed/asset5/100/100',
]

const VIDEO_PLACEHOLDER = 'https://picsum.photos/seed/video/100/100'

export default function Assets() {
  const { assets, shots, addAsset, updateAsset, deleteAsset } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Asset | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<AssetStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const pageSize = 10

  const [formData, setFormData] = useState({
    assetName: '', type: 'Image' as 'Image' | 'Video' | 'Script', shotId: '', promptId: '', modelName: '', modelVersion: '', parentAssetIds: [] as string[], status: 'Draft' as AssetStatus, fileUrl: '',
  })

  const filteredItems = useMemo(() => assets.filter(asset => asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) && (typeFilter === 'all' || asset.status === typeFilter)), [assets, searchQuery, typeFilter])
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Asset) => {
    if (item) { setEditingItem(item); setFormData({ assetName: item.assetName, type: item.type, shotId: item.shotId, promptId: item.promptId, modelName: item.modelName, modelVersion: item.modelVersion, parentAssetIds: item.parentAssetIds, status: item.status, fileUrl: item.fileUrl }) }
    else { setEditingItem(null); setFormData({ assetName: '', type: 'Image', shotId: '', promptId: '', modelName: '', modelVersion: '', parentAssetIds: [], status: 'Draft', fileUrl: '' }) }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.assetName) { showToast('error', '请输入资产名称'); return }
    if (editingItem) { updateAsset(editingItem.id, formData); showToast('success', '更新成功') }
    else { addAsset(formData as Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>); showToast('success', '创建成功') }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => { if (window.confirm('确定要删除吗？')) { deleteAsset(id); showToast('success', '删除成功') } }
  const getShotName = (shotId: string) => shots.find(s => s.id === shotId)?.shotName || '-'

  const getAssetThumbnail = (asset: Asset) => {
    if (asset.fileUrl) {
      if (asset.fileUrl.startsWith('http')) return asset.fileUrl
      if (asset.type === 'Video') return VIDEO_PLACEHOLDER
      if (asset.type === 'Image') {
        const hash = asset.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        return ASSET_PLACEHOLDER_IMAGES[hash % ASSET_PLACEHOLDER_IMAGES.length]
      }
    }
    if (asset.type === 'Video') return VIDEO_PLACEHOLDER
    const hash = asset.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return ASSET_PLACEHOLDER_IMAGES[hash % ASSET_PLACEHOLDER_IMAGES.length]
  }

  const isClickableMedia = (asset: Asset) => asset.type === 'Image' || asset.type === 'Video'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">资产管理</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">管理所有生成资产</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建资产</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input placeholder="搜索资产名称..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
        <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val as any); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="全部状态" /></SelectTrigger>
          <SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="Draft">草稿</SelectItem><SelectItem value="Final">终稿</SelectItem><SelectItem value="Approved">已审核</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">缩略图</th>
              <th className="table-header">资产名称</th>
              <th className="table-header">类型</th>
              <th className="table-header">所属镜头</th>
              <th className="table-header">AI模型</th>
              <th className="table-header">状态</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(asset => {
              const thumbnail = getAssetThumbnail(asset)
              const clickable = isClickableMedia(asset)

              return (
                <tr key={asset.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="table-cell">
                    <div
                      className={`relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ${clickable ? 'cursor-pointer' : ''}`}
                      onClick={() => { if (clickable && thumbnail) setPreviewUrl(thumbnail) }}
                    >
                      <img
                        src={thumbnail}
                        alt={asset.assetName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {asset.type === 'Video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play size={12} className="text-white" />
                        </div>
                      )}
                      {asset.type === 'Script' && (
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{asset.assetName}</td>
                  <td className="table-cell"><Badge variant={asset.type === 'Image' ? 'info' : asset.type === 'Video' ? 'success' : 'warning'}>{asset.type === 'Image' ? '图片' : asset.type === 'Video' ? '视频' : '脚本'}</Badge></td>
                  <td className="table-cell">{getShotName(asset.shotId)}</td>
                  <td className="table-cell">{asset.modelName} {asset.modelVersion}</td>
                  <td className="table-cell"><Badge variant={statusMap[asset.status].variant}>{statusMap[asset.status].label}</Badge></td>
                  <td className="table-cell text-gray-600 dark:text-gray-500">{formatDate(asset.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(asset)}><Edit2 size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}><Trash2 size={14} className="text-error" /></Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-600 dark:text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑资产' : '创建资产'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2"><Label>资产名称 *</Label><Input value={formData.assetName} onChange={(e) => setFormData({ ...formData, assetName: e.target.value })} placeholder="输入资产名称" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>类型</Label><Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Image">图片</SelectItem><SelectItem value="Video">视频</SelectItem><SelectItem value="Script">脚本</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>状态</Label><Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Draft">草稿</SelectItem><SelectItem value="Final">终稿</SelectItem><SelectItem value="Approved">已审核</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>所属镜头</Label><Select value={formData.shotId || 'none'} onValueChange={(val) => setFormData({ ...formData, shotId: val === 'none' ? '' : val })}><SelectTrigger><SelectValue placeholder="选择镜头" /></SelectTrigger><SelectContent><SelectItem value="none">选择镜头</SelectItem>{shots.map(s => <SelectItem key={s.id} value={s.id}>{s.shotName}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>AI模型</Label><Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} /></div>
            <div className="space-y-2"><Label>模型版本</Label><Input value={formData.modelVersion} onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>文件路径/URL</Label><Input value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="如：/assets/video.mp4" /></div>
        </div>
      </Modal>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewUrl}
              alt="预览"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute -top-3 -right-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-lg transition-colors"
              onClick={() => setPreviewUrl(null)}
            >
              <X size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
