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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SessionInventaire, LigneInventaire, Depot, StockItem } from "@/lib/types"
import { PackageSearch } from "lucide-react"

interface InventaireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depots: Depot[]
  stocks: StockItem[]
  onSubmit: (session: Omit<SessionInventaire, "id">) => void
}

// Ligne de comptage : la quantité physique reste une chaîne tant que
// l'utilisateur n'a rien saisi, ce qui permet d'afficher un champ vide.
interface LigneComptage {
  colis: string
  awb: string
  emplacement: string
  quantiteTheorique: number
  quantitePhysique: string
}

function defaultReference() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const rand = String(Math.floor(Math.random() * 900) + 100)
  return `INV-${y}${m}${d}-${rand}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function InventaireFormDialog({ open, onOpenChange, depots, stocks, onSubmit }: InventaireFormDialogProps) {
  const [reference, setReference] = useState(defaultReference)
  const [depot, setDepot] = useState("")
  const [responsable, setResponsable] = useState("")
  const [dateDebut, setDateDebut] = useState(today)
  const [statut, setStatut] = useState<SessionInventaire["statut"]>("en_cours")
  const [lignes, setLignes] = useState<LigneComptage[]>([])

  // Construit la feuille de comptage à partir des colis en stock du dépôt choisi.
  const buildLignes = (depotNom: string): LigneComptage[] =>
    stocks
      .filter((s) => s.depot === depotNom)
      .map((s) => ({
        colis: s.colis,
        awb: s.awb,
        emplacement: s.emplacement,
        quantiteTheorique: s.quantite,
        quantitePhysique: "",
      }))

  useEffect(() => {
    if (!open) return
    const first = depots[0]?.nom ?? ""
    setReference(defaultReference())
    setDepot(first)
    setResponsable("")
    setDateDebut(today())
    setStatut("en_cours")
    setLignes(buildLignes(first))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onDepotChange = (v: string) => {
    setDepot(v)
    setLignes(buildLignes(v))
  }

  const setPhysique = (index: number, value: string) =>
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, quantitePhysique: value } : l)))

  // Calculs en direct : comptés, écarts, totaux.
  const resume = useMemo(() => {
    let comptes = 0
    let ecartsLignes = 0
    for (const l of lignes) {
      if (l.quantitePhysique.trim() !== "") {
        comptes++
        if (Number(l.quantitePhysique) !== l.quantiteTheorique) ecartsLignes++
      }
    }
    return { total: lignes.length, comptes, ecartsLignes }
  }, [lignes])

  const valid = reference.trim() !== "" && depot.trim() !== "" && responsable.trim() !== "" && dateDebut.trim() !== ""

  const handleSubmit = () => {
    const lignesFinales: LigneInventaire[] = lignes.map((l) => {
      const compte = l.quantitePhysique.trim() !== ""
      const physique = compte ? Number(l.quantitePhysique) : null
      return {
        colis: l.colis,
        awb: l.awb,
        emplacement: l.emplacement,
        quantiteTheorique: l.quantiteTheorique,
        quantitePhysique: physique,
        ecart: physique === null ? 0 : physique - l.quantiteTheorique,
      }
    })

    onSubmit({
      reference,
      depot,
      responsable,
      dateDebut,
      dateFin: statut === "termine" ? today() : null,
      statut,
      articlesTotal: lignesFinales.length,
      articlesVerifies: resume.comptes,
      ecarts: resume.ecartsLignes,
      lignes: lignesFinales,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Nouvelle session d&apos;inventaire</DialogTitle>
          <DialogDescription>
            Comptez physiquement chaque colis en stock. Le système calcule automatiquement les écarts.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-9.5rem)] overflow-y-auto px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="reference">Référence</Label>
              <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="depot">Dépôt</Label>
              <Select value={depot} onValueChange={onDepotChange}>
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
            <div className="grid gap-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nom du responsable"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateDebut">Date de début</Label>
                <Input id="dateDebut" type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statut">Statut</Label>
                <Select value={statut} onValueChange={(v) => setStatut(v as SessionInventaire["statut"])}>
                  <SelectTrigger id="statut">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planifie">Planifié</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm font-semibold">Feuille de comptage physique</Label>
              <span className="text-xs text-muted-foreground">
                {resume.comptes}/{resume.total} comptés
              </span>
            </div>

            {lignes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
                <PackageSearch className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucun colis en stock pour ce dépôt.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Colis</th>
                      <th className="px-3 py-2 text-left font-medium">Emplacement</th>
                      <th className="px-3 py-2 text-right font-medium">Qté théorique</th>
                      <th className="px-3 py-2 text-right font-medium">Qté physique</th>
                      <th className="px-3 py-2 text-right font-medium">Écart</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lignes.map((l, i) => {
                      const compte = l.quantitePhysique.trim() !== ""
                      const ecart = compte ? Number(l.quantitePhysique) - l.quantiteTheorique : null
                      return (
                        <tr key={`${l.colis}-${i}`}>
                          <td className="px-3 py-2">
                            <div className="font-medium">{l.colis}</div>
                            <div className="font-mono text-xs text-muted-foreground">{l.awb}</div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{l.emplacement || "—"}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{l.quantiteTheorique}</td>
                          <td className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              aria-label={`Quantité physique pour ${l.colis}`}
                              className="ml-auto h-8 w-20 text-right"
                              value={l.quantitePhysique}
                              onChange={(e) => setPhysique(i, e.target.value)}
                              placeholder="—"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            {ecart === null ? (
                              <span className="text-muted-foreground">—</span>
                            ) : ecart === 0 ? (
                              <Badge className="border-transparent bg-success/15 text-success">0</Badge>
                            ) : (
                              <Badge className="border-transparent bg-destructive/15 text-destructive tabular-nums">
                                {ecart > 0 ? `+${ecart}` : ecart}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {resume.total > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Total colis : <span className="font-semibold text-foreground">{resume.total}</span>
                </span>
                <span className="text-muted-foreground">
                  Comptés : <span className="font-semibold text-foreground">{resume.comptes}</span>
                </span>
                <span className="text-muted-foreground">
                  Écarts :{" "}
                  <span className={resume.ecartsLignes > 0 ? "font-semibold text-destructive" : "font-semibold text-foreground"}>
                    {resume.ecartsLignes}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!valid}>
            Enregistrer la session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
