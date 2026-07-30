"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { useCollection } from "@/lib/use-api"
import type { Mouvement, Depot } from "@/lib/types"
import { ArrowRight, ArrowDownToLine, ArrowUpFromLine, Shuffle, SlidersHorizontal } from "lucide-react"

const typeConfig: Record<Mouvement["type"], { label: string; className: string; icon: typeof Shuffle }> = {
  entree: { label: "Entrée", className: "bg-success/15 text-success", icon: ArrowDownToLine },
  sortie: { label: "Sortie", className: "bg-info/15 text-info", icon: ArrowUpFromLine },
  transfert: { label: "Transfert", className: "bg-primary/10 text-primary", icon: Shuffle },
  ajustement: { label: "Ajustement", className: "bg-warning/20 text-warning-foreground", icon: SlidersHorizontal },
}

export default function MouvementsPage() {
  const { data: mouvements } = useCollection<Mouvement>("mouvements")
  const { data: depots } = useCollection<Depot>("depots")

  const columns: Column<Mouvement>[] = [
    { key: "date", header: "Date", render: (r) => <span className="tabular-nums">{r.date}</span> },
    { key: "heure", header: "Heure", render: (r) => <span className="tabular-nums text-muted-foreground">{r.heure}</span> },
    { key: "awb", header: "AWB", render: (r) => <span className="font-mono text-xs">{r.awb}</span> },
    { key: "colis", header: "Colis", render: (r) => <span className="font-medium">{r.colis}</span> },
    {
      key: "type",
      header: "Type",
      render: (r) => {
        const cfg = typeConfig[r.type]
        const Icon = cfg.icon
        return (
          <Badge className={`gap-1 border-transparent ${cfg.className}`}>
            <Icon className="size-3" />
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      key: "trajet",
      header: "Trajet",
      render: (r) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-muted-foreground">{r.ancienEmplacement}</span>
          <ArrowRight className="size-3 text-muted-foreground" />
          <span className="font-medium">{r.nouvelEmplacement}</span>
        </div>
      ),
    },
    { key: "zone", header: "Zone", render: (r) => <span className="text-muted-foreground">{r.zone}</span> },
    { key: "utilisateur", header: "Utilisateur" },
  ]

  return (
    <div>
      <PageHeader
        title="Mouvements de Stock"
        description="Historique des entrées, sorties, transferts et ajustements."
        breadcrumb={[{ label: "Opérations" }, { label: "Mouvements" }]}
      />

      <DataTable
        columns={columns}
        data={mouvements}
        searchKeys={["awb", "colis", "utilisateur", "ancienEmplacement", "nouvelEmplacement"]}
        searchPlaceholder="Rechercher par AWB, colis, utilisateur..."
        filters={[
          {
            key: "type",
            label: "Type",
            options: [
              { value: "entree", label: "Entrée" },
              { value: "sortie", label: "Sortie" },
              { value: "transfert", label: "Transfert" },
              { value: "ajustement", label: "Ajustement" },
            ],
          },
          { key: "depot", label: "Dépôt", options: depots.map((d) => ({ value: d.nom, label: d.nom })) },
        ]}
        pageSize={10}
        emptyMessage="Aucun mouvement enregistré."
      />
    </div>
  )
}
