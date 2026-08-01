"use client"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useCollection } from "@/lib/use-api"
import type { StockItem, Zone } from "@/lib/types"
import { Boxes, Weight, AlertTriangle, Clock } from "lucide-react"

// Calcule la durée de stockage (en jours) à partir des données MongoDB.
// Utilise dureeStockage si présent, sinon la date de création (createdAt).
function getDureeStockage(s: StockItem): number {
  if (typeof s.dureeStockage === "number") return s.dureeStockage
  if (s.createdAt) {
    const jours = Math.floor((Date.now() - new Date(s.createdAt).getTime()) / 86_400_000)
    return jours >= 0 ? jours : 0
  }
  return 0
}

export default function StocksPage() {
  const { data: stocks } = useCollection<StockItem>("stocks")
  const { data: zones } = useCollection<Zone>("zones")

  const stocksAvecDuree = stocks.map((s) => ({ ...s, dureeStockage: getDureeStockage(s) }))

  const enStock = stocksAvecDuree.filter((s) => s.statut === "en_stock").length
  const poidsTotal = Math.round(stocksAvecDuree.reduce((acc, s) => acc + (s.poids ?? 0), 0))
  const bloques = stocksAvecDuree.filter((s) => s.statut === "bloque").length
  const anciens = stocksAvecDuree.filter((s) => s.dureeStockage > 30).length

  const columns: Column<StockItem>[] = [
    { key: "awb", header: "AWB", render: (r) => <span className="font-mono text-xs">{r.awb}</span> },
    { key: "colis", header: "Colis", render: (r) => <span className="font-medium">{r.colis}</span> },
    { key: "description", header: "Marchandise" },
    { key: "quantite", header: "Qté", render: (r) => r.quantite },
    { key: "poids", header: "Poids", render: (r) => `${r.poids} kg` },
    { key: "zone", header: "Zone", render: (r) => <span className="text-muted-foreground">{r.zone}</span> },
    { key: "emplacement", header: "Emplacement", render: (r) => <span className="font-mono text-xs">{r.emplacement}</span> },
    {
      key: "dureeStockage",
      header: "Durée",
      render: (r) => (
        <span className={r.dureeStockage > 30 ? "font-medium text-destructive" : ""}>
          {r.dureeStockage} j
        </span>
      ),
    },
    { key: "statut", header: "Statut", render: (r) => <StatusBadge status={r.statut} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Gestion des Stocks"
        description="État en temps réel des colis présents dans les dépôts."
        breadcrumb={[{ label: "Opérations" }, { label: "Gestion des Stocks" }]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Colis en stock" value={enStock} icon={Boxes} tone="default" />
        <StatCard label="Poids total" value={`${poidsTotal} kg`} icon={Weight} tone="info" />
        <StatCard label="Colis bloqués" value={bloques} icon={AlertTriangle} tone="danger" />
        <StatCard label="Stockage > 30 j" value={anciens} icon={Clock} tone="warning" />
      </div>

      <DataTable
        columns={columns}
        data={stocksAvecDuree}
        searchKeys={["awb", "colis", "description", "emplacement"]}
        searchPlaceholder="Rechercher par AWB, colis, marchandise..."
        filters={[
          {
            key: "statut",
            label: "Statut",
            options: [
              { value: "en_stock", label: "En stock" },
              { value: "en_attente", label: "En attente" },
              { value: "bloque", label: "Bloqué" },
            ],
          },
          { key: "zone", label: "Zone", options: zones.map((z) => ({ value: z.nom, label: z.nom })) },
        ]}
        emptyMessage="Aucun colis en stock."
      />
    </div>
  )
}
