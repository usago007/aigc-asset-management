import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:shadow-[0_12px_32px_rgba(15,23,42,0.08)] dark:group-[.toaster]:border-gray-800 dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-gray-100",
          description: "group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-gray-950 group-[.toast]:text-white dark:group-[.toast]:bg-white dark:group-[.toast]:text-gray-950",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
