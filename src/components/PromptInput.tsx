import { AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PromptInputProps {
  value: string
  onChange: (val: string) => void
  maxLength?: number
}

export default function PromptInput({ value, onChange, maxLength = 800 }: PromptInputProps) {
  const [charCount, setCharCount] = useState(value.length)

  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  const isWarning = charCount > 400 && charCount <= maxLength
  const isError = charCount > maxLength
  const countColor = isError ? 'text-error' : isWarning ? 'text-warning' : 'text-gray-500'

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入视频生成提示词...&#10;&#10;提示：&#10;- 描述场景、主体、动作和氛围&#10;- 使用具体的形容词和动词&#10;- 建议长度 50-400 字"
          className={`input-field min-h-[120px] resize-y ${
            isError ? 'border-error focus:ring-error' : ''
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={isWarning && !isError ? 'text-warning flex items-center gap-1' : 'text-gray-500'}>
          {isWarning && !isError && <AlertCircle size={12} />}
          {isWarning && !isError && '提示：建议控制在 400 字以内'}
        </span>
        <span className={countColor}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  )
}
