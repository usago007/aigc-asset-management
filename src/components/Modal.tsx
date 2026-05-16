import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
  children: React.ReactNode
  width?: string
}

export default function Modal({ title, isOpen, onClose, onSave, children, width = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-50 w-full ${width} bg-gray-900 border border-gray-700 rounded-xl shadow-2xl animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-display font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          {onSave && <button className="btn-primary" onClick={onSave}>保存</button>}
        </div>
      </div>
    </div>
  )
}
