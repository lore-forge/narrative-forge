import * as React from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export function useToast() {
  const toast = React.useCallback((props: ToastProps) => {
    // Simple console log for now - in a real app this would show a toast
    console.log('Toast:', props)
  }, [])

  return { toast }
}