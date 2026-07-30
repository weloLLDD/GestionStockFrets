// Redux Classic - Reducers
import { combineReducers } from "redux"
import type { AnyAction } from "redux"
import * as C from "./constants"
import type { EntreeFret, SortieFret, Depot, Utilisateur, Compagnie } from "@/lib/types"

interface Notif {
  id: string
  message: string
  variant: "success" | "error" | "warning" | "info"
}

// --- Entrées ---
function entreesReducer(state: EntreeFret[] = [], action: AnyAction): EntreeFret[] {
  switch (action.type) {
    case C.ENTREE_SET:
      return action.payload
    case C.ENTREE_ADD:
      return [action.payload, ...state]
    case C.ENTREE_UPDATE:
      return state.map((e) => (e.id === action.payload.id ? action.payload : e))
    case C.ENTREE_DELETE:
      return state.filter((e) => e.id !== action.payload)
    default:
      return state
  }
}

// --- Sorties ---
function sortiesReducer(state: SortieFret[] = [], action: AnyAction): SortieFret[] {
  switch (action.type) {
    case C.SORTIE_SET:
      return action.payload
    case C.SORTIE_ADD:
      return [action.payload, ...state]
    case C.SORTIE_UPDATE:
      return state.map((s) => (s.id === action.payload.id ? action.payload : s))
    case C.SORTIE_DELETE:
      return state.filter((s) => s.id !== action.payload)
    case C.SORTIE_VALIDER:
      return state.map((s) => (s.id === action.payload ? { ...s, statut: "validee" } : s))
    case C.SORTIE_ANNULER:
      return state.map((s) => (s.id === action.payload ? { ...s, statut: "annulee" } : s))
    default:
      return state
  }
}

// --- Dépôts ---
function depotsReducer(state: Depot[] = [], action: AnyAction): Depot[] {
  switch (action.type) {
    case C.DEPOT_SET:
      return action.payload
    case C.DEPOT_ADD:
      return [action.payload, ...state]
    case C.DEPOT_UPDATE:
      return state.map((d) => (d.id === action.payload.id ? action.payload : d))
    case C.DEPOT_DELETE:
      return state.filter((d) => d.id !== action.payload)
    default:
      return state
  }
}

// --- Utilisateurs ---
function utilisateursReducer(state: Utilisateur[] = [], action: AnyAction): Utilisateur[] {
  switch (action.type) {
    case C.USER_SET:
      return action.payload
    case C.USER_ADD:
      return [action.payload, ...state]
    case C.USER_UPDATE:
      return state.map((u) => (u.id === action.payload.id ? action.payload : u))
    case C.USER_TOGGLE:
      return state.map((u) =>
        u.id === action.payload ? { ...u, statut: u.statut === "actif" ? "inactif" : "actif" } : u,
      )
    default:
      return state
  }
}

// --- Compagnies ---
function compagniesReducer(state: Compagnie[] = [], action: AnyAction): Compagnie[] {
  switch (action.type) {
    case C.COMPAGNIE_SET:
      return action.payload
    case C.COMPAGNIE_ADD:
      return [action.payload, ...state]
    case C.COMPAGNIE_UPDATE:
      return state.map((c) => (c.id === action.payload.id ? action.payload : c))
    case C.COMPAGNIE_DELETE:
      return state.filter((c) => c.id !== action.payload)
    default:
      return state
  }
}

// --- Notifications ---
function notifsReducer(state: Notif[] = [], action: AnyAction): Notif[] {
  switch (action.type) {
    case C.NOTIF_ADD:
      return [...state, action.payload]
    case C.NOTIF_REMOVE:
      return state.filter((n) => n.id !== action.payload)
    default:
      return state
  }
}

// --- UI ---
function uiReducer(state = { sidebarOpen: true }, action: AnyAction) {
  switch (action.type) {
    case C.SIDEBAR_TOGGLE:
      return { ...state, sidebarOpen: !state.sidebarOpen }
    default:
      return state
  }
}

export const rootReducer = combineReducers({
  entrees: entreesReducer,
  sorties: sortiesReducer,
  depots: depotsReducer,
  utilisateurs: utilisateursReducer,
  compagnies: compagniesReducer,
  notifs: notifsReducer,
  ui: uiReducer,
})

export type RootState = ReturnType<typeof rootReducer>
