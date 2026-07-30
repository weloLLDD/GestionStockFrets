"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EntreeFormDialog } from "@/components/entrees/entree-form-dialog"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createEntree, editEntree, removeEntree } from "@/store/actions"
import type { EntreeFret } from "@/lib/types"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function EntreesPage() {
  const entrees = useAppSelector((s) => s.entrees)
  const compagnies = useAppSelector((s) => s.compagnies)
  const depots = useAppSelector((s) => s.depots)
  const dispatch = useAppDispatch()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EntreeFret | null>(null)
  const [toDelete, setToDelete] = useState<EntreeFret | null>(null)

  const columns: Column<EntreeFret>[] = [
    { key: "awb", header: "AWB", render: (r) => <span className="font-mono text-xs">{r.awb}</span> },
    { key: "numeroColis", header: "Colis", render: (r) => <span className="font-medium">{r.numeroColis}</span> },
    { key: "compagnie", header: "Compagnie" },
    { key: "provenance", header: "Provenance" },
    { key: "dateArrivee", header: "Arrivée" },
    { key: "nombreColis", header: "Nb", render: (r) => r.nombreColis },
    { key: "poids", header: "Poids", render: (r) => `${r.poids} kg` },
    { key: "zone", header: "Zone", render: (r) => <span className="text-muted-foreground">{r.zone}</span> },
    { key: "statut", header: "Statut", render: (r) => <StatusBadge status={r.statut} /> },
  ]

  const handleSubmit = (entree: EntreeFret) => {
    const { id, ...data } = entree
    if (editing) {
      dispatch(editEntree(editing.id, data)).catch((e) => console.log("[v0] editEntree:", e.message))
    } else {
      dispatch(createEntree(data)).catch((e) => console.log("[v0] createEntree:", e.message))
    }
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="Entrées de Fret"
        description="Réception et enregistrement des colis entrants au dépôt."
        breadcrumb={[{ label: "Opérations" }, { label: "Entrées de Fret" }]}
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus className="size-4" />
            Nouvelle entrée
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={entrees}
        searchKeys={["awb", "numeroColis", "compagnie", "provenance", "vol"]}
        searchPlaceholder="Rechercher par AWB, colis, compagnie..."
        filters={[
          {
            key: "statut",
            label: "Statut",
            options: [
              { value: "en_attente", label: "En attente" },
              { value: "en_stock", label: "En stock" },
              { value: "sorti", label: "Sorti" },
              { value: "bloque", label: "Bloqué" },
            ],
          },
          { key: "compagnie", label: "Compagnie", options: compagnies.map((c) => ({ value: c.nom, label: c.nom })) },
          { key: "depot", label: "Dépôt", options: depots.map((d) => ({ value: d.nom, label: d.nom })) },
        ]}
        emptyMessage="Aucune entrée enregistrée."
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

      <EntreeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer l'entrée ?"
        description={`L'entrée ${toDelete?.awb ?? ""} sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={() => {
          if (toDelete) {
            dispatch(removeEntree(toDelete.id, toDelete.awb)).catch((e) => console.log("[v0] removeEntree:", e.message))
          }
          setToDelete(null)
        }}
      />
    </div>
  )
}
