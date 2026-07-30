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
import { useAppSelector } from "@/store/hooks"
import type { Utilisateur, StatutGenerique } from "@/lib/types"

type Role = Utilisateur["role"]

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: Utilisateur | null
  onSubmit: (user: Utilisateur) => void
}

const empty = {
  nom: "",
  email: "",
  role: "agent" as Role,
  depot: "",
  statut: "actif" as StatutGenerique,
}

export function UserFormDialog({ open, onOpenChange, initial, onSubmit }: UserFormDialogProps) {
  const depots = useAppSelector((s) => s.depots)
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { nom: initial.nom, email: initial.email, role: initial.role, depot: initial.depot, statut: initial.statut }
          : empty,
      )
    }
  }, [open, initial])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    onSubmit({
      id: initial?.id ?? `u${Date.now()}`,
      ...form,
      dernierAcces: initial?.dernierAcces ?? "—",
    })
    onOpenChange(false)
  }

  const valid = form.nom.trim() && /.+@.+\..+/.test(form.email)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          <DialogDescription>
            {initial ? "Mettez à jour le compte et ses droits." : "Créez un compte et attribuez un rôle."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nom">Nom complet</Label>
            <Input id="nom" value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Prénom Nom" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="prenom.nom@fretdepot.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v as Role)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="responsable">Responsable</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="grid gap-2">
            <Label htmlFor="depot">Dépôt assigné</Label>
            <Select value={form.depot} onValueChange={(v) => set("depot", v)}>
              <SelectTrigger id="depot">
                <SelectValue />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!valid}>
            {initial ? "Enregistrer" : "Créer l'utilisateur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
