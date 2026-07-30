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
import type { Compagnie, StatutGenerique } from "@/lib/types"

interface CompagnieFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: Compagnie | null
  onSubmit: (compagnie: Compagnie) => void
}

const empty = { nom: "", code: "", pays: "", statut: "actif" as StatutGenerique }

export function CompagnieFormDialog({ open, onOpenChange, initial, onSubmit }: CompagnieFormDialogProps) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) {
      setForm(initial ? { nom: initial.nom, code: initial.code, pays: initial.pays, statut: initial.statut } : empty)
    }
  }, [open, initial])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    onSubmit({ id: initial?.id ?? `c${Date.now()}`, ...form, code: form.code.toUpperCase() })
    onOpenChange(false)
  }

  const valid = form.nom.trim() && form.code.trim() && form.pays.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier la compagnie" : "Nouvelle compagnie"}</DialogTitle>
          <DialogDescription>
            {initial ? "Mettez à jour la compagnie aérienne." : "Ajoutez une compagnie aérienne partenaire."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nom">Nom de la compagnie</Label>
            <Input id="nom" value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Air France Cargo" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code IATA</Label>
              <Input id="code" maxLength={3} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="AF" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pays">Pays</Label>
              <Input id="pays" value={form.pays} onChange={(e) => set("pays", e.target.value)} placeholder="France" />
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
            {initial ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
