import * as React from "react"
import { type ButtonProps, Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ActionTone = "default" | "danger"

interface ActionIconButtonProps extends Omit<ButtonProps, "size" | "variant"> {
  tone?: ActionTone
}

function ActionIconButton({
  className,
  tone = "default",
  ...props
}: ActionIconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 rounded-xl border border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        tone === "danger" && "text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300",
        className
      )}
      {...props}
    />
  )
}

export { ActionIconButton }
