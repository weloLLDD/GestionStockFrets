import { collectionHandlers } from "@/lib/api-crud"
import { Sortie } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Sortie)
