"use client"

import { useEffect } from "react"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { removeNotif } from "@/store/actions"
import { cn } from "@/lib/utils"

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-warning/40 bg-warning/15 text-warning-foreground",
  info: "border-info/30 bg-info/10 text-info",
}

function ToastItem({ id, message, variant }: { id: string; message: string; variant: keyof typeof ICONS }) {
  const dispatch = useAppDispatch()
  const Icon = ICONS[variant]

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeNotif(id)), 4000)
    return () => clearTimeout(t)
  }, [id, dispatch])

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg animate-in slide-in-from-right-5",
        STYLES[variant],
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p className="flex-1 text-sm font-medium text-card-foreground">{message}</p>
      <button
        onClick={() => dispatch(removeNotif(id))}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Fermer la notification"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const notifs = useAppSelector((s) => s.notifs)
  if (notifs.length === 0) return null
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {notifs.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <ToastItem id={n.id} message={n.message} variant={n.variant} />
        </div>
      ))}
    </div>
  )
}
