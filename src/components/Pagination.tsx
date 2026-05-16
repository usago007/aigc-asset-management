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
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>共 {totalItems} 条</span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          上一页
        </button>
        {pages.map((page, index) => (
          typeof page === 'string' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-600">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded text-sm transition-colors ${
                page === currentPage ? 'bg-accent-500 text-white' : 'hover:bg-gray-800'
              }`}
            >
              {page}
            </button>
          )
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          下一页
        </button>
      </div>
    </div>
  )
}
