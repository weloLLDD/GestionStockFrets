import { cn } from "@/lib/utils"

const STYLES: Record<string, { label: string; className: string }> = {
  // Statuts entrées / stock
  en_stock: { label: "En stock", className: "bg-success/15 text-success border-success/30" },
  en_attente: { label: "En attente", className: "bg-warning/20 text-warning-foreground border-warning/40" },
  sorti: { label: "Sorti", className: "bg-muted text-muted-foreground border-border" },
  bloque: { label: "Bloqué", className: "bg-destructive/15 text-destructive border-destructive/30" },
  // Statuts sorties
  validee: { label: "Validée", className: "bg-success/15 text-success border-success/30" },
  annulee: { label: "Annulée", className: "bg-destructive/15 text-destructive border-destructive/30" },
  // Statuts génériques
  actif: { label: "Actif", className: "bg-success/15 text-success border-success/30" },
  inactif: { label: "Inactif", className: "bg-muted text-muted-foreground border-border" },
  // Statuts inventaire
  en_cours: { label: "En cours", className: "bg-info/15 text-info border-info/30" },
  termine: { label: "Terminé", className: "bg-success/15 text-success border-success/30" },
  planifie: { label: "Planifié", className: "bg-warning/20 text-warning-foreground border-warning/40" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = STYLES[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {config.label}
    </span>
  )
}
