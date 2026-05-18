import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white transition-all duration-200 placeholder:text-gray-400 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/10 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:ring-offset-gray-900 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus-visible:ring-white/10",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
