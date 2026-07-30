"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SessionInventaire } from "@/lib/types"
import { FileDown, PackageSearch } from "lucide-react"

const statutLabel: Record<SessionInventaire["statut"], string> = {
  en_cours: "En cours",
  termine: "Terminé",
  planifie: "Planifié",
}

interface InventaireDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: SessionInventaire | null
}

export function InventaireDetailDialog({ open, onOpenChange, session }: InventaireDetailDialogProps) {
  if (!session) return null

  const handleExportPdf = async () => {
    // Import dynamique pour éviter d'alourdir le bundle initial.
    const { jsPDF } = await import("jspdf")
    const autoTable = (await import("jspdf-autotable")).default

    const doc = new jsPDF()
    const marge = 14
    let y = 18

    doc.setFontSize(16)
    doc.text("Détail de session d'inventaire", marge, y)

    y += 8
    doc.setFontSize(10)
    doc.setTextColor(90)
    const infos: [string, string][] = [
      ["Référence", session.reference],
      ["Dépôt", session.depot],
      ["Responsable", session.responsable],
      ["Statut", statutLabel[session.statut]],
      ["Date de début", session.dateDebut],
      ["Date de fin", session.dateFin ?? "—"],
      ["Articles vérifiés", `${session.articlesVerifies}/${session.articlesTotal}`],
      ["Écarts détectés", String(session.ecarts)],
    ]
    infos.forEach(([label, value]) => {
      doc.text(`${label} : ${value}`, marge, y)
      y += 5
    })

    autoTable(doc, {
      startY: y + 2,
      head: [["Colis", "AWB", "Emplacement", "Qté théorique", "Qté physique", "Écart"]],
      body: session.lignes.map((l) => [
        l.colis,
        l.awb,
        l.emplacement || "—",
        String(l.quantiteTheorique),
        l.quantitePhysique === null ? "—" : String(l.quantitePhysique),
        l.quantitePhysique === null ? "—" : (l.ecart > 0 ? `+${l.ecart}` : String(l.ecart)),
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      theme: "striped",
    })

    doc.save(`inventaire-${session.reference}.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Détail de la session {session.reference}</DialogTitle>
          <DialogDescription>
            Consultez le comptage physique et les écarts de cette session d&apos;inventaire.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-9.5rem)] overflow-y-auto px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Dépôt" value={session.depot} />
            <Info label="Responsable" value={session.responsable} />
            <Info label="Statut" value={statutLabel[session.statut]} />
            <Info label="Date de début" value={session.dateDebut} />
            <Info label="Date de fin" value={session.dateFin ?? "—"} />
            <Info label="Vérifiés" value={`${session.articlesVerifies}/${session.articlesTotal}`} />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Lignes d&apos;inventaire</span>
              <span className="text-xs text-muted-foreground">
                {session.ecarts} écart{session.ecarts > 1 ? "s" : ""}
              </span>
            </div>

            {session.lignes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
                <PackageSearch className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucune ligne pour cette session.</p>
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
                    {session.lignes.map((l, i) => (
                      <tr key={`${l.colis}-${i}`}>
                        <td className="px-3 py-2">
                          <div className="font-medium">{l.colis}</div>
                          <div className="font-mono text-xs text-muted-foreground">{l.awb}</div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{l.emplacement || "—"}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{l.quantiteTheorique}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {l.quantitePhysique === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            l.quantitePhysique
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {l.quantitePhysique === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : l.ecart === 0 ? (
                            <Badge className="border-transparent bg-success/15 text-success">0</Badge>
                          ) : (
                            <Badge className="border-transparent bg-destructive/15 text-destructive tabular-nums">
                              {l.ecart > 0 ? `+${l.ecart}` : l.ecart}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={handleExportPdf}>
            <FileDown className="size-4" />
            Exporter en PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}
