import { collectionHandlers } from "@/lib/api-crud"
import { Inventaire } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Inventaire)
