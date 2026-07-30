"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { SortieFormDialog } from "@/components/sorties/sortie-form-dialog"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createSortie, editSortie, removeSortie, changeSortieStatut } from "@/store/actions"
import type { SortieFret } from "@/lib/types"
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"

export default function SortiesPage() {
  const sorties = useAppSelector((s) => s.sorties)
  const dispatch = useAppDispatch()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SortieFret | null>(null)
  const [toDelete, setToDelete] = useState<SortieFret | null>(null)

  const columns: Column<SortieFret>[] = [
    { key: "awb", header: "AWB", render: (r) => <span className="font-mono text-xs">{r.awb}</span> },
    { key: "colis", header: "Colis", render: (r) => <span className="font-medium">{r.colis}</span> },
    { key: "destinataire", header: "Destinataire" },
    { key: "date", header: "Date", render: (r) => `${r.date} · ${r.heure}` },
    { key: "agent", header: "Agent" },
    { key: "motif", header: "Motif", render: (r) => <span className="text-muted-foreground">{r.motif}</span> },
    { key: "statut", header: "Statut", render: (r) => <StatusBadge status={r.statut} /> },
  ]

  const handleSubmit = (sortie: SortieFret) => {
    const { id, ...data } = sortie
    if (editing) {
      dispatch(editSortie(editing.id, data)).catch((e) => console.log("[v0] editSortie:", e.message))
    } else {
      dispatch(createSortie(data)).catch((e) => console.log("[v0] createSortie:", e.message))
    }
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="Sorties de Fret"
        description="Expédition et enlèvement des colis stockés au dépôt."
        breadcrumb={[{ label: "Opérations" }, { label: "Sorties de Fret" }]}
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus className="size-4" />
            Nouvelle sortie
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={sorties}
        searchKeys={["awb", "colis", "destinataire", "agent"]}
        searchPlaceholder="Rechercher par AWB, colis, destinataire..."
        filters={[
          {
            key: "statut",
            label: "Statut",
            options: [
              { value: "en_attente", label: "En attente" },
              { value: "validee", label: "Validée" },
              { value: "annulee", label: "Annulée" },
            ],
          },
        ]}
        emptyMessage="Aucune sortie enregistrée."
        actions={(row) => (
          <RowActions
            actions={[
              ...(row.statut === "en_attente"
                ? [
                    {
                      label: "Valider",
                      icon: <CheckCircle2 className="size-4" />,
                      onClick: () => {
                        dispatch(changeSortieStatut(row.id, "validee")).catch((e) => console.log("[v0] valider:", e.message))
                      },
                    },
                    {
                      label: "Annuler la sortie",
                      icon: <XCircle className="size-4" />,
                      onClick: () => {
                        dispatch(changeSortieStatut(row.id, "annulee")).catch((e) => console.log("[v0] annuler:", e.message))
                      },
                    },
                  ]
                : []),
              {
                label: "Modifier",
                icon: <Pencil className="size-4" />,
                separatorBefore: row.statut === "en_attente",
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

      <SortieFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer la sortie ?"
        description={`La sortie ${toDelete?.awb ?? ""} sera définitivement supprimée.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={() => {
          if (toDelete) {
            dispatch(removeSortie(toDelete.id, toDelete.awb)).catch((e) => console.log("[v0] removeSortie:", e.message))
          }
          setToDelete(null)
        }}
      />
    </div>
  )
}
