import { useState, useRef, useCallback } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { showToast } from '@/utils/toast'

const MAX_FILE_SIZE = 4700000
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

interface ImageUploaderProps {
  label: string
  value: string | null
  onChange: (base64: string | null) => void
  aspectRatio: number | null
  onAspectRatioChange: (ratio: number | null) => void
}

function formatAspectRatio(ratio: number): string {
  const ratios = [
    [16, 9],
    [9, 16],
    [4, 3],
    [3, 4],
    [1, 1],
  ]

  for (const [w, h] of ratios) {
    if (Math.abs(ratio - w / h) < 0.01) {
      return `${w}:${h}`
    }
  }

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const num = Math.round(ratio * 100)
  const den = 100
  const divisor = gcd(num, den)
  return `${num / divisor}:${den / divisor}`
}

export default function ImageUploader({ label, value, onChange, aspectRatio, onAspectRatioChange }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('仅支持 JPEG/PNG 格式')
        showToast('error', '仅支持 JPEG/PNG 格式')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('文件大小超过 4.7MB 限制')
        showToast('error', '文件大小超过 4.7MB 限制')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          const ratio = img.width / img.height
          onChange(base64)
          onAspectRatioChange(ratio)
        }
        img.onerror = () => {
          setError('图片加载失败')
          showToast('error', '图片加载失败')
        }
        img.src = base64
      }
      reader.onerror = () => {
        setError('文件读取失败')
        showToast('error', '文件读取失败')
      }
      reader.readAsDataURL(file)
    },
    [onChange, onAspectRatioChange],
  )

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleRemove = () => {
    onChange(null)
    onAspectRatioChange(null)
    setError(null)
  }

  return (
    <div className="space-y-2">
      <label className="label-field">{label}</label>

      {value ? (
        <div className="relative card p-2">
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 z-10 p-1 bg-gray-900/80 rounded-full hover:bg-gray-900 transition-colors"
          >
            <X size={16} />
          </button>
          <img src={value} alt={label} className="w-full h-auto rounded-lg" />
          {aspectRatio && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                宽高比: {formatAspectRatio(aspectRatio)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`card flex flex-col items-center justify-center py-8 cursor-pointer transition-colors ${
            dragOver ? 'border-accent-500 bg-accent-500/10' : 'hover:border-gray-600'
          }`}
        >
          <UploadCloud size={32} className="text-gray-400 mb-3" />
          <p className="text-sm text-gray-300 mb-1">点击或拖拽上传图片</p>
          <p className="text-xs text-gray-500">支持 JPEG/PNG，最大 4.7MB</p>
        </div>
      )}

      {error && <p className="text-error text-xs">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
