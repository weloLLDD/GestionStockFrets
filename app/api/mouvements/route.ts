import { collectionHandlers } from "@/lib/api-crud"
import { Mouvement } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Mouvement)
