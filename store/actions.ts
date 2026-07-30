// Redux Classic - Action Creators + Thunks (API MongoDB)
import * as C from "./constants"
import type { EntreeFret, SortieFret, Depot, Utilisateur, Compagnie } from "@/lib/types"
import type { AppThunk } from "./store"
import { api } from "@/lib/api-client"

let notifCounter = 0

// --- Actions d'hydratation (remplissent l'état depuis l'API) ---
export const setEntrees = (rows: EntreeFret[]) => ({ type: C.ENTREE_SET, payload: rows })
export const setSorties = (rows: SortieFret[]) => ({ type: C.SORTIE_SET, payload: rows })
export const setDepots = (rows: Depot[]) => ({ type: C.DEPOT_SET, payload: rows })
export const setUsers = (rows: Utilisateur[]) => ({ type: C.USER_SET, payload: rows })
export const setCompagnies = (rows: Compagnie[]) => ({ type: C.COMPAGNIE_SET, payload: rows })

// Entrées
export const addEntree = (entree: EntreeFret) => ({ type: C.ENTREE_ADD, payload: entree })
export const updateEntree = (entree: EntreeFret) => ({ type: C.ENTREE_UPDATE, payload: entree })
export const deleteEntree = (id: string) => ({ type: C.ENTREE_DELETE, payload: id })

// Sorties
export const addSortie = (sortie: SortieFret) => ({ type: C.SORTIE_ADD, payload: sortie })
export const updateSortie = (sortie: SortieFret) => ({ type: C.SORTIE_UPDATE, payload: sortie })
export const deleteSortie = (id: string) => ({ type: C.SORTIE_DELETE, payload: id })
export const validerSortie = (id: string) => ({ type: C.SORTIE_VALIDER, payload: id })
export const annulerSortie = (id: string) => ({ type: C.SORTIE_ANNULER, payload: id })

// Dépôts
export const addDepot = (depot: Depot) => ({ type: C.DEPOT_ADD, payload: depot })
export const updateDepot = (depot: Depot) => ({ type: C.DEPOT_UPDATE, payload: depot })
export const deleteDepot = (id: string) => ({ type: C.DEPOT_DELETE, payload: id })

// Utilisateurs
export const addUser = (user: Utilisateur) => ({ type: C.USER_ADD, payload: user })
export const updateUser = (user: Utilisateur) => ({ type: C.USER_UPDATE, payload: user })
export const toggleUser = (id: string) => ({ type: C.USER_TOGGLE, payload: id })

// Compagnies
export const addCompagnie = (compagnie: Compagnie) => ({ type: C.COMPAGNIE_ADD, payload: compagnie })
export const updateCompagnie = (compagnie: Compagnie) => ({ type: C.COMPAGNIE_UPDATE, payload: compagnie })
export const deleteCompagnie = (id: string) => ({ type: C.COMPAGNIE_DELETE, payload: id })

// Notifications
export const addNotif = (message: string, variant: "success" | "error" | "warning" | "info" = "info") => ({
  type: C.NOTIF_ADD,
  payload: { id: `n${Date.now()}-${notifCounter++}`, message, variant },
})
export const removeNotif = (id: string) => ({ type: C.NOTIF_REMOVE, payload: id })

// Sidebar
export const toggleSidebar = () => ({ type: C.SIDEBAR_TOGGLE })

// =====================================================================
// THUNKS — communication avec l'API MongoDB puis mise à jour du store
// =====================================================================

const setters = {
  entrees: setEntrees,
  sorties: setSorties,
  depots: setDepots,
  utilisateurs: setUsers,
  compagnies: setCompagnies,
} as const

type Resource = keyof typeof setters

// Charge une ressource depuis l'API et hydrate le store
export const fetchResource =
  (resource: Resource): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const rows = await api.list(resource)
      dispatch(setters[resource](rows) as never)
    } catch (err) {
      dispatch(addNotif(`Chargement ${resource} impossible : ${(err as Error).message}`, "error"))
    }
  }

// Charge toutes les ressources gérées par le store
export const fetchAll = (): AppThunk<Promise<void>> => async (dispatch) => {
  await Promise.all([
    dispatch(fetchResource("compagnies")),
    dispatch(fetchResource("depots")),
    dispatch(fetchResource("entrees")),
    dispatch(fetchResource("sorties")),
    dispatch(fetchResource("utilisateurs")),
  ])
}

// --- Entrées (API) ---
export const createEntree =
  (data: Omit<EntreeFret, "id">): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const created = await api.create("entrees", data)
    dispatch(addEntree(created))
    dispatch(addNotif(`Entrée ${created.awb} enregistrée.`, "success"))
  }

export const editEntree =
  (id: string, data: Partial<EntreeFret>): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const updated = await api.update("entrees", id, data)
    dispatch(updateEntree(updated))
    dispatch(addNotif(`Entrée ${updated.awb} mise à jour.`, "success"))
  }

export const removeEntree =
  (id: string, awb: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await api.remove("entrees", id)
    dispatch(deleteEntree(id))
    dispatch(addNotif(`Entrée ${awb} supprimée.`, "info"))
  }

// --- Sorties (API) ---
export const createSortie =
  (data: Omit<SortieFret, "id">): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const created = await api.create("sorties", data)
    dispatch(addSortie(created))
    dispatch(addNotif(`Sortie ${created.awb} enregistrée.`, "success"))
  }

export const editSortie =
  (id: string, data: Partial<SortieFret>): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const updated = await api.update("sorties", id, data)
    dispatch(updateSortie(updated))
    dispatch(addNotif(`Sortie ${updated.awb} mise à jour.`, "success"))
  }

export const removeSortie =
  (id: string, awb: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await api.remove("sorties", id)
    dispatch(deleteSortie(id))
    dispatch(addNotif(`Sortie ${awb} supprimée.`, "info"))
  }

export const changeSortieStatut =
  (id: string, statut: "validee" | "annulee"): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const updated = await api.update("sorties", id, { statut })
    dispatch(updateSortie(updated))
    dispatch(addNotif(statut === "validee" ? "Sortie validée." : "Sortie annulée.", statut === "validee" ? "success" : "warning"))
  }

// --- Dépôts (API) ---
export const createDepot =
  (data: Omit<Depot, "id">): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const created = await api.create("depots", data)
    dispatch(addDepot(created))
    dispatch(addNotif(`Dépôt ${created.nom} créé.`, "success"))
  }

export const editDepot =
  (id: string, data: Partial<Depot>): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const updated = await api.update("depots", id, data)
    dispatch(updateDepot(updated))
    dispatch(addNotif(`Dépôt ${updated.nom} mis à jour.`, "success"))
  }

export const removeDepot =
  (id: string, nom: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await api.remove("depots", id)
    dispatch(deleteDepot(id))
    dispatch(addNotif(`Dépôt ${nom} supprimé.`, "info"))
  }

// --- Utilisateurs (API) ---
export const createUser =
  (data: Omit<Utilisateur, "id">): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const created = await api.create("utilisateurs", data)
    dispatch(addUser(created))
    dispatch(addNotif(`Utilisateur ${created.nom} ajouté.`, "success"))
  }

export const editUser =
  (id: string, data: Partial<Utilisateur>): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const updated = await api.update("utilisateurs", id, data)
    dispatch(updateUser(updated))
    dispatch(addNotif(`Utilisateur ${updated.nom} mis à jour.`, "success"))
  }

export const toggleUserStatut =
  (id: string, current: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const statut = current === "actif" ? "inactif" : "actif"
    const updated = await api.update("utilisateurs", id, { statut })
    dispatch(updateUser(updated))
    dispatch(addNotif(`Utilisateur ${statut === "actif" ? "activé" : "désactivé"}.`, "info"))
  }

// --- Compagnies (API) ---
export const createCompagnie =
  (data: Omit<Compagnie, "id">): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const created = await api.create("compagnies", data)
    dispatch(addCompagnie(created))
    dispatch(addNotif(`Compagnie ${created.nom} ajoutée.`, "success"))
  }

export const editCompagnie =
  (id: string, data: Partial<Compagnie>): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const updated = await api.update("compagnies", id, data)
    dispatch(updateCompagnie(updated))
    dispatch(addNotif(`Compagnie ${updated.nom} mise à jour.`, "success"))
  }

export const removeCompagnie =
  (id: string, nom: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await api.remove("compagnies", id)
    dispatch(deleteCompagnie(id))
    dispatch(addNotif(`Compagnie ${nom} supprimée.`, "info"))
  }
