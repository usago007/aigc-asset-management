import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, Sparkles, Image, Video, Users, Headphones, PersonStanding } from 'lucide-react'

interface CreationTypeOption {
  id: string
  label: string
  icon: ReactNode
  description?: string
  subOptions?: CreationTypeOption[]
}

interface CreationTypeMenuProps {
  options: CreationTypeOption[]
  value: string
  onChange: (value: string) => void
}

export default function CreationTypeMenu({ options, value, onChange }: CreationTypeMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.id === value)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  const renderOption = (option: CreationTypeOption, depth = 0) => (
    <button
      key={option.id}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
        value === option.id
          ? 'bg-gray-100 text-gray-950 dark:bg-gray-800 dark:text-gray-50'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
      style={{ paddingLeft: `${depth * 12 + 12}px` }}
      onClick={() => handleSelect(option.id)}
    >
      {option.icon}
        <div className="flex-1 min-w-0">
        <div className="panel-value font-medium">{option.label}</div>
        {option.description && (
          <div className="helper-text truncate">{option.description}</div>
        )}
      </div>
      {value === option.id && (
        <div className="h-1.5 w-1.5 rounded-full bg-gray-950 dark:bg-white" />
      )}
    </button>
  )

  return (
    <div ref={ref} className="relative">
      <button
        className="helper-text flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-gray-50"
        onClick={() => setOpen(!open)}
      >
        {selected?.icon}
        <span>{selected?.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-0.5">
            {options.map((option) => {
              if (option.subOptions) {
                return (
                  <div key={option.id}>
                    <div className="field-label px-3 py-1">{option.label}</div>
                    {option.subOptions.map((sub) => renderOption(sub, 1))}
                  </div>
                )
              }
              return renderOption(option)
            })}
          </div>
        </div>
      )}
    </div>
  )
}
