import { collectionHandlers } from "@/lib/api-crud"
import { Utilisateur } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Utilisateur)
