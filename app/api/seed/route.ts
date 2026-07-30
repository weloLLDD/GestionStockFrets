import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {
  Entree,
  Sortie,
  Stock,
  Depot,
  Zone,
  Emplacement,
  Mouvement,
  Inventaire,
  Utilisateur,
  Compagnie,
} from "@/lib/models"
import {
  entrees,
  sorties,
  stocks,
  depots,
  zones,
  emplacements,
  mouvements,
  sessionsInventaire,
  utilisateurs,
  compagnies,
} from "@/lib/mock-data"

// Retire l'id local des mocks pour laisser MongoDB générer les _id
function strip<T extends { id?: string }>(rows: T[]) {
  return rows.map(({ id, ...rest }) => rest)
}

async function seed() {
  await connectToDatabase()

  const results: Record<string, number> = {}

  const tasks: [string, any, any[]][] = [
    ["compagnies", Compagnie, compagnies],
    ["depots", Depot, depots],
    ["zones", Zone, zones],
    ["emplacements", Emplacement, emplacements],
    ["entrees", Entree, entrees],
    ["sorties", Sortie, sorties],
    ["stocks", Stock, stocks],
    ["mouvements", Mouvement, mouvements],
    ["inventaire", Inventaire, sessionsInventaire],
    ["utilisateurs", Utilisateur, utilisateurs],
  ]

  for (const [name, model, data] of tasks) {
    await model.deleteMany({})
    const inserted = await model.insertMany(strip(data))
    results[name] = inserted.length
  }

  return results
}

export async function GET() {
  try {
    const results = await seed()
    return NextResponse.json({ success: true, message: "Base de données initialisée.", results })
  } catch (err) {
    console.log("[v0] Seed error:", (err as Error).message)
    return NextResponse.json({ error: "Échec de l'initialisation.", detail: (err as Error).message }, { status: 500 })
  }
}

export const POST = GET
