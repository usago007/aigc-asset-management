import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'

interface PaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export default function Pagination({ currentPage, pageSize, totalItems, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  pages.push(1)
  
  if (currentPage > 3) pages.push('...')
  
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i)
  }
  
  if (currentPage < totalPages - 2) pages.push('...')
  
  if (totalPages > 1) pages.push(totalPages)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-500">
        <span>共 {totalItems} 条记录</span>
        {onPageSizeChange && (
          <NativeSelect
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-9 min-w-[96px] px-2 py-1 text-sm"
            wrapperClassName="w-auto"
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </NativeSelect>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
          className="gap-1"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">上一页</span>
        </Button>
        {pages.map((page, index) => (
          typeof page === 'string' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
          ) : (
            <Button
              key={page}
              onClick={() => onPageChange(page)}
              variant={page === currentPage ? 'default' : 'secondary'}
              size="icon"
              className={page === currentPage ? 'shadow-md shadow-primary-500/30' : ''}
            >
              {page}
            </Button>
          )
        ))}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
          className="gap-1"
        >
          <span className="hidden sm:inline">下一页</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
