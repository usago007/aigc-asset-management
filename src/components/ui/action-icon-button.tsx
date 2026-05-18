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
        "h-8 w-8 rounded-lg",
        tone === "danger" && "text-error hover:bg-red-50 hover:text-error dark:hover:bg-red-900/20",
        className
      )}
      {...props}
    />
  )
}

export { ActionIconButton }
