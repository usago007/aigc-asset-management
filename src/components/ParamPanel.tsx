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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-gray-800 dark:bg-gray-900">
      <button
        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="panel-title">{title}</span>
          {sections.length > 0 && (
            <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 helper-text font-medium dark:border-gray-700 dark:bg-gray-800">
              {sections.length} 项
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          {sections.map((section) => (
            <div key={section.id} className="border-b border-gray-100 px-5 py-5 last:border-b-0 dark:border-gray-800">
              {section.icon && (
                <div className="flex items-center gap-2 mb-3">
                  {section.icon}
                  <span className="panel-title">{section.label}</span>
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
