"use client"

import { PageHeader } from "@/components/shared/page-header"
import { ReportView, type ReportColumn } from "@/components/rapports/report-view"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { entrees, sorties, mouvements } from "@/lib/mock-data"
import type { EntreeFret, SortieFret, Mouvement } from "@/lib/types"

// Index des entrées par AWB pour retrouver nb colis / poids / compagnie
const entreeParAwb = new Map<string, EntreeFret>()
entrees.forEach((e) => {
  if (!entreeParAwb.has(e.awb)) entreeParAwb.set(e.awb, e)
})

// Date de référence pour le calcul de durée de stockage (frontend)
const AUJOURDHUI = new Date("2026-07-21")

function joursDepuis(dateStr: string): number {
  const d = new Date(dateStr)
  const diff = AUJOURDHUI.getTime() - d.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

// Classification de la durée de stockage
type ToneClass = "ok" | "info" | "warn" | "high" | "crit"
function classerDuree(jours: number): { label: string; tone: ToneClass } {
  if (jours <= 2) return { label: "0 à 2 jours", tone: "ok" }
  if (jours <= 7) return { label: "3 à 7 jours", tone: "info" }
  if (jours <= 15) return { label: "8 à 15 jours", tone: "warn" }
  if (jours <= 30) return { label: "16 à 30 jours", tone: "high" }
  return { label: "Plus de 30 jours", tone: "crit" }
}

const classeStyles: Record<ToneClass, string> = {
  ok: "bg-success/15 text-success border-success/30",
  info: "bg-info/15 text-info border-info/30",
  warn: "bg-warning/20 text-warning-foreground border-warning/40",
  high: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  crit: "bg-destructive/15 text-destructive border-destructive/30",
}

// ---- Rapport 1 : Entrées ----
const colonnesEntrees: ReportColumn<EntreeFret>[] = [
  { header: "Date", value: (r) => r.dateArrivee },
  { header: "AWB", value: (r) => r.awb },
  { header: "Colis", value: (r) => r.numeroColis },
  { header: "Compagnie", value: (r) => r.compagnie },
  { header: "Provenance", value: (r) => r.provenance },
  { header: "Dépôt", value: (r) => r.depot },
  { header: "Zone", value: (r) => r.zone },
  { header: "Nb colis", value: (r) => r.nombreColis, align: "right", total: true },
  { header: "Poids (kg)", value: (r) => r.poids, align: "right", total: true, totalUnit: "kg" },
  {
    header: "Statut",
    value: (r) => r.statut,
    render: (r) => <StatusBadge status={r.statut} />,
  },
]

// ---- Rapport 2 : Sorties ----
interface LigneSortie extends SortieFret {
  nombreColis: number
  poids: number
  compagnie: string
}

const donneesSorties: LigneSortie[] = sorties.map((s) => {
  const e = entreeParAwb.get(s.awb)
  return {
    ...s,
    nombreColis: e?.nombreColis ?? 0,
    poids: e?.poids ?? 0,
    compagnie: e?.compagnie ?? "—",
  }
})

const colonnesSorties: ReportColumn<LigneSortie>[] = [
  { header: "Date", value: (r) => r.date },
  { header: "Heure", value: (r) => r.heure },
  { header: "AWB", value: (r) => r.awb },
  { header: "Colis", value: (r) => r.colis },
  { header: "Compagnie", value: (r) => r.compagnie },
  { header: "Destinataire", value: (r) => r.destinataire },
  { header: "Agent", value: (r) => r.agent },
  { header: "Motif", value: (r) => r.motif },
  { header: "Nb colis", value: (r) => r.nombreColis, align: "right", total: true },
  { header: "Poids (kg)", value: (r) => r.poids, align: "right", total: true, totalUnit: "kg" },
  {
    header: "Statut",
    value: (r) => r.statut,
    render: (r) => <StatusBadge status={r.statut} />,
  },
]

// ---- Rapport 3 : Durée de stockage au dépôt ----
interface LigneDuree {
  awb: string
  colis: string
  compagnie: string
  zone: string
  dateArrivee: string
  jours: number
  statut: EntreeFret["statut"]
}

const donneesDuree: LigneDuree[] = entrees
  .filter((e) => e.statut === "en_stock" || e.statut === "en_attente" || e.statut === "bloque")
  .map((e) => ({
    awb: e.awb,
    colis: e.numeroColis,
    compagnie: e.compagnie,
    zone: e.zone,
    dateArrivee: e.dateArrivee,
    jours: joursDepuis(e.dateArrivee),
    statut: e.statut,
  }))
  .sort((a, b) => b.jours - a.jours)

const colonnesDuree: ReportColumn<LigneDuree>[] = [
  { header: "AWB", value: (r) => r.awb },
  { header: "Colis", value: (r) => r.colis },
  { header: "Arrivée", value: (r) => r.dateArrivee },
  {
    header: "Nombre de jours",
    value: (r) => r.jours,
    align: "right",
    render: (r) => (
      <span className={r.jours > 30 ? "font-semibold text-destructive tabular-nums" : "font-medium tabular-nums"}>
        {r.jours} j
      </span>
    ),
  },
  {
    header: "Classification",
    value: (r) => classerDuree(r.jours).label,
    render: (r) => {
      const c = classerDuree(r.jours)
      return (
        <Badge variant="outline" className={classeStyles[c.tone]}>
          {c.label}
        </Badge>
      )
    },
  },
  { header: "Zone", value: (r) => r.zone },
  {
    header: "Statut",
    value: (r) => r.statut,
    render: (r) => <StatusBadge status={r.statut} />,
  },
]

// ---- Rapport : Colis actuellement en dépôt ----
const enDepot: EntreeFret[] = entrees.filter(
  (e) => e.statut === "en_stock" || e.statut === "en_attente" || e.statut === "bloque",
)

const colonnesEnDepot: ReportColumn<EntreeFret>[] = [
  { header: "N° AWB", value: (r) => r.awb },
  { header: "N° Colis", value: (r) => r.numeroColis },
  { header: "Expéditeur", value: (r) => r.expediteur },
  { header: "Destinataire", value: (r) => r.destinataire },
  { header: "Compagnie", value: (r) => r.compagnie },
  { header: "Vol", value: (r) => r.vol },
  { header: "Nature du fret", value: (r) => r.description },
  { header: "Date arrivée", value: (r) => r.dateArrivee },
  {
    header: "Durée en dépôt",
    value: (r) => joursDepuis(r.dateArrivee),
    align: "right",
    render: (r) => <span className="tabular-nums">{joursDepuis(r.dateArrivee)} j</span>,
  },
  { header: "Emplacement (Zone / Rack)", value: (r) => `${r.zone} · ${r.emplacement}` },
  { header: "Nb colis", value: (r) => r.nombreColis, align: "right", total: true },
  { header: "Poids (kg)", value: (r) => r.poids, align: "right", total: true, totalUnit: "kg" },
  {
    header: "Statut",
    value: (r) => r.statut,
    render: (r) => <StatusBadge status={r.statut} />,
  },
]

// ---- Rapport : Traçabilité complète des mouvements ----
const OPERATIONS: Record<Mouvement["type"], string> = {
  entree: "Entrée",
  sortie: "Sortie",
  transfert: "Transfert",
  ajustement: "Ajustement",
}

const colonnesTracabilite: ReportColumn<Mouvement>[] = [
  { header: "Date", value: (r) => r.date },
  { header: "Heure", value: (r) => r.heure },
  { header: "AWB", value: (r) => r.awb },
  { header: "Colis", value: (r) => r.colis },
  { header: "Zone précédente", value: (r) => r.ancienEmplacement },
  { header: "Nouvelle zone", value: (r) => r.nouvelEmplacement },
  { header: "Opération", value: (r) => OPERATIONS[r.type] },
  { header: "Agent", value: (r) => r.utilisateur },
]

export default function RapportsPage() {
  return (
    <div>
      <PageHeader
        title="Rapports"
        description="Rapports détaillés des entrées, sorties et durées de stockage. Filtrage par jour, mois et année, export PDF."
        breadcrumb={[{ label: "Analyse" }, { label: "Rapports" }]}
      />

      <Tabs defaultValue="entrees" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="entrees">Rapport des entrées</TabsTrigger>
          <TabsTrigger value="sorties">Rapport des sorties</TabsTrigger>
          <TabsTrigger value="en-depot">Colis en dépôt</TabsTrigger>
          <TabsTrigger value="duree">Durée de stockage</TabsTrigger>
          <TabsTrigger value="tracabilite">Traçabilité</TabsTrigger>
        </TabsList>

        <TabsContent value="entrees" className="mt-4">
          <ReportView
            title="Rapport des entrées"
            subtitle="Liste détaillée des marchandises entrées en dépôt."
            columns={colonnesEntrees}
            data={entrees}
            dateAccessor={(r) => r.dateArrivee}
            companyAccessor={(r) => r.compagnie}
            fileName="rapport-entrees"
          />
        </TabsContent>

        <TabsContent value="sorties" className="mt-4">
          <ReportView
            title="Rapport des sorties"
            subtitle="Liste détaillée des marchandises sorties du dépôt."
            columns={colonnesSorties}
            data={donneesSorties}
            dateAccessor={(r) => r.date}
            companyAccessor={(r) => r.compagnie}
            fileName="rapport-sorties"
          />
        </TabsContent>

        <TabsContent value="en-depot" className="mt-4">
          <ReportView
            title="Colis actuellement en dépôt"
            subtitle="Liste de tous les colis présents dans le dépôt, avec totaux du nombre de colis et du poids."
            columns={colonnesEnDepot}
            data={enDepot}
            dateAccessor={(r) => r.dateArrivee}
            companyAccessor={(r) => r.compagnie}
            fileName="rapport-colis-en-depot"
          />
        </TabsContent>

        <TabsContent value="duree" className="mt-4">
          <ReportView
            title="Rapport durée de stockage"
            subtitle="Identifie les colis restant trop longtemps en dépôt et ceux qui risquent des frais de magasinage (classés par tranches de durée)."
            columns={colonnesDuree}
            data={donneesDuree}
            dateAccessor={(r) => r.dateArrivee}
            companyAccessor={(r) => r.compagnie}
            fileName="rapport-duree-stockage"
          />
        </TabsContent>

        <TabsContent value="tracabilite" className="mt-4">
          <ReportView
            title="Rapport de traçabilité complète"
            subtitle="Historique de chaque mouvement des colis : entrées, sorties, transferts et ajustements."
            columns={colonnesTracabilite}
            data={mouvements}
            dateAccessor={(r) => r.date}
            fileName="rapport-tracabilite"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
