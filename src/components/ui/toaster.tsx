import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, message, type, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              <ToastTitle>{type.toUpperCase()}</ToastTitle>
              <ToastDescription>{message}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
