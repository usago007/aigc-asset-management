import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
  children: React.ReactNode
  width?: string
  description?: string
}

export default function Modal({ title, isOpen, onClose, onSave, children, width = 'max-w-lg', description }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(width)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto py-2 pr-1">
          {children}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>{onSave ? '取消' : '关闭'}</Button>
          {onSave && <Button onClick={onSave}>保存</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
