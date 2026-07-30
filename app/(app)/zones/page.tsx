"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { CapacityBar } from "@/components/shared/capacity-bar"
import { Button } from "@/components/ui/button"
import { ZoneFormDialog } from "@/components/zones/zone-form-dialog"
import { useCollection } from "@/lib/use-api"
import { api } from "@/lib/api-client"
import type { Zone, Depot } from "@/lib/types"
import { Plus } from "lucide-react"

export default function ZonesPage() {
  const { data: zones, mutate } = useCollection<Zone>("zones")
  const { data: depots } = useCollection<Depot>("depots")

  const [formOpen, setFormOpen] = useState(false)

  const handleSubmit = async (data: Omit<Zone, "id">) => {
    try {
      await api.create("zones", data)
      await mutate()
    } catch (e) {
      console.log("[v0] createZone:", (e as Error).message)
    }
  }

  const columns: Column<Zone>[] = [
    { key: "nom", header: "Zone", render: (r) => <span className="font-medium">{r.nom}</span> },
    { key: "depot", header: "Dépôt", render: (r) => <span className="text-muted-foreground">{r.depot}</span> },
    { key: "capacite", header: "Capacité", render: (r) => `${r.capacite.toLocaleString("fr-FR")} colis` },
    { key: "nombreColis", header: "Colis stockés", render: (r) => r.nombreColis.toLocaleString("fr-FR") },
    {
      key: "occupation",
      header: "Taux d'occupation",
      render: (r) => <CapacityBar value={r.nombreColis} max={r.capacite} />,
    },
    {
      key: "libre",
      header: "Places libres",
      render: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {(r.capacite - r.nombreColis).toLocaleString("fr-FR")}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Zones de Stockage"
        description="Découpage des dépôts en zones et suivi de leur remplissage."
        breadcrumb={[{ label: "Entrepôt" }, { label: "Zones" }]}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nouvelle zone
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={zones}
        searchKeys={["nom", "depot"]}
        searchPlaceholder="Rechercher par zone ou dépôt..."
        filters={[
          { key: "depot", label: "Dépôt", options: depots.map((d) => ({ value: d.nom, label: d.nom })) },
        ]}
        emptyMessage="Aucune zone enregistrée."
      />

      <ZoneFormDialog open={formOpen} onOpenChange={setFormOpen} depots={depots} onSubmit={handleSubmit} />
    </div>
  )
}
