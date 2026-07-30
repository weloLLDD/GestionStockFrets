"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { RowActions } from "@/components/shared/row-actions"
import { UserFormDialog } from "@/components/utilisateurs/user-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createUser, editUser, toggleUserStatut } from "@/store/actions"
import type { Utilisateur } from "@/lib/types"
import { Plus, Pencil, Power } from "lucide-react"

const roleConfig: Record<Utilisateur["role"], { label: string; className: string }> = {
  admin: { label: "Administrateur", className: "bg-primary/10 text-primary" },
  responsable: { label: "Responsable", className: "bg-info/15 text-info" },
  agent: { label: "Agent", className: "bg-success/15 text-success" },
  consultation: { label: "Consultation", className: "bg-muted text-muted-foreground" },
}

function initials(nom: string) {
  return nom
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function UtilisateursPage() {
  const utilisateurs = useAppSelector((s) => s.utilisateurs)
  const depots = useAppSelector((s) => s.depots)
  const dispatch = useAppDispatch()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Utilisateur | null>(null)

  const columns: Column<Utilisateur>[] = [
    {
      key: "nom",
      header: "Utilisateur",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials(r.nom)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium">{r.nom}</p>
            <p className="truncate text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      render: (r) => (
        <Badge className={`border-transparent ${roleConfig[r.role].className}`}>{roleConfig[r.role].label}</Badge>
      ),
    },
    { key: "depot", header: "Dépôt", render: (r) => <span className="text-muted-foreground">{r.depot}</span> },
    { key: "dernierAcces", header: "Dernier accès", render: (r) => <span className="tabular-nums text-muted-foreground">{r.dernierAcces}</span> },
    { key: "statut", header: "Statut", render: (r) => <StatusBadge status={r.statut} /> },
  ]

  const handleSubmit = (user: Utilisateur) => {
    const { id, ...data } = user
    if (editing) {
      dispatch(editUser(editing.id, data)).catch((e) => console.log("[v0] editUser:", e.message))
    } else {
      dispatch(createUser(data)).catch((e) => console.log("[v0] createUser:", e.message))
    }
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="Gestion des Utilisateurs"
        description="Comptes, rôles et droits d'accès à la plateforme."
        breadcrumb={[{ label: "Administration" }, { label: "Utilisateurs" }]}
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus className="size-4" />
            Nouvel utilisateur
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={utilisateurs}
        searchKeys={["nom", "email", "depot"]}
        searchPlaceholder="Rechercher par nom, e-mail, dépôt..."
        filters={[
          {
            key: "role",
            label: "Rôle",
            options: [
              { value: "admin", label: "Administrateur" },
              { value: "responsable", label: "Responsable" },
              { value: "agent", label: "Agent" },
              { value: "consultation", label: "Consultation" },
            ],
          },
          { key: "depot", label: "Dépôt", options: depots.map((d) => ({ value: d.nom, label: d.nom })) },
          {
            key: "statut",
            label: "Statut",
            options: [
              { value: "actif", label: "Actif" },
              { value: "inactif", label: "Inactif" },
            ],
          },
        ]}
        emptyMessage="Aucun utilisateur enregistré."
        actions={(row) => (
          <RowActions
            actions={[
              {
                label: "Modifier",
                icon: <Pencil className="size-4" />,
                onClick: () => { setEditing(row); setFormOpen(true) },
              },
              {
                label: row.statut === "actif" ? "Désactiver" : "Activer",
                icon: <Power className="size-4" />,
                separatorBefore: true,
                onClick: () => {
                  dispatch(toggleUserStatut(row.id, row.statut)).catch((e) => console.log("[v0] toggleUser:", e.message))
                },
              },
            ]}
          />
        )}
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={handleSubmit} />
    </div>
  )
}
