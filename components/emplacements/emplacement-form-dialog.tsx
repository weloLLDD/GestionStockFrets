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
import type { Emplacement, Zone } from "@/lib/types"

interface EmplacementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  zones: Zone[]
  onSubmit: (emplacement: Omit<Emplacement, "id">) => void
}

const empty = {
  zone: "",
  rayon: "",
  position: "",
  capacite: 50,
  occupe: 0,
}

export function EmplacementFormDialog({ open, onOpenChange, zones, onSubmit }: EmplacementFormDialogProps) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) setForm({ ...empty, zone: zones[0]?.nom ?? "" })
  }, [open, zones])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const valid = form.zone.trim() && form.rayon.trim() && form.position.trim() && form.capacite > 0

  const handleSubmit = () => {
    onSubmit(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvel emplacement</DialogTitle>
          <DialogDescription>Créez une position physique (rayon / position) dans une zone.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="zone">Zone</Label>
            <Select value={form.zone} onValueChange={(v) => set("zone", v)}>
              <SelectTrigger id="zone">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rayon">Rayon</Label>
              <Input
                id="rayon"
                value={form.rayon}
                onChange={(e) => set("rayon", e.target.value)}
                placeholder="R1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder="A-03"
              />
            </div>
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
              <Label htmlFor="occupe">Colis présents</Label>
              <Input
                id="occupe"
                type="number"
                min={0}
                value={form.occupe}
                onChange={(e) => set("occupe", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!valid}>
            Créer l&apos;emplacement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
