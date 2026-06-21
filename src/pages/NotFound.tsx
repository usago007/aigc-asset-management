import { ArrowLeft, Compass, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <section className="page-enter mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-[1180px] items-center">
      <div className="relative w-full overflow-hidden rounded-[32px] border border-gray-200 bg-gray-950 px-6 py-16 text-white shadow-[0_32px_100px_rgba(15,23,42,.18)] sm:px-10 lg:px-16 lg:py-24 dark:border-gray-800">
        <div className="dashboard-lab-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl">
          <p className="dashboard-live-label"><Sparkles size={13} /> NAVIGATION SIGNAL · 404</p>
          <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[.86] tracking-[-.075em]">这个坐标<br />没有内容</h1>
          <p className="mt-7 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">链接可能已失效，或当前记录不在可访问范围。返回上一页继续工作，或前往图片创作工作台。</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)} className="gap-2 border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white"><ArrowLeft size={16} /> 返回上一页</Button>
            <Button onClick={() => navigate('/content/image-generation')} className="gap-2 bg-emerald-300 text-gray-950 hover:bg-emerald-200 dark:bg-emerald-300 dark:text-gray-950"><Compass size={16} /> 前往创作工作台</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
