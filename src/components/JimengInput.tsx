import { useState, useRef, useCallback, type ReactNode } from 'react'
import { ImagePlus, Paperclip, Mic, Send, X } from 'lucide-react'

interface JimengInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  maxChars?: number
  leftActions?: ReactNode
  bottomActions?: ReactNode
  imageUpload?: {
    images: { url: string; base64: string }[]
    maxImages: number
    onUpload: (files: FileList | null) => void
    onRemove: (index: number) => void
  }
  videoUpload?: {
    video: { url: string; base64: string } | null
    onUpload: (file: File | null) => void
    onRemove: () => void
  }
  showVoice?: boolean
}

export default function JimengInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = '输入想法、剧本或上传参考，支持 "/" 使用技能',
  maxChars = 800,
  leftActions,
  bottomActions,
  imageUpload,
  videoUpload,
  showVoice = true,
}: JimengInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onSubmit()
      }
    },
    [onSubmit],
  )

  const hasValue = value.trim().length > 0
  const hasImages = imageUpload && imageUpload.images.length > 0
  const hasVideo = videoUpload && videoUpload.video !== null

  return (
    <div className="relative">
      <div
        className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm ${
          isFocused
            ? 'border-accent-500 shadow-md shadow-accent-500/15 ring-1 ring-accent-500/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-accent-500'
        }`}
      >
        {/* Image preview strip */}
        {hasImages && (
          <div className="flex gap-2 p-3 pb-0">
            {imageUpload!.images.map((img, idx) => (
              <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 dark:bg-gray-700 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  onClick={() => imageUpload!.onRemove(idx)}
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {imageUpload!.images.length < imageUpload!.maxImages && (
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 flex items-center justify-center cursor-pointer transition-colors bg-gray-50 dark:bg-gray-800">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => imageUpload!.onUpload(e.target.files)}
                  multiple={imageUpload!.maxImages > 1}
                />
                <ImagePlus size={18} className="text-gray-500 dark:text-gray-400" />
              </label>
            )}
          </div>
        )}

        {/* Video preview */}
        {hasVideo && (
          <div className="relative group w-24 h-16 mx-3 mt-2 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
            <video src={videoUpload!.video!.url} className="w-full h-full object-cover" muted />
            <button
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 dark:bg-gray-700 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              onClick={videoUpload!.onRemove}
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        )}

        {/* Textarea area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full px-4 pt-4 pb-16 bg-transparent text-gray-900 dark:text-gray-100 text-[15px] leading-relaxed resize-none outline-none placeholder:text-gray-400"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            rows={3}
            maxLength={maxChars}
          />

          {/* Bottom toolbar */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {leftActions || (
                <>
                  {imageUpload && (
                    <label className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group" title="上传图片">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => imageUpload.onUpload(e.target.files)}
                        multiple={imageUpload.maxImages > 1}
                      />
                      <ImagePlus size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-accent-500 transition-colors" />
                    </label>
                  )}
                  {videoUpload && !videoUpload.video && (
                    <label className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group" title="上传视频">
                      <input
                        type="file"
                        accept="video/mp4"
                        className="hidden"
                        onChange={(e) => videoUpload.onUpload(e.target.files?.[0] || null)}
                      />
                      <Paperclip size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-accent-500 transition-colors" />
                    </label>
                  )}
                </>
              )}
              {bottomActions}
            </div>

            <div className="flex items-center gap-1">
              <span className={`text-xs mr-2 font-medium ${value.length > maxChars * 0.9 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {value.length}/{maxChars}
              </span>
              {showVoice && (
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  title="语音输入"
                  disabled={disabled}
                >
                  <Mic size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-accent-500 transition-colors" />
                </button>
              )}
              <button
                className={`p-2 rounded-lg transition-all font-medium ${
                  hasValue && !disabled
                    ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/25'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
                onClick={onSubmit}
                disabled={!hasValue || disabled}
                title="提交生成"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
