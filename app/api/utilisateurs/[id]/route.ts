import { itemHandlers } from "@/lib/api-crud"
import { Utilisateur } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Utilisateur)
