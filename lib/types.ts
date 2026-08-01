// Types partagés pour le système de gestion des stocks de dépôt de fret

export type StatutEntree = "en_attente" | "en_stock" | "sorti" | "bloque"
export type StatutSortie = "en_attente" | "validee" | "annulee"
export type StatutGenerique = "actif" | "inactif"

export interface EntreeFret {
  id: string
  awb: string
  numeroColis: string
  compagnie: string
  vol: string
  provenance: string
  destination: string
  expediteur: string
  destinataire: string
  dateArrivee: string
  nombreColis: number
  poids: number
  depot: string
  zone: string
  emplacement: string
  statut: StatutEntree
  description: string
}

export interface StockItem {
  id: string
  awb: string
  colis: string
  description: string
  quantite: number
  poids: number
  depot: string
  zone: string
  emplacement: string
  dureeStockage?: number // en jours (calculé à partir de createdAt si absent)
  statut: StatutEntree
  createdAt?: string
  updatedAt?: string
}

export interface Depot {
  id: string
  nom: string
  adresse: string
  responsable: string
  capacite: number
  occupation: number
  statut: StatutGenerique
}

export interface Zone {
  id: string
  nom: string
  depot: string
  capacite: number
  nombreColis: number
}

export interface Emplacement {
  id: string
  zone: string
  rayon: string
  position: string
  capacite: number
  occupe: number
}

export interface SortieFret {
  id: string
  awb: string
  colis: string
  destinataire: string
  date: string
  heure: string
  agent: string
  motif: string
  statut: StatutSortie
}

export interface LigneInventaire {
  colis: string
  awb: string
  emplacement: string
  quantiteTheorique: number
  quantitePhysique: number | null
  ecart: number
}

export interface SessionInventaire {
  id: string
  reference: string
  depot: string
  dateDebut: string
  dateFin: string | null
  responsable: string
  statut: "en_cours" | "termine" | "planifie"
  articlesVerifies: number
  articlesTotal: number
  ecarts: number
  lignes: LigneInventaire[]
}

export interface Mouvement {
  id: string
  date: string
  heure: string
  awb: string
  colis: string
  ancienEmplacement: string
  nouvelEmplacement: string
  type: "entree" | "sortie" | "transfert" | "ajustement"
  utilisateur: string
  depot: string
  zone: string
}

export interface Utilisateur {
  id: string
  nom: string
  email: string
  role: "admin" | "responsable" | "agent" | "consultation"
  depot: string
  statut: StatutGenerique
  dernierAcces: string
}

export interface Compagnie {
  id: string
  nom: string
  code: string
  pays: string
  statut: StatutGenerique
}

export interface Activite {
  id: string
  type: "entree" | "sortie" | "mouvement" | "inventaire" | "utilisateur"
  description: string
  utilisateur: string
  temps: string
}

export interface RapportDepassement {
  id: string
  awb: string
  colis: string
  compagnie: string
  depot: string
  dateArrivee: string
  joursStockage: number
  seuil: number
}
