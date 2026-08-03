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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Depot, StatutEntree, StockItem, Zone } from "@/lib/types"

interface StockFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depots: Depot[]
  zones: Zone[]
  initial?: StockItem | null
  onSubmit: (stock: Omit<StockItem, "id">) => Promise<void> | void
}

type StockForm = {
  awb: string
  colis: string
  description: string
  quantite: number
  poids: number
  depot: string
  zone: string
  emplacement: string
  statut: StatutEntree
}

const empty: StockForm = {
  awb: "",
  colis: "",
  description: "",
  quantite: 1,
  poids: 0,
  depot: "",
  zone: "",
  emplacement: "",
  statut: "en_stock",
}

const statuts: { value: StatutEntree; label: string }[] = [
  { value: "en_stock", label: "En stock" },
  { value: "en_attente", label: "En attente" },
  { value: "bloque", label: "Bloqué" },
  { value: "sorti", label: "Sorti" },
]

export function StockFormDialog({ open, onOpenChange, depots, zones, initial, onSubmit }: StockFormDialogProps) {
  const [form, setForm] = useState<StockForm>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      const { id, dureeStockage, createdAt, updatedAt, ...rest } = initial
      setForm({ ...empty, ...rest })
    } else {
      setForm(empty)
    }
  }, [open, initial])

  const set = <K extends keyof StockForm>(key: K, value: StockForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const valid = form.awb.trim() !== "" && form.colis.trim() !== ""

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier le colis" : "Nouveau colis en stock"}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du colis stocké au dépôt. Les données sont enregistrées dans MongoDB.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="awb">Numéro AWB</Label>
            <Input id="awb" value={form.awb} onChange={(e) => set("awb", e.target.value)} placeholder="083-11112222" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="colis">Référence colis</Label>
            <Input id="colis" value={form.colis} onChange={(e) => set("colis", e.target.value)} placeholder="COL-004" />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="description">Marchandise</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Nature du contenu..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <div className="grid gap-2">
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                id="quantite"
                type="number"
                min={0}
                value={form.quantite}
                onChange={(e) => set("quantite", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="poids">Poids (kg)</Label>
              <Input
                id="poids"
                type="number"
                min={0}
                step="0.1"
                value={form.poids}
                onChange={(e) => set("poids", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Dépôt</Label>
            <Select value={form.depot} onValueChange={(v) => set("depot", v)}>
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label>Zone</Label>
            <Select value={form.zone} onValueChange={(v) => set("zone", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.nom}>
                    {z.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emplacement">Emplacement</Label>
            <Input
              id="emplacement"
              value={form.emplacement}
              onChange={(e) => set("emplacement", e.target.value)}
              placeholder="R1-A-03"
            />
          </div>
          <div className="grid gap-2">
            <Label>Statut</Label>
            <Select value={form.statut} onValueChange={(v) => set("statut", v as StatutEntree)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuts.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!valid || saving}>
            {saving ? "Enregistrement..." : initial ? "Enregistrer" : "Ajouter le colis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
