import { useEffect, useState } from 'react'
import { getToasts, subscribeToToastUpdates, removeToast } from '@/utils/toast'
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: AlertCircle,
}

const colorMap = {
  success: 'bg-success/20 border-success/50 text-success',
  error: 'bg-error/20 border-error/50 text-error',
  warning: 'bg-warning/20 border-warning/50 text-warning',
  info: 'bg-info/20 border-info/50 text-info',
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState(getToasts())

  useEffect(() => {
    return subscribeToToastUpdates(() => setToasts(getToasts()))
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur animate-slide-in ${colorMap[toast.type]}`}
          >
            <Icon size={18} />
            <span className="text-sm">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
