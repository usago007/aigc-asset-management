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
          ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
      style={{ paddingLeft: `${depth * 12 + 12}px` }}
      onClick={() => handleSelect(option.id)}
    >
      {option.icon}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{option.label}</div>
        {option.description && (
          <div className="text-xs text-gray-400 truncate">{option.description}</div>
        )}
      </div>
      {value === option.id && (
        <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
      )}
    </button>
  )

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {selected?.icon}
        <span>{selected?.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50">
          <div className="space-y-0.5">
            {options.map((option) => {
              if (option.subOptions) {
                return (
                  <div key={option.id}>
                    <div className="px-3 py-1 text-xs text-gray-400 font-medium">{option.label}</div>
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
