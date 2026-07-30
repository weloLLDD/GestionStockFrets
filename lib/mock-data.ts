import type {
  EntreeFret,
  StockItem,
  Depot,
  Zone,
  Emplacement,
  SortieFret,
  SessionInventaire,
  Mouvement,
  Utilisateur,
  Compagnie,
  Activite,
  RapportDepassement,
} from "./types"

export const compagnies: Compagnie[] = [
  { id: "c1", nom: "Air France Cargo", code: "AF", pays: "France", statut: "actif" },
  { id: "c2", nom: "Emirates SkyCargo", code: "EK", pays: "Émirats", statut: "actif" },
  { id: "c3", nom: "Lufthansa Cargo", code: "LH", pays: "Allemagne", statut: "actif" },
  { id: "c4", nom: "Qatar Airways Cargo", code: "QR", pays: "Qatar", statut: "actif" },
  { id: "c5", nom: "Turkish Cargo", code: "TK", pays: "Turquie", statut: "actif" },
  { id: "c6", nom: "Royal Air Maroc Cargo", code: "AT", pays: "Maroc", statut: "inactif" },
]

export const depots: Depot[] = [
  { id: "d1", nom: "Dépôt Central Nord", adresse: "Zone Fret 1, Aéroport CDG", responsable: "Karim Benali", capacite: 5000, occupation: 3820, statut: "actif" },
  { id: "d2", nom: "Dépôt Sud", adresse: "Zone Fret 3, Aéroport ORY", responsable: "Sophie Marchand", capacite: 3500, occupation: 2110, statut: "actif" },
  { id: "d3", nom: "Dépôt Est Transit", adresse: "Terminal Cargo Est", responsable: "Antoine Dupont", capacite: 2000, occupation: 1650, statut: "actif" },
  { id: "d4", nom: "Dépôt Réfrigéré", adresse: "Zone Périssables, CDG", responsable: "Nadia Cherif", capacite: 1200, occupation: 480, statut: "actif" },
  { id: "d5", nom: "Dépôt Annexe Ouest", adresse: "Hangar 12, Zone Ouest", responsable: "Luc Fontaine", capacite: 1500, occupation: 0, statut: "inactif" },
]

export const zones: Zone[] = [
  { id: "z1", nom: "Zone A - Standard", depot: "Dépôt Central Nord", capacite: 1500, nombreColis: 1180 },
  { id: "z2", nom: "Zone B - Volumineux", depot: "Dépôt Central Nord", capacite: 1200, nombreColis: 940 },
  { id: "z3", nom: "Zone C - Fragile", depot: "Dépôt Central Nord", capacite: 800, nombreColis: 520 },
  { id: "z4", nom: "Zone D - Standard", depot: "Dépôt Sud", capacite: 1400, nombreColis: 860 },
  { id: "z5", nom: "Zone E - Dangereux", depot: "Dépôt Sud", capacite: 600, nombreColis: 310 },
  { id: "z6", nom: "Zone F - Transit", depot: "Dépôt Est Transit", capacite: 1000, nombreColis: 820 },
  { id: "z7", nom: "Zone G - Froid positif", depot: "Dépôt Réfrigéré", capacite: 700, nombreColis: 290 },
  { id: "z8", nom: "Zone H - Froid négatif", depot: "Dépôt Réfrigéré", capacite: 500, nombreColis: 190 },
]

export const emplacements: Emplacement[] = [
  { id: "e1", zone: "Zone A - Standard", rayon: "R1", position: "P01", capacite: 20, occupe: 18 },
  { id: "e2", zone: "Zone A - Standard", rayon: "R1", position: "P02", capacite: 20, occupe: 12 },
  { id: "e3", zone: "Zone A - Standard", rayon: "R2", position: "P01", capacite: 20, occupe: 20 },
  { id: "e4", zone: "Zone B - Volumineux", rayon: "R1", position: "P01", capacite: 10, occupe: 6 },
  { id: "e5", zone: "Zone B - Volumineux", rayon: "R2", position: "P03", capacite: 10, occupe: 0 },
  { id: "e6", zone: "Zone C - Fragile", rayon: "R1", position: "P05", capacite: 15, occupe: 9 },
  { id: "e7", zone: "Zone D - Standard", rayon: "R3", position: "P02", capacite: 25, occupe: 25 },
  { id: "e8", zone: "Zone E - Dangereux", rayon: "R1", position: "P01", capacite: 8, occupe: 3 },
  { id: "e9", zone: "Zone F - Transit", rayon: "R2", position: "P04", capacite: 30, occupe: 22 },
  { id: "e10", zone: "Zone G - Froid positif", rayon: "R1", position: "P02", capacite: 12, occupe: 7 },
]

const compagnieNoms = compagnies.map((c) => c.nom)
const depotNoms = depots.map((d) => d.nom)
const provenances = ["Dubaï (DXB)", "Istanbul (IST)", "Frankfurt (FRA)", "Doha (DOH)", "New York (JFK)", "Shanghai (PVG)", "Casablanca (CMN)"]
const destinations = ["Paris (CDG)", "Lyon (LYS)", "Marseille (MRS)", "Bruxelles (BRU)", "Genève (GVA)", "Madrid (MAD)"]
const descriptions = ["Pièces automobiles", "Matériel électronique", "Produits pharmaceutiques", "Textile", "Denrées périssables", "Documents", "Équipement industriel", "Produits cosmétiques"]
const expediteurs = ["Bosch Automotive", "Samsung Electronics", "Pfizer Labs", "Zara Manufacturing", "FreshFarm Co", "DHL Documents", "Siemens Industry", "L'Oréal Group"]
const destinatairesEntree = ["TransLog SARL", "Global Distrib", "Pharma Express", "Mode & Co", "FreshFood Import", "TechParts Ltd", "MediCare France", "Cosmetica SA"]
const statutsEntree = ["en_stock", "en_attente", "sorti", "bloque"] as const

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0")
}

export const entrees: EntreeFret[] = Array.from({ length: 48 }).map((_, i) => {
  const comp = compagnieNoms[i % compagnieNoms.length]
  const zone = zones[i % zones.length]
  const emp = emplacements[i % emplacements.length]
  const day = (i % 28) + 1
  return {
    id: `en${i + 1}`,
    awb: `${100 + i}-${pad(10000000 + i * 137, 8)}`,
    numeroColis: `COL-${pad(i + 1)}`,
    compagnie: comp,
    vol: `${compagnies[i % compagnies.length].code}${200 + i}`,
    provenance: provenances[i % provenances.length],
    destination: destinations[i % destinations.length],
    expediteur: expediteurs[i % expediteurs.length],
    destinataire: destinatairesEntree[i % destinatairesEntree.length],
    dateArrivee: `2026-07-${pad(day, 2)}`,
    nombreColis: (i % 12) + 1,
    poids: Math.round((5 + (i % 20) * 3.7) * 10) / 10,
    depot: zone.depot,
    zone: zone.nom,
    emplacement: `${emp.rayon}-${emp.position}`,
    statut: statutsEntree[i % statutsEntree.length],
    description: descriptions[i % descriptions.length],
  }
})

export const stocks: StockItem[] = entrees
  .filter((e) => e.statut === "en_stock" || e.statut === "en_attente" || e.statut === "bloque")
  .map((e, i) => ({
    id: `st${i + 1}`,
    awb: e.awb,
    colis: e.numeroColis,
    description: e.description,
    quantite: e.nombreColis,
    poids: e.poids,
    zone: e.zone,
    emplacement: e.emplacement,
    dureeStockage: (i * 3 + 2) % 45,
    statut: e.statut,
  }))

const destinataires = ["TransLog SARL", "Global Distrib", "Pharma Express", "Mode & Co", "FreshFood Import", "TechParts Ltd", "MediCare France"]
const agents = ["Karim Benali", "Sophie Marchand", "Antoine Dupont", "Nadia Cherif", "Luc Fontaine"]
const motifs = ["Livraison client", "Transfert dépôt", "Retour expéditeur", "Dédouanement", "Réexpédition"]
const statutsSortie = ["validee", "en_attente", "annulee"] as const

export const sorties: SortieFret[] = Array.from({ length: 32 }).map((_, i) => ({
  id: `so${i + 1}`,
  awb: entrees[i % entrees.length].awb,
  colis: `COL-${pad((i % 48) + 1)}`,
  destinataire: destinataires[i % destinataires.length],
  date: `2026-07-${pad((i % 19) + 1, 2)}`,
  heure: `${pad(8 + (i % 10), 2)}:${pad((i * 7) % 60, 2)}`,
  agent: agents[i % agents.length],
  motif: motifs[i % motifs.length],
  statut: statutsSortie[i % statutsSortie.length],
}))

export const sessionsInventaire: SessionInventaire[] = [
  { id: "inv1", reference: "INV-2026-014", depot: "Dépôt Central Nord", dateDebut: "2026-07-15", dateFin: null, responsable: "Karim Benali", statut: "en_cours", articlesVerifies: 320, articlesTotal: 480, ecarts: 7 },
  { id: "inv2", reference: "INV-2026-013", depot: "Dépôt Sud", dateDebut: "2026-07-10", dateFin: "2026-07-12", responsable: "Sophie Marchand", statut: "termine", articlesVerifies: 260, articlesTotal: 260, ecarts: 3 },
  { id: "inv3", reference: "INV-2026-012", depot: "Dépôt Est Transit", dateDebut: "2026-07-05", dateFin: "2026-07-06", responsable: "Antoine Dupont", statut: "termine", articlesVerifies: 180, articlesTotal: 180, ecarts: 0 },
  { id: "inv4", reference: "INV-2026-015", depot: "Dépôt Réfrigéré", dateDebut: "2026-07-20", dateFin: null, responsable: "Nadia Cherif", statut: "planifie", articlesVerifies: 0, articlesTotal: 120, ecarts: 0 },
]

const typesMouvement = ["entree", "sortie", "transfert", "ajustement"] as const

export const mouvements: Mouvement[] = Array.from({ length: 40 }).map((_, i) => {
  const zone = zones[i % zones.length]
  return {
    id: `mv${i + 1}`,
    date: `2026-07-${pad((i % 19) + 1, 2)}`,
    heure: `${pad(7 + (i % 12), 2)}:${pad((i * 11) % 60, 2)}`,
    awb: entrees[i % entrees.length].awb,
    colis: `COL-${pad((i % 48) + 1)}`,
    ancienEmplacement: i % 4 === 0 ? "—" : `R${(i % 3) + 1}-P${pad((i % 5) + 1, 2)}`,
    nouvelEmplacement: `R${(i % 4) + 1}-P${pad((i % 6) + 1, 2)}`,
    type: typesMouvement[i % typesMouvement.length],
    utilisateur: agents[i % agents.length],
    depot: zone.depot,
    zone: zone.nom,
  }
})

export const utilisateurs: Utilisateur[] = [
  { id: "u1", nom: "Karim Benali", email: "k.benali@fretdepot.com", role: "admin", depot: "Dépôt Central Nord", statut: "actif", dernierAcces: "2026-07-19 09:12" },
  { id: "u2", nom: "Sophie Marchand", email: "s.marchand@fretdepot.com", role: "responsable", depot: "Dépôt Sud", statut: "actif", dernierAcces: "2026-07-19 08:45" },
  { id: "u3", nom: "Antoine Dupont", email: "a.dupont@fretdepot.com", role: "responsable", depot: "Dépôt Est Transit", statut: "actif", dernierAcces: "2026-07-18 17:30" },
  { id: "u4", nom: "Nadia Cherif", email: "n.cherif@fretdepot.com", role: "agent", depot: "Dépôt Réfrigéré", statut: "actif", dernierAcces: "2026-07-19 07:58" },
  { id: "u5", nom: "Luc Fontaine", email: "l.fontaine@fretdepot.com", role: "agent", depot: "Dépôt Annexe Ouest", statut: "inactif", dernierAcces: "2026-06-30 14:20" },
  { id: "u6", nom: "Emma Rousseau", email: "e.rousseau@fretdepot.com", role: "consultation", depot: "Dépôt Central Nord", statut: "actif", dernierAcces: "2026-07-17 11:05" },
  { id: "u7", nom: "Yassine Alaoui", email: "y.alaoui@fretdepot.com", role: "agent", depot: "Dépôt Sud", statut: "actif", dernierAcces: "2026-07-19 09:30" },
]

export const activites: Activite[] = [
  { id: "a1", type: "entree", description: "Nouvelle entrée AWB 124-10001644 (Emirates SkyCargo)", utilisateur: "Karim Benali", temps: "Il y a 5 min" },
  { id: "a2", type: "sortie", description: "Sortie validée pour TransLog SARL", utilisateur: "Sophie Marchand", temps: "Il y a 18 min" },
  { id: "a3", type: "mouvement", description: "Transfert Zone A vers Zone B (COL-032)", utilisateur: "Antoine Dupont", temps: "Il y a 42 min" },
  { id: "a4", type: "inventaire", description: "Session INV-2026-014 en cours au Dépôt Central Nord", utilisateur: "Karim Benali", temps: "Il y a 1 h" },
  { id: "a5", type: "utilisateur", description: "Nouvel utilisateur Yassine Alaoui ajouté", utilisateur: "Admin", temps: "Il y a 2 h" },
  { id: "a6", type: "entree", description: "Entrée AWB 118-10001151 en attente de contrôle", utilisateur: "Nadia Cherif", temps: "Il y a 3 h" },
  { id: "a7", type: "sortie", description: "Sortie annulée pour Global Distrib (motif douane)", utilisateur: "Antoine Dupont", temps: "Il y a 4 h" },
]

export const rapportsDepassement: RapportDepassement[] = stocks
  .filter((s) => s.dureeStockage > 30)
  .map((s, i) => ({
    id: `rd${i + 1}`,
    awb: s.awb,
    colis: s.colis,
    compagnie: compagnieNoms[i % compagnieNoms.length],
    depot: depotNoms[i % depotNoms.length],
    dateArrivee: `2026-06-${pad((i % 28) + 1, 2)}`,
    joursStockage: s.dureeStockage,
    seuil: 30,
  }))

// Séries pour les graphiques du dashboard
export const evolutionEntrees = [
  { mois: "Jan", entrees: 320 },
  { mois: "Fév", entrees: 298 },
  { mois: "Mar", entrees: 410 },
  { mois: "Avr", entrees: 385 },
  { mois: "Mai", entrees: 462 },
  { mois: "Juin", entrees: 510 },
  { mois: "Juil", entrees: 478 },
]

export const evolutionSorties = [
  { mois: "Jan", sorties: 290 },
  { mois: "Fév", sorties: 310 },
  { mois: "Mar", sorties: 375 },
  { mois: "Avr", sorties: 402 },
  { mois: "Mai", sorties: 430 },
  { mois: "Juin", sorties: 468 },
  { mois: "Juil", sorties: 455 },
]

export const stocksParCompagnie = compagnies.map((c, i) => ({
  compagnie: c.code,
  colis: [420, 360, 310, 280, 190, 90][i] ?? 100,
}))

export const stocksParDepot = depots.map((d) => ({
  depot: d.nom.replace("Dépôt ", ""),
  colis: d.occupation,
}))

export const occupationZones = zones.map((z) => ({
  zone: z.nom.split(" - ")[0],
  occupation: Math.round((z.nombreColis / z.capacite) * 100),
}))
