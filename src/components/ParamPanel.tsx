import { useState, type ReactNode } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'

interface ParamSection {
  id: string
  label: string
  icon?: ReactNode
  children: ReactNode
}

interface ParamPanelProps {
  title?: string
  sections: ParamSection[]
  defaultExpanded?: boolean
}

export default function ParamPanel({
  title = '高级参数',
  sections,
  defaultExpanded = true,
}: ParamPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-accent-500/20 dark:border-accent-500/30 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
          {sections.length > 0 && (
            <span className="text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-500/20 px-2 py-0.5 rounded-full">
              {sections.length} 项
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-accent-500" />
        ) : (
          <ChevronDown size={16} className="text-accent-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-accent-500/20 dark:border-accent-500/30">
          {sections.map((section) => (
            <div key={section.id} className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              {section.icon && (
                <div className="flex items-center gap-2 mb-3">
                  {section.icon}
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{section.label}</span>
                </div>
              )}
              <div>{section.children}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
