import mongoose, { Schema, model, models } from "mongoose"

/**
 * Options communes : convertit _id -> id et retire __v dans les réponses JSON,
 * afin que l'API renvoie la même forme que les types du frontend.
 */
const toJSONOptions = {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id
    delete ret._id
    return ret
  },
}

function makeSchema(definition: Record<string, unknown>) {
  const schema = new Schema(definition, { timestamps: true })
  schema.set("toJSON", toJSONOptions)
  return schema
}

// ---------- Entrées de fret ----------
const EntreeSchema = makeSchema({
  awb: { type: String, required: true },
  numeroColis: { type: String, required: true },
  description: String,
  compagnie: String,
  vol: String,
  provenance: String,
  destination: String,
  expediteur: String,
  destinataire: String,
  dateArrivee: String,
  nombreColis: { type: Number, default: 0 },
  poids: { type: Number, default: 0 },
  depot: String,
  zone: String,
  emplacement: String,
  statut: { type: String, default: "en_attente" },
})

// ---------- Sorties de fret ----------
const SortieSchema = makeSchema({
  awb: { type: String, required: true },
  colis: String,
  date: String,
  heure: String,
  destinataire: String,
  agent: String,
  motif: String,
  statut: { type: String, default: "en_attente" },
})

// ---------- Stocks ----------
const StockSchema = makeSchema({
  awb: String,
  colis: String,
  description: String,
  quantite: { type: Number, default: 0 },
  poids: { type: Number, default: 0 },
  depot: String,
  zone: String,
  emplacement: String,
  statut: { type: String, default: "en_stock" },
})

// ---------- Dépôts ----------
const DepotSchema = makeSchema({
  nom: { type: String, required: true },
  adresse: String,
  responsable: String,
  capacite: { type: Number, default: 0 },
  occupation: { type: Number, default: 0 },
  statut: { type: String, default: "actif" },
})

// ---------- Zones ----------
const ZoneSchema = makeSchema({
  nom: { type: String, required: true },
  depot: String,
  capacite: { type: Number, default: 0 },
  nombreColis: { type: Number, default: 0 },
})

// ---------- Emplacements ----------
const EmplacementSchema = makeSchema({
  zone: String,
  rayon: String,
  position: String,
  capacite: { type: Number, default: 0 },
  occupe: { type: Number, default: 0 },
})

// ---------- Mouvements ----------
const MouvementSchema = makeSchema({
  date: String,
  heure: String,
  awb: String,
  colis: String,
  type: String,
  ancienEmplacement: String,
  nouvelEmplacement: String,
  utilisateur: String,
  depot: String,
  zone: String,
})

// ---------- Inventaire ----------
const LigneInventaireSchema = new Schema(
  {
    colis: String,
    awb: String,
    emplacement: String,
    quantiteTheorique: { type: Number, default: 0 },
    quantitePhysique: { type: Number, default: null },
    ecart: { type: Number, default: 0 },
  },
  { _id: false },
)

const InventaireSchema = makeSchema({
  reference: { type: String, required: true },
  depot: String,
  dateDebut: String,
  dateFin: { type: String, default: null },
  responsable: String,
  articlesVerifies: { type: Number, default: 0 },
  articlesTotal: { type: Number, default: 0 },
  ecarts: { type: Number, default: 0 },
  statut: { type: String, default: "planifie" },
  lignes: {
    type: [
      {
        _id: false,
        colis: String,
        awb: String,
        emplacement: String,
        quantiteTheorique: Number,
        quantitePhysique: { type: Number, default: null },
        ecart: { type: Number, default: 0 },
      },
    ],
    default: [],
  },
})

// ---------- Utilisateurs ----------
const UtilisateurSchema = makeSchema({
  nom: { type: String, required: true },
  email: { type: String, required: true },
  role: String,
  depot: String,
  statut: { type: String, default: "actif" },
  dernierAcces: String,
})

// ---------- Compagnies ----------
const CompagnieSchema = makeSchema({
  nom: { type: String, required: true },
  code: String,
  pays: String,
  contact: String,
  telephone: String,
  statut: { type: String, default: "actif" },
})

export const Entree = models.Entree || model("Entree", EntreeSchema)
export const Sortie = models.Sortie || model("Sortie", SortieSchema)
export const Stock = models.Stock || model("Stock", StockSchema)
export const Depot = models.Depot || model("Depot", DepotSchema)
export const Zone = models.Zone || model("Zone", ZoneSchema)
export const Emplacement = models.Emplacement || model("Emplacement", EmplacementSchema)
export const Mouvement = models.Mouvement || model("Mouvement", MouvementSchema)
export const Inventaire = models.Inventaire || model("Inventaire", InventaireSchema)
export const Utilisateur = models.Utilisateur || model("Utilisateur", UtilisateurSchema)
export const Compagnie = models.Compagnie || model("Compagnie", CompagnieSchema)

// Registre pour un accès générique par nom de ressource
export const modelRegistry = {
  entrees: Entree,
  sorties: Sortie,
  stocks: Stock,
  depots: Depot,
  zones: Zone,
  emplacements: Emplacement,
  mouvements: Mouvement,
  inventaire: Inventaire,
  utilisateurs: Utilisateur,
  compagnies: Compagnie,
} as const

export type ResourceName = keyof typeof modelRegistry

export { mongoose }
