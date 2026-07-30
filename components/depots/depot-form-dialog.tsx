"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Depot, StatutGenerique } from "@/lib/types"

interface DepotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: Depot | null
  onSubmit: (depot: Depot) => void
}

const empty = {
  nom: "",
  adresse: "",
  responsable: "",
  capacite: 1000,
  occupation: 0,
  statut: "actif" as StatutGenerique,
}

export function DepotFormDialog({ open, onOpenChange, initial, onSubmit }: DepotFormDialogProps) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              nom: initial.nom,
              adresse: initial.adresse,
              responsable: initial.responsable,
              capacite: initial.capacite,
              occupation: initial.occupation,
              statut: initial.statut,
            }
          : empty,
      )
    }
  }, [open, initial])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    onSubmit({
      id: initial?.id ?? `d${Date.now()}`,
      ...form,
    })
    onOpenChange(false)
  }

  const valid = form.nom.trim() && form.responsable.trim() && form.capacite > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier le dépôt" : "Nouveau dépôt"}</DialogTitle>
          <DialogDescription>
            {initial ? "Mettez à jour les informations du dépôt." : "Renseignez les informations du nouveau dépôt."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nom">Nom du dépôt</Label>
            <Input id="nom" value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Dépôt Central Nord" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Zone Fret 1, Aéroport CDG" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="responsable">Responsable</Label>
            <Input id="responsable" value={form.responsable} onChange={(e) => set("responsable", e.target.value)} placeholder="Nom du responsable" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="capacite">Capacité (colis)</Label>
              <Input
                id="capacite"
                type="number"
                min={1}
                value={form.capacite}
                onChange={(e) => set("capacite", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="occupation">Occupation actuelle</Label>
              <Input
                id="occupation"
                type="number"
                min={0}
                value={form.occupation}
                onChange={(e) => set("occupation", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="statut">Statut</Label>
            <Select value={form.statut} onValueChange={(v) => set("statut", v as StatutGenerique)}>
              <SelectTrigger id="statut">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!valid}>
            {initial ? "Enregistrer" : "Créer le dépôt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
