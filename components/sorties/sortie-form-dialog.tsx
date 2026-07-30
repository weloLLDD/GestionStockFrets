"use client"

import { useEffect, useMemo, useState } from "react"
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
import type { SortieFret, StatutSortie, EntreeFret } from "@/lib/types"
import { Search, PackageCheck, MapPin, Building2, Plane } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortieFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: SortieFret | null
  onSubmit: (sortie: SortieFret) => void
}

const empty: Omit<SortieFret, "id"> = {
  awb: "",
  colis: "",
  destinataire: "",
  date: "2026-07-20",
  heure: "09:00",
  agent: "Karim Benali",
  motif: "Livraison client",
  statut: "en_attente",
}

const motifs = ["Livraison client", "Transfert dépôt", "Retour expéditeur", "Dédouanement", "Réexpédition"]
const agents = ["Karim Benali", "Sophie Marchand", "Antoine Dupont", "Nadia Cherif", "Luc Fontaine"]
const statuts: { value: StatutSortie; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "validee", label: "Validée" },
  { value: "annulee", label: "Annulée" },
]

// Statuts d'entrée considérés comme "présent en dépôt"
const EN_DEPOT: EntreeFret["statut"][] = ["en_stock", "en_attente", "bloque"]

export function SortieFormDialog({ open, onOpenChange, initial, onSubmit }: SortieFormDialogProps) {
  const entrees = useAppSelector((s) => s.entrees)
  const [form, setForm] = useState<Omit<SortieFret, "id">>(empty)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<EntreeFret | null>(null)

  const isEdit = !!initial

  useEffect(() => {
    if (open) {
      const { id, ...rest } = initial ?? { id: "", ...empty }
      setForm(rest)
      setQuery("")
      setSelected(null)
    }
  }, [open, initial])

  // Colis actuellement en dépôt, filtrés par la recherche
  const resultats = useMemo(() => {
    const enDepot = entrees.filter((e) => EN_DEPOT.includes(e.statut))
    const q = query.trim().toLowerCase()
    if (!q) return enDepot.slice(0, 8)
    return enDepot
      .filter(
        (e) =>
          e.awb.toLowerCase().includes(q) ||
          e.numeroColis.toLowerCase().includes(q) ||
          e.destinataire.toLowerCase().includes(q) ||
          e.compagnie.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [entrees, query])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSelect = (e: EntreeFret) => {
    setSelected(e)
    setForm((prev) => ({
      ...prev,
      awb: e.awb,
      colis: e.numeroColis,
      destinataire: e.destinataire,
    }))
  }

  const handleValider = () => {
    onSubmit({ id: initial?.id ?? `so${Date.now()}`, ...form, statut: "validee" })
    onOpenChange(false)
  }

  const handleSave = () => {
    onSubmit({ id: initial?.id ?? `so${Date.now()}`, ...form })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la sortie" : "Nouvelle sortie de fret"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les informations de la sortie."
              : "Recherchez un colis présent en dépôt, sélectionnez-le puis validez sa sortie."}
          </DialogDescription>
        </DialogHeader>

        {/* Étape 1 : recherche et sélection du colis (nouvelle sortie uniquement) */}
        {!isEdit && !selected ? (
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="search">Rechercher un colis en dépôt</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="AWB, colis, destinataire ou compagnie..."
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-md border border-border">
              {resultats.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Aucun colis en dépôt ne correspond à la recherche.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {resultats.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(e)}
                        className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                          <PackageCheck className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{e.numeroColis}</span>
                            <span className="font-mono text-xs text-muted-foreground">{e.awb}</span>
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Plane className="size-3" />
                              {e.compagnie}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" />
                              {e.zone} · {e.emplacement}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="size-3" />
                              {e.destinataire}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            {/* Récapitulatif du colis sélectionné */}
            {selected ? (
              <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/40 p-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <PackageCheck className="size-4 text-primary" />
                    {selected.numeroColis}
                    <span className="font-mono text-xs text-muted-foreground">{selected.awb}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.compagnie} · {selected.zone} · {selected.emplacement} · {selected.nombreColis} colis ·{" "}
                    {selected.poids} kg
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  Changer
                </Button>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {isEdit ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="awb">Numéro AWB</Label>
                    <Input id="awb" value={form.awb} onChange={(e) => set("awb", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="colis">Référence colis</Label>
                    <Input id="colis" value={form.colis} onChange={(e) => set("colis", e.target.value)} />
                  </div>
                </>
              ) : null}

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="destinataire">Destinataire</Label>
                <Input
                  id="destinataire"
                  value={form.destinataire}
                  onChange={(e) => set("destinataire", e.target.value)}
                  placeholder="TransLog SARL"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date de sortie</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heure">Heure</Label>
                <Input id="heure" type="time" value={form.heure} onChange={(e) => set("heure", e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Agent</Label>
                <Select value={form.agent} onValueChange={(v) => set("agent", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Motif</Label>
                <Select value={form.motif} onValueChange={(v) => set("motif", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {motifs.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isEdit ? (
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Statut</Label>
                  <Select value={form.statut} onValueChange={(v) => set("statut", v as StatutSortie)}>
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
              ) : null}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {isEdit ? (
            <Button onClick={handleSave} disabled={!form.awb || !form.destinataire}>
              Enregistrer
            </Button>
          ) : (
            <Button
              onClick={handleValider}
              disabled={!selected || !form.destinataire}
              className={cn(!selected && "opacity-60")}
            >
              <PackageCheck className="size-4" />
              Valider la sortie
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
