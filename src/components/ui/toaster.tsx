"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="relative">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
            {/* Auto-close progress indicator */}
            <div className="absolute bottom-0 left-0 h-1 bg-gray-200 rounded-full w-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full animate-shrink"
                style={{
                  animation: `shrink 2000ms linear forwards`
                }}
              />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastProvider>
  )
}
