"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { CapacityBar } from "@/components/shared/capacity-bar"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DepotFormDialog } from "@/components/depots/depot-form-dialog"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createDepot, editDepot, removeDepot } from "@/store/actions"
import type { Depot } from "@/lib/types"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function DepotsPage() {
  const depots = useAppSelector((s) => s.depots)
  const dispatch = useAppDispatch()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Depot | null>(null)
  const [toDelete, setToDelete] = useState<Depot | null>(null)

  const columns: Column<Depot>[] = [
    { key: "nom", header: "Dépôt", render: (r) => <span className="font-medium">{r.nom}</span> },
    { key: "adresse", header: "Adresse", render: (r) => <span className="text-muted-foreground">{r.adresse}</span> },
    { key: "responsable", header: "Responsable" },
    { key: "capacite", header: "Capacité", render: (r) => `${r.capacite.toLocaleString("fr-FR")} colis` },
    {
      key: "occupation",
      header: "Occupation",
      render: (r) => <CapacityBar value={r.occupation} max={r.capacite} />,
    },
    { key: "statut", header: "Statut", render: (r) => <StatusBadge status={r.statut} /> },
  ]

  const handleSubmit = (depot: Depot) => {
    const { id, ...data } = depot
    if (editing) {
      dispatch(editDepot(editing.id, data)).catch((e) => console.log("[v0] editDepot:", e.message))
    } else {
      dispatch(createDepot(data)).catch((e) => console.log("[v0] createDepot:", e.message))
    }
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="Gestion des Dépôts"
        description="Sites de stockage, responsables et taux d'occupation."
        breadcrumb={[{ label: "Entrepôt" }, { label: "Dépôts" }]}
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus className="size-4" />
            Nouveau dépôt
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={depots}
        searchKeys={["nom", "adresse", "responsable"]}
        searchPlaceholder="Rechercher par nom, adresse, responsable..."
        filters={[
          {
            key: "statut",
            label: "Statut",
            options: [
              { value: "actif", label: "Actif" },
              { value: "inactif", label: "Inactif" },
            ],
          },
        ]}
        emptyMessage="Aucun dépôt enregistré."
        actions={(row) => (
          <RowActions
            actions={[
              {
                label: "Modifier",
                icon: <Pencil className="size-4" />,
                onClick: () => { setEditing(row); setFormOpen(true) },
              },
              {
                label: "Supprimer",
                icon: <Trash2 className="size-4" />,
                variant: "destructive",
                separatorBefore: true,
                onClick: () => setToDelete(row),
              },
            ]}
          />
        )}
      />

      <DepotFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer le dépôt ?"
        description={`Le dépôt ${toDelete?.nom ?? ""} sera définitivement supprimé. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={() => {
          if (toDelete) {
            dispatch(removeDepot(toDelete.id, toDelete.nom)).catch((e) => console.log("[v0] removeDepot:", e.message))
          }
          setToDelete(null)
        }}
      />
    </div>
  )
}
