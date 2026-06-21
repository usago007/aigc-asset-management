import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ConfirmOptions = {
  title?: string
  description: string
  confirmLabel?: string
  tone?: 'default' | 'danger'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((nextOptions) => {
    resolver.current?.(false)
    setOptions(nextOptions)
    return new Promise<boolean>((resolve) => { resolver.current = resolve })
  }, [])

  const resolve = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setOptions(null)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={Boolean(options)} onOpenChange={(open) => !open && resolve(false)}>
        <AlertDialogContent className="rounded-[24px] border-gray-200 bg-white p-0 shadow-[0_32px_100px_rgba(15,23,42,.2)] dark:border-gray-800 dark:bg-gray-900">
          <AlertDialogHeader className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <p className="eyebrow">需要确认</p>
            <AlertDialogTitle className="mt-2 text-xl tracking-[-0.03em]">{options?.title ?? '确认此操作'}</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 leading-6">{options?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-5">
            <AlertDialogCancel onClick={() => resolve(false)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resolve(true)}
              className={options?.tone === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700' : ''}
            >
              {options?.confirmLabel ?? '确认'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider')
  return context
}
