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
import type { Zone, Depot } from "@/lib/types"

interface ZoneFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depots: Depot[]
  onSubmit: (zone: Omit<Zone, "id">) => void
}

const empty = {
  nom: "",
  depot: "",
  capacite: 500,
  nombreColis: 0,
}

export function ZoneFormDialog({ open, onOpenChange, depots, onSubmit }: ZoneFormDialogProps) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) setForm({ ...empty, depot: depots[0]?.nom ?? "" })
  }, [open, depots])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const valid = form.nom.trim() && form.depot.trim() && form.capacite > 0

  const handleSubmit = () => {
    onSubmit(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle zone</DialogTitle>
          <DialogDescription>Créez une zone de stockage rattachée à un dépôt.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nom">Nom de la zone</Label>
            <Input
              id="nom"
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Zone A - Fret standard"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="depot">Dépôt</Label>
            <Select value={form.depot} onValueChange={(v) => set("depot", v)}>
              <SelectTrigger id="depot">
                <SelectValue placeholder="Choisir un dépôt" />
              </SelectTrigger>
              <SelectContent>
                {depots.map((d) => (
                  <SelectItem key={d.id} value={d.nom}>
                    {d.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="nombreColis">Colis déjà stockés</Label>
              <Input
                id="nombreColis"
                type="number"
                min={0}
                value={form.nombreColis}
                onChange={(e) => set("nombreColis", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!valid}>
            Créer la zone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
