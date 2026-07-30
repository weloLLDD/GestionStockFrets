import { cn } from "@/lib/utils"

interface CapacityBarProps {
  value: number
  max: number
  showLabel?: boolean
}

export function CapacityBar({ value, max, showLabel = true }: CapacityBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const tone =
    pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success"

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="w-9 text-xs tabular-nums text-muted-foreground">{pct}%</span>}
    </div>
  )
}
