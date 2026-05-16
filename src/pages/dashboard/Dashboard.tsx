import { useAppStore } from '@/store/appStore'
import { Users, Tags, FolderTree, Video, Image, ClipboardCheck } from 'lucide-react'

export default function Dashboard() {
  const { customers, brands, projects, shots, assets, reviews } = useAppStore()

  const pendingReviews = reviews.filter(r => r.status === 'Pending').length
  const completedProjects = projects.filter(p => p.stage === 'Completed').length

  const stats = [
    { label: '客户', value: customers.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: '品牌', value: brands.length, icon: Tags, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: '项目', value: projects.length, icon: FolderTree, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: '镜头', value: shots.length, icon: Video, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: '资产', value: assets.length, icon: Image, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: '待审核', value: pendingReviews, icon: ClipboardCheck, color: 'text-accent-500', bg: 'bg-accent-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-100">仪表盘</h1>
        <p className="text-gray-500 mt-1">AIGC数字资产管理系统概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">项目进度</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map(project => (
              <div key={project.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{project.projectName}</span>
                  <span className="text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">近期审核</h2>
          <div className="space-y-3">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm text-gray-300">{review.reviewer}</p>
                  <p className="text-xs text-gray-500">{review.reviewType === 'Internal' ? '内部审核' : '客户审核'}</p>
                </div>
                <span className={`badge ${
                  review.status === 'Approved' ? 'badge-success' :
                  review.status === 'Rejected' ? 'badge-error' : 'badge-warning'
                }`}>
                  {review.status === 'Approved' ? '通过' : review.status === 'Rejected' ? '拒绝' : '待审核'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
