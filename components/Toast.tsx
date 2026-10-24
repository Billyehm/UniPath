'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss])

  return <div className="selection-toast" role="alert"><span>{message}</span><button type="button" aria-label="Dismiss" onClick={onDismiss}><X /></button></div>
}
