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
          <Toast key={id} {...props} className="relative min-w-[280px] max-w-[320px]">
            <div className="flex items-start gap-2">
              {/* Success Icon */}
              <div className="flex-shrink-0 w-4 h-4 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {title && <ToastTitle className="text-green-900">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-green-700">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
            {/* Auto-close progress indicator */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-green-200 rounded-full w-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full animate-shrink"
                style={{
                  animation: `shrink 3000ms linear forwards`
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
