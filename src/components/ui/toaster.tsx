import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-900 group-[.toaster]:text-gray-100 group-[.toaster]:border-gray-700 group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-gray-500 group-[.dark .toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-primary-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-800 group-[.toast]:text-gray-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
