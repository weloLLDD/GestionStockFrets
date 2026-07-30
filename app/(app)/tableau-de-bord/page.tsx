"use client"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { useAppSelector } from "@/store/hooks"
import { stocks, rapportsDepassement, depots } from "@/lib/mock-data"
import { Boxes, PackagePlus, PackageMinus, AlertTriangle, Warehouse, Users } from "lucide-react"

export default function DashboardPage() {
  const entrees = useAppSelector((s) => s.entrees)
  const sorties = useAppSelector((s) => s.sorties)
  const utilisateurs = useAppSelector((s) => s.utilisateurs)

  const enStock = stocks.filter((s) => s.statut === "en_stock").length
  const capaciteTotale = depots.reduce((acc, d) => acc + d.capacite, 0)
  const occupationTotale = depots.reduce((acc, d) => acc + d.occupation, 0)
  const tauxOccupation = Math.round((occupationTotale / capaciteTotale) * 100)

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble des opérations de stockage et de fret."
        breadcrumb={[{ label: "Tableau de bord" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Colis en stock" value={enStock} icon={Boxes} trend="Total en entrepôt" tone="default" />
        <StatCard label="Entrées enregistrées" value={entrees.length} icon={PackagePlus} trend="Toutes périodes" tone="success" />
        <StatCard label="Sorties enregistrées" value={sorties.length} icon={PackageMinus} trend="Toutes périodes" tone="info" />
        <StatCard label="Dépassements de délai" value={rapportsDepassement.length} icon={AlertTriangle} trend="Au-delà du seuil" tone="danger" />
        <StatCard label="Taux d'occupation" value={`${tauxOccupation}%`} icon={Warehouse} trend={`${occupationTotale} / ${capaciteTotale} emplacements`} tone="warning" />
        <StatCard label="Utilisateurs actifs" value={utilisateurs.filter((u) => u.statut === "actif").length} icon={Users} trend={`${utilisateurs.length} au total`} tone="default" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
