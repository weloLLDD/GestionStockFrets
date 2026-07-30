"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { CapacityBar } from "@/components/shared/capacity-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmplacementFormDialog } from "@/components/emplacements/emplacement-form-dialog"
import { useCollection } from "@/lib/use-api"
import { api } from "@/lib/api-client"
import type { Emplacement, Zone } from "@/lib/types"
import { Plus } from "lucide-react"

export default function EmplacementsPage() {
  const { data: emplacements, mutate } = useCollection<Emplacement>("emplacements")
  const { data: zones } = useCollection<Zone>("zones")

  const [formOpen, setFormOpen] = useState(false)

  const handleSubmit = async (data: Omit<Emplacement, "id">) => {
    try {
      await api.create("emplacements", data)
      await mutate()
    } catch (e) {
      console.log("[v0] createEmplacement:", (e as Error).message)
    }
  }

  const columns: Column<Emplacement>[] = [
    {
      key: "code",
      header: "Emplacement",
      render: (r) => <span className="font-mono text-xs font-medium">{`${r.rayon}-${r.position}`}</span>,
    },
    { key: "zone", header: "Zone", render: (r) => <span className="text-muted-foreground">{r.zone}</span> },
    { key: "rayon", header: "Rayon" },
    { key: "position", header: "Position" },
    { key: "capacite", header: "Capacité", render: (r) => `${r.capacite} colis` },
    {
      key: "occupation",
      header: "Occupation",
      render: (r) => <CapacityBar value={r.occupe} max={r.capacite} />,
    },
    {
      key: "etat",
      header: "État",
      render: (r) => {
        const pct = r.capacite > 0 ? (r.occupe / r.capacite) * 100 : 0
        if (r.occupe === 0)
          return <Badge className="border-transparent bg-success/15 text-success">Libre</Badge>
        if (pct >= 100)
          return <Badge className="border-transparent bg-destructive/15 text-destructive">Plein</Badge>
        return <Badge className="border-transparent bg-info/15 text-info">Partiel</Badge>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Emplacements"
        description="Positions physiques (rayon / position) au sein des zones."
        breadcrumb={[{ label: "Entrepôt" }, { label: "Emplacements" }]}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nouvel emplacement
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={emplacements}
        searchKeys={["zone", "rayon", "position"]}
        searchPlaceholder="Rechercher par zone, rayon, position..."
        filters={[
          { key: "zone", label: "Zone", options: zones.map((z) => ({ value: z.nom, label: z.nom })) },
        ]}
        emptyMessage="Aucun emplacement enregistré."
      />

      <EmplacementFormDialog open={formOpen} onOpenChange={setFormOpen} zones={zones} onSubmit={handleSubmit} />
    </div>
  )
}
