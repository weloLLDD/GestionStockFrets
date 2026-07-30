"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CompagnieFormDialog } from "@/components/parametres/compagnie-form-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createCompagnie, editCompagnie, removeCompagnie, addNotif } from "@/store/actions"
import type { Compagnie } from "@/lib/types"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function ParametresPage() {
  const compagnies = useAppSelector((s) => s.compagnies)
  const dispatch = useAppDispatch()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Compagnie | null>(null)
  const [toDelete, setToDelete] = useState<Compagnie | null>(null)

  // Général (local, non persistant)
  const [societe, setSociete] = useState("FretDepot Logistics")
  const [seuil, setSeuil] = useState(30)
  const [devise, setDevise] = useState("EUR")

  const columns: Column<Compagnie>[] = [
    { key: "code", header: "Code", render: (r) => <span className="font-mono text-xs font-medium">{r.code}</span> },
    { key: "nom", header: "Compagnie", render: (r) => <span className="font-medium">{r.nom}</span> },
    { key: "pays", header: "Pays", render: (r) => <span className="text-muted-foreground">{r.pays}</span> },
    { key: "statut", header: "Statut", render: (r) => <StatusBadge status={r.statut} /> },
  ]

  const handleCompagnieSubmit = (c: Compagnie) => {
    const { id, ...data } = c
    if (editing) {
      dispatch(editCompagnie(editing.id, data)).catch((e) => console.log("[v0] editCompagnie:", e.message))
    } else {
      dispatch(createCompagnie(data)).catch((e) => console.log("[v0] createCompagnie:", e.message))
    }
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configuration générale, compagnies partenaires et notifications."
        breadcrumb={[{ label: "Administration" }, { label: "Paramètres" }]}
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="compagnies">Compagnies</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration générale</CardTitle>
              <CardDescription>Informations de l'entreprise et règles de gestion des stocks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="societe">Nom de la société</Label>
                <Input id="societe" value={societe} onChange={(e) => setSociete(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seuil">Seuil d'alerte de stockage (jours)</Label>
                <Input id="seuil" type="number" min={1} value={seuil} onChange={(e) => setSeuil(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground">
                  Au-delà de ce délai, les colis apparaissent dans le rapport des dépassements.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="devise">Devise</Label>
                <Input id="devise" value={devise} onChange={(e) => setDevise(e.target.value)} />
              </div>
              <div>
                <Button onClick={() => dispatch(addNotif("Paramètres généraux enregistrés.", "success"))}>
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compagnies" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Compagnies aériennes</h2>
              <p className="text-sm text-muted-foreground">Partenaires dont le fret transite par vos dépôts.</p>
            </div>
            <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
              <Plus className="size-4" />
              Ajouter une compagnie
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={compagnies}
            searchKeys={["nom", "code", "pays"]}
            searchPlaceholder="Rechercher par nom, code, pays..."
            emptyMessage="Aucune compagnie enregistrée."
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
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="sm:max-w-xl">
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Choisissez les événements qui déclenchent une alerte.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                { id: "n1", label: "Nouvelle entrée de fret", desc: "À chaque réception de colis.", def: true },
                { id: "n2", label: "Dépassement de délai", desc: "Colis stocké au-delà du seuil.", def: true },
                { id: "n3", label: "Zone proche de la saturation", desc: "Occupation supérieure à 90 %.", def: true },
                { id: "n4", label: "Écart d'inventaire", desc: "Différence détectée lors d'un comptage.", def: false },
                { id: "n5", label: "Nouvel utilisateur", desc: "Ajout d'un compte à la plateforme.", def: false },
              ].map((n, i) => (
                <div key={n.id}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start gap-3">
                    <Checkbox id={n.id} defaultChecked={n.def} className="mt-0.5" />
                    <div className="grid gap-0.5">
                      <Label htmlFor={n.id} className="cursor-pointer font-medium">{n.label}</Label>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button onClick={() => dispatch(addNotif("Préférences de notification enregistrées.", "success"))}>
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompagnieFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={handleCompagnieSubmit} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer la compagnie ?"
        description={`La compagnie ${toDelete?.nom ?? ""} sera supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={() => {
          if (toDelete) {
            dispatch(removeCompagnie(toDelete.id, toDelete.nom)).catch((e) => console.log("[v0] removeCompagnie:", e.message))
          }
          setToDelete(null)
        }}
      />
    </div>
  )
}
