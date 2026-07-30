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
import type { EntreeFret, StatutEntree, Zone } from "@/lib/types"
import { useAppSelector } from "@/store/hooks"
import { useCollection } from "@/lib/use-api"

interface EntreeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: EntreeFret | null
  onSubmit: (entree: EntreeFret) => void
}

const empty: Omit<EntreeFret, "id"> = {
  awb: "",
  numeroColis: "",
  compagnie: "",
  vol: "",
  provenance: "",
  destination: "",
  expediteur: "",
  destinataire: "",
  dateArrivee: "2026-07-20",
  nombreColis: 1,
  poids: 0,
  depot: "",
  zone: "",
  emplacement: "",
  statut: "en_attente",
  description: "",
}

const statuts: { value: StatutEntree; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "en_stock", label: "En stock" },
  { value: "sorti", label: "Sorti" },
  { value: "bloque", label: "Bloqué" },
]

export function EntreeFormDialog({ open, onOpenChange, initial, onSubmit }: EntreeFormDialogProps) {
  const compagnies = useAppSelector((s) => s.compagnies)
  const depots = useAppSelector((s) => s.depots)
  const { data: zones } = useCollection<Zone>("zones")
  const [form, setForm] = useState<Omit<EntreeFret, "id">>(empty)

  useEffect(() => {
    if (open) {
      const { id, ...rest } = initial ?? { id: "", ...empty }
      setForm(rest)
    }
  }, [open, initial])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    onSubmit({ id: initial?.id ?? `en${Date.now()}`, ...form })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier l'entrée" : "Nouvelle entrée de fret"}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du colis réceptionné au dépôt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="awb">Numéro AWB</Label>
            <Input id="awb" value={form.awb} onChange={(e) => set("awb", e.target.value)} placeholder="124-10001644" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="numeroColis">Référence colis</Label>
            <Input id="numeroColis" value={form.numeroColis} onChange={(e) => set("numeroColis", e.target.value)} placeholder="COL-001" />
          </div>

          <div className="grid gap-2">
            <Label>Compagnie</Label>
            <Select value={form.compagnie} onValueChange={(v) => set("compagnie", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {compagnies.map((c) => (
                  <SelectItem key={c.id} value={c.nom}>{c.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vol">Vol</Label>
            <Input id="vol" value={form.vol} onChange={(e) => set("vol", e.target.value)} placeholder="EK205" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="provenance">Provenance</Label>
            <Input id="provenance" value={form.provenance} onChange={(e) => set("provenance", e.target.value)} placeholder="Dubaï (DXB)" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Paris (CDG)" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dateArrivee">Date d'arrivée</Label>
            <Input id="dateArrivee" type="date" value={form.dateArrivee} onChange={(e) => set("dateArrivee", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="nombreColis">Nb colis</Label>
              <Input id="nombreColis" type="number" min={1} value={form.nombreColis} onChange={(e) => set("nombreColis", Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="poids">Poids (kg)</Label>
              <Input id="poids" type="number" min={0} step="0.1" value={form.poids} onChange={(e) => set("poids", Number(e.target.value))} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Dépôt</Label>
            <Select value={form.depot} onValueChange={(v) => set("depot", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {depots.map((d) => (
                  <SelectItem key={d.id} value={d.nom}>{d.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Zone</Label>
            <Select value={form.zone} onValueChange={(v) => set("zone", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.nom}>{z.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emplacement">Emplacement</Label>
            <Input id="emplacement" value={form.emplacement} onChange={(e) => set("emplacement", e.target.value)} placeholder="R1-P01" />
          </div>
          <div className="grid gap-2">
            <Label>Statut</Label>
            <Select value={form.statut} onValueChange={(v) => set("statut", v as StatutEntree)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuts.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="description">Description marchandise</Label>
            <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Nature du contenu..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!form.awb || !form.numeroColis}>
            {initial ? "Enregistrer" : "Créer l'entrée"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
