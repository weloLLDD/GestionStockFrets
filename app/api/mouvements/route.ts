import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Entree, Sortie, Mouvement } from "@/lib/models"

/**
 * Les mouvements de stock sont dérivés des vraies opérations :
 *  - chaque Entrée de fret => un mouvement "entree"
 *  - chaque Sortie de fret => un mouvement "sortie"
 * On y ajoute aussi les mouvements « manuels » (transferts / ajustements)
 * stockés dans la collection Mouvement, afin de garder l'historique complet.
 * Résultat trié par date + heure décroissantes.
 */

function heureDepuisDate(d?: Date | string | null): string {
  if (!d) return "—"
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export async function GET() {
  try {
    await connectToDatabase()

    const [entrees, sorties, manuels] = await Promise.all([
      Entree.find().lean(),
      Sortie.find().lean(),
      Mouvement.find().lean(),
    ])

    // Index des entrées par (awb + colis) pour retrouver l'emplacement d'origine des sorties
    const parColis = new Map<string, (typeof entrees)[number]>()
    for (const e of entrees) {
      parColis.set(`${e.awb}::${e.numeroColis}`, e)
    }

    const mouvementsEntrees = entrees.map((e) => ({
      id: `mv-en-${e._id}`,
      date: e.dateArrivee || "",
      heure: heureDepuisDate((e as { createdAt?: Date }).createdAt),
      awb: e.awb || "",
      colis: e.numeroColis || "",
      type: "entree" as const,
      ancienEmplacement: "Réception",
      nouvelEmplacement: e.emplacement || "—",
      utilisateur: "Système",
      depot: e.depot || "",
      zone: e.zone || "",
    }))

    const mouvementsSorties = sorties.map((s) => {
      const origine = parColis.get(`${s.awb}::${s.colis}`)
      return {
        id: `mv-so-${s._id}`,
        date: s.date || "",
        heure: s.heure || heureDepuisDate((s as { createdAt?: Date }).createdAt),
        awb: s.awb || "",
        colis: s.colis || "",
        type: "sortie" as const,
        ancienEmplacement: origine?.emplacement || "—",
        nouvelEmplacement: "Expédié",
        utilisateur: s.agent || "Système",
        depot: origine?.depot || "",
        zone: origine?.zone || "",
      }
    })

    const mouvementsManuels = manuels.map((m) => ({
      id: `mv-mn-${m._id}`,
      date: m.date || "",
      heure: m.heure || "—",
      awb: m.awb || "",
      colis: m.colis || "",
      type: (m.type as "transfert" | "ajustement") || "ajustement",
      ancienEmplacement: m.ancienEmplacement || "—",
      nouvelEmplacement: m.nouvelEmplacement || "—",
      utilisateur: m.utilisateur || "Système",
      depot: m.depot || "",
      zone: m.zone || "",
    }))

    const tous = [...mouvementsEntrees, ...mouvementsSorties, ...mouvementsManuels]

    // Tri par date puis heure, du plus récent au plus ancien
    tous.sort((a, b) => {
      const cmp = (b.date || "").localeCompare(a.date || "")
      if (cmp !== 0) return cmp
      return (b.heure || "").localeCompare(a.heure || "")
    })

    return NextResponse.json(tous)
  } catch (err) {
    console.log("[v0] GET mouvements error:", (err as Error).message)
    return NextResponse.json({ error: "Erreur lors de la récupération des mouvements." }, { status: 500 })
  }
}
