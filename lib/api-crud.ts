import { NextResponse } from "next/server"
import type { Model } from "mongoose"
import { connectToDatabase } from "./mongodb"

/**
 * Fabrique des handlers CRUD génériques pour un modèle Mongoose donné.
 * Utilisé par les routes de collection (GET liste, POST création)
 * et les routes d'élément (GET un, PUT, DELETE).
 */
export function collectionHandlers(model: Model<any>) {
  async function GET() {
    try {
      await connectToDatabase()
      const docs = await model.find().sort({ createdAt: -1 })
      return NextResponse.json(docs)
    } catch (err) {
      console.log("[v0] GET collection error:", (err as Error).message)
      return NextResponse.json({ error: "Erreur lors de la récupération des données." }, { status: 500 })
    }
  }

  async function POST(request: Request) {
    try {
      await connectToDatabase()
      const body = await request.json()
      const created = await model.create(body)
      return NextResponse.json(created, { status: 201 })
    } catch (err) {
      console.log("[v0] POST collection error:", (err as Error).message)
      return NextResponse.json({ error: "Erreur lors de la création." }, { status: 400 })
    }
  }

  return { GET, POST }
}

export function itemHandlers(model: Model<any>) {
  async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
      await connectToDatabase()
      const { id } = await ctx.params
      const doc = await model.findById(id)
      if (!doc) return NextResponse.json({ error: "Introuvable." }, { status: 404 })
      return NextResponse.json(doc)
    } catch (err) {
      console.log("[v0] GET item error:", (err as Error).message)
      return NextResponse.json({ error: "Erreur." }, { status: 500 })
    }
  }

  async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
      await connectToDatabase()
      const { id } = await ctx.params
      const body = await request.json()
      const updated = await model.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      if (!updated) return NextResponse.json({ error: "Introuvable." }, { status: 404 })
      return NextResponse.json(updated)
    } catch (err) {
      console.log("[v0] PUT item error:", (err as Error).message)
      return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 400 })
    }
  }

  async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
      await connectToDatabase()
      const { id } = await ctx.params
      const deleted = await model.findByIdAndDelete(id)
      if (!deleted) return NextResponse.json({ error: "Introuvable." }, { status: 404 })
      return NextResponse.json({ success: true, id })
    } catch (err) {
      console.log("[v0] DELETE item error:", (err as Error).message)
      return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 })
    }
  }

  return { GET, PUT, DELETE }
}
