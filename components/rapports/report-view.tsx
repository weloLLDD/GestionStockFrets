"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileDown, RotateCcw } from "lucide-react"

export interface ReportColumn<T> {
  header: string
  /** Valeur brute utilisée pour l'affichage ET l'export PDF */
  value: (row: T) => string | number
  /** Rendu optionnel enrichi (badge, etc.) pour le tableau à l'écran */
  render?: (row: T) => React.ReactNode
  align?: "left" | "right" | "center"
  /** Additionne les valeurs de cette colonne dans une ligne "Total" */
  total?: boolean
  /** Unité affichée après le total (ex. "kg") */
  totalUnit?: string
}

interface ReportViewProps<T> {
  title: string
  subtitle?: string
  columns: ReportColumn<T>[]
  data: T[]
  /** Retourne la date de la ligne au format AAAA-MM-JJ */
  dateAccessor: (row: T) => string
  fileName: string
  /** Retourne la compagnie de la ligne — active le filtre Compagnie si fourni */
  companyAccessor?: (row: T) => string
}

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

export function ReportView<T>({
  title,
  subtitle,
  columns,
  data,
  dateAccessor,
  fileName,
  companyAccessor,
}: ReportViewProps<T>) {
  const [jour, setJour] = useState("all")
  const [mois, setMois] = useState("all")
  const [annee, setAnnee] = useState("all")
  const [compagnie, setCompagnie] = useState("all")

  // Années disponibles dans les données
  const annees = useMemo(() => {
    const set = new Set<string>()
    data.forEach((row) => {
      const d = dateAccessor(row)
      if (d) set.add(d.slice(0, 4))
    })
    return Array.from(set).sort().reverse()
  }, [data, dateAccessor])

  // Compagnies disponibles dans les données
  const compagnies = useMemo(() => {
    if (!companyAccessor) return []
    const set = new Set<string>()
    data.forEach((row) => {
      const c = companyAccessor(row)
      if (c) set.add(c)
    })
    return Array.from(set).sort()
  }, [data, companyAccessor])

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const d = dateAccessor(row)
      if (!d) return false
      const [y, m, j] = d.split("-")
      if (annee !== "all" && y !== annee) return false
      if (mois !== "all" && m !== mois) return false
      if (jour !== "all" && j !== jour.padStart(2, "0")) return false
      if (companyAccessor && compagnie !== "all" && companyAccessor(row) !== compagnie) return false
      return true
    })
  }, [data, dateAccessor, jour, mois, annee, companyAccessor, compagnie])

  // Totaux des colonnes marquées total
  const totals = useMemo(() => {
    const map: Record<string, number> = {}
    columns.forEach((c) => {
      if (c.total) {
        map[c.header] = filtered.reduce((sum, row) => sum + Number(c.value(row) || 0), 0)
      }
    })
    return map
  }, [columns, filtered])

  const hasTotals = columns.some((c) => c.total)

  const resetFilters = () => {
    setJour("all")
    setMois("all")
    setAnnee("all")
    setCompagnie("all")
  }

  const periodeLabel = useMemo(() => {
    const parts: string[] = []
    if (jour !== "all") parts.push(`Jour ${jour}`)
    if (mois !== "all") parts.push(MOIS[Number(mois) - 1])
    if (annee !== "all") parts.push(annee)
    return parts.length ? parts.join(" ") : "Toutes périodes"
  }, [jour, mois, annee])

  const handleExportPdf = async () => {
    const { default: jsPDF } = await import("jspdf")
    const autoTable = (await import("jspdf-autotable")).default

    const doc = new jsPDF({ orientation: "landscape" })
    doc.setFontSize(16)
    doc.text(title.toUpperCase(), 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(110)
    doc.text(`Période : ${periodeLabel}`, 14, 25)
    if (companyAccessor) {
      doc.text(`Compagnie : ${compagnie === "all" ? "Toutes" : compagnie}`, 14, 30)
    }
    const yOffset = companyAccessor ? 5 : 0
    doc.text(`Généré le : ${new Date().toLocaleDateString("fr-FR")}`, 14, 30 + yOffset)
    doc.text(`Total lignes : ${filtered.length}`, 14, 35 + yOffset)

    const footRow = hasTotals
      ? [
          columns.map((c, i) => {
            if (c.total) {
              return `${totals[c.header].toLocaleString("fr-FR")}${c.totalUnit ? " " + c.totalUnit : ""}`
            }
            return i === 0 ? "TOTAL" : ""
          }),
        ]
      : undefined

    autoTable(doc, {
      startY: 40 + yOffset,
      head: [columns.map((c) => c.header)],
      body: filtered.map((row) => columns.map((c) => String(c.value(row)))),
      foot: footRow,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 47, 74], textColor: 255 },
      footStyles: { fillColor: [225, 230, 240], textColor: 20, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [244, 246, 250] },
    })

    doc.save(`${fileName}.pdf`)
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      {/* En-tête du rapport */}
      <div className="relative border-b border-border p-6">
        <Button onClick={handleExportPdf} className="absolute right-4 top-4 shrink-0">
          <FileDown className="size-4" />
          Exporter en PDF
        </Button>

        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-wide text-foreground text-balance sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-base text-muted-foreground text-pretty">{subtitle}</p>
          ) : null}
          <p className="mt-1 text-base font-medium text-foreground">
            Période : <span className="font-bold">{periodeLabel}</span> ·{" "}
            {filtered.length} ligne{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filtres jour / mois / année */}
      <div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/40 p-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Jour</Label>
          <Select value={jour} onValueChange={setJour}>
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue placeholder="Tous">{jour === "all" ? "Tous" : jour}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {Array.from({ length: 31 }).map((_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Mois</Label>
          <Select value={mois} onValueChange={setMois}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Tous">
                {mois === "all" ? "Tous" : MOIS[Number(mois) - 1]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {MOIS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Année</Label>
          <Select value={annee} onValueChange={setAnnee}>
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue placeholder="Toutes">{annee === "all" ? "Toutes" : annee}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {annees.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {companyAccessor ? (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Compagnie</Label>
            <Select value={compagnie} onValueChange={setCompagnie}>
              <SelectTrigger className="w-[190px] bg-background">
                <SelectValue placeholder="Toutes">
                  {compagnie === "all" ? "Toutes" : compagnie}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {compagnies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <Button variant="outline" onClick={resetFilters} className="ml-auto">
          <RotateCcw className="size-4" />
          Réinitialiser
        </Button>
      </div>

      {/* Tableau détaillé */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60">
              <TableHead className="w-12 text-xs">N°</TableHead>
              {columns.map((c) => (
                <TableHead
                  key={c.header}
                  className={
                    c.align === "right"
                      ? "text-right text-xs"
                      : c.align === "center"
                        ? "text-center text-xs"
                        : "text-xs"
                  }
                >
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                  Aucune donnée pour cette période.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                  {columns.map((c) => (
                    <TableCell
                      key={c.header}
                      className={
                        c.align === "right"
                          ? "text-right tabular-nums"
                          : c.align === "center"
                            ? "text-center"
                            : ""
                      }
                    >
                      {c.render ? c.render(row) : c.value(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {hasTotals && filtered.length > 0 ? (
            <tfoot>
              <TableRow className="border-t-2 border-border bg-muted/60 font-semibold">
                <TableCell className="text-xs uppercase tracking-wide">Total</TableCell>
                {columns.map((c) => (
                  <TableCell
                    key={c.header}
                    className={
                      c.align === "right"
                        ? "text-right tabular-nums"
                        : c.align === "center"
                          ? "text-center tabular-nums"
                          : ""
                    }
                  >
                    {c.total
                      ? `${totals[c.header].toLocaleString("fr-FR")}${c.totalUnit ? " " + c.totalUnit : ""}`
                      : ""}
                  </TableCell>
                ))}
              </TableRow>
            </tfoot>
          ) : null}
        </Table>
      </div>
    </section>
  )
}
