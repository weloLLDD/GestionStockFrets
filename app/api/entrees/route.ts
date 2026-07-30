import { collectionHandlers } from "@/lib/api-crud"
import { Entree } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Entree)
