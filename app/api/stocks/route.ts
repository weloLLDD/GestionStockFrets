import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Entree, Sortie } from "@/lib/models"

/**
 * Gestion des Stocks = vue CALCULÉE (pas de saisie manuelle).
 *
 * Règle métier :
 *  - Chaque entrée de fret AJOUTE du stock (quantité = nombreColis).
 *  - Chaque sortie de fret validée RÉDUIT la quantité du colis correspondant.
 *  - Un colis n'apparaît en stock que si sa quantité restante > 0.
 *
 * Le stock est donc toujours synchronisé avec les entrées / sorties réelles
 * stockées dans MongoDB : une nouvelle entrée s'affiche aussitôt ici, et une
 * sortie fait diminuer le nombre.
 */
export async function GET() {
  try {
    await connectToDatabase()

    const [entrees, sorties] = await Promise.all([
      Entree.find().sort({ createdAt: -1 }).lean(),
      Sortie.find().lean(),
    ])

    // Nombre de sorties validées par colis (clé = awb||colis)
    const sortiesParColis = new Map<string, number>()
    for (const s of sorties as any[]) {
      if (s.statut !== "validee") continue
      const key = `${s.awb ?? ""}||${s.colis ?? ""}`
      sortiesParColis.set(key, (sortiesParColis.get(key) ?? 0) + 1)
    }

    // Regroupe les entrées par colis et calcule la quantité restante
    const stockParColis = new Map<string, any>()
    for (const e of entrees as any[]) {
      if (e.statut === "sorti") continue
      const key = `${e.awb ?? ""}||${e.numeroColis ?? ""}`
      const existing = stockParColis.get(key)
      if (existing) {
        existing.quantiteEntree += e.nombreColis ?? 0
        existing.poids += e.poids ?? 0
      } else {
        stockParColis.set(key, {
          id: String(e._id),
          awb: e.awb ?? "",
          colis: e.numeroColis ?? "",
          description: e.description ?? "",
          quantiteEntree: e.nombreColis ?? 0,
          poids: e.poids ?? 0,
          depot: e.depot ?? "",
          zone: e.zone ?? "",
          emplacement: e.emplacement ?? "",
          statut: e.statut ?? "en_stock",
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        })
      }
    }

    // Applique les sorties et ne garde que les colis avec quantité restante > 0
    const stocks = Array.from(stockParColis.entries())
      .map(([key, item]) => {
        const sorties = sortiesParColis.get(key) ?? 0
        const quantite = Math.max(0, item.quantiteEntree - sorties)
        const { quantiteEntree, ...rest } = item
        return { ...rest, quantite }
      })
      .filter((item) => item.quantite > 0)

    return NextResponse.json(stocks)
  } catch (err) {
    console.log("[v0] GET stocks (dérivés) error:", (err as Error).message)
    return NextResponse.json(
      { error: "Erreur lors du calcul des stocks." },
      { status: 500 },
    )
  }
}
