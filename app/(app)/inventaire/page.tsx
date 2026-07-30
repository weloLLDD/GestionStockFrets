"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { CapacityBar } from "@/components/shared/capacity-bar"
import { StatCard } from "@/components/shared/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InventaireFormDialog } from "@/components/inventaire/inventaire-form-dialog"
import { InventaireDetailDialog } from "@/components/inventaire/inventaire-detail-dialog"
import { useCollection } from "@/lib/use-api"
import { api } from "@/lib/api-client"
import type { SessionInventaire, Depot, StockItem } from "@/lib/types"
import { ClipboardCheck, Clock, CheckCircle2, AlertTriangle, Plus, Eye } from "lucide-react"

const statutConfig: Record<SessionInventaire["statut"], { label: string; className: string }> = {
  en_cours: { label: "En cours", className: "bg-info/15 text-info" },
  termine: { label: "Terminé", className: "bg-success/15 text-success" },
  planifie: { label: "Planifié", className: "bg-warning/15 text-warning" },
}

export default function InventairePage() {
  const { data: sessionsInventaire, mutate } = useCollection<SessionInventaire>("inventaire")
  const { data: depots } = useCollection<Depot>("depots")
  const { data: stocks } = useCollection<StockItem>("stocks")

  const [formOpen, setFormOpen] = useState(false)
  const [detailSession, setDetailSession] = useState<SessionInventaire | null>(null)

  const handleSubmit = async (data: Omit<SessionInventaire, "id">) => {
    try {
      await api.create("inventaire", data)
      await mutate()
    } catch (e) {
      console.log("[v0] createInventaire:", (e as Error).message)
    }
  }

  const enCours = sessionsInventaire.filter((s) => s.statut === "en_cours").length
  const termine = sessionsInventaire.filter((s) => s.statut === "termine").length
  const ecartsTotal = sessionsInventaire.reduce((acc, s) => acc + s.ecarts, 0)

  const columns: Column<SessionInventaire>[] = [
    { key: "reference", header: "Référence", render: (r) => <span className="font-mono text-xs font-medium">{r.reference}</span> },
    { key: "depot", header: "Dépôt" },
    { key: "responsable", header: "Responsable" },
    { key: "dateDebut", header: "Début" },
    { key: "dateFin", header: "Fin", render: (r) => r.dateFin ?? <span className="text-muted-foreground">—</span> },
    {
      key: "progression",
      header: "Progression",
      render: (r) => (
        <div className="flex items-center gap-2">
          <CapacityBar value={r.articlesVerifies} max={r.articlesTotal} showLabel={false} />
          <span className="text-xs tabular-nums text-muted-foreground">
            {r.articlesVerifies}/{r.articlesTotal}
          </span>
        </div>
      ),
    },
    {
      key: "ecarts",
      header: "Écarts",
      render: (r) =>
        r.ecarts > 0 ? (
          <Badge className="border-transparent bg-destructive/15 text-destructive">{r.ecarts}</Badge>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
    {
      key: "statut",
      header: "Statut",
      render: (r) => (
        <Badge className={`border-transparent ${statutConfig[r.statut].className}`}>
          {statutConfig[r.statut].label}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Inventaire"
        description="Sessions de comptage physique et rapprochement des stocks."
        breadcrumb={[{ label: "Opérations" }, { label: "Inventaire" }]}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nouvelle session
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sessions totales" value={sessionsInventaire.length} icon={ClipboardCheck} tone="info" />
        <StatCard label="En cours" value={enCours} icon={Clock} tone="warning" />
        <StatCard label="Terminées" value={termine} icon={CheckCircle2} tone="success" />
        <StatCard label="Écarts détectés" value={ecartsTotal} icon={AlertTriangle} tone="danger" />
      </div>

      <DataTable
        columns={columns}
        data={sessionsInventaire}
        searchKeys={["reference", "depot", "responsable"]}
        searchPlaceholder="Rechercher par référence, dépôt, responsable..."
        filters={[
          {
            key: "statut",
            label: "Statut",
            options: [
              { value: "en_cours", label: "En cours" },
              { value: "termine", label: "Terminé" },
              { value: "planifie", label: "Planifié" },
            ],
          },
          { key: "depot", label: "Dépôt", options: depots.map((d) => ({ value: d.nom, label: d.nom })) },
        ]}
        emptyMessage="Aucune session d'inventaire."
        actions={(row) => (
          <Button variant="outline" size="sm" onClick={() => setDetailSession(row)}>
            <Eye className="size-4" />
            Détails
          </Button>
        )}
      />

      <InventaireFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        depots={depots}
        stocks={stocks}
        onSubmit={handleSubmit}
      />

      <InventaireDetailDialog
        open={detailSession !== null}
        onOpenChange={(open) => !open && setDetailSession(null)}
        session={detailSession}
      />
    </div>
  )
}
