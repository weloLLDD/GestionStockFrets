import { collectionHandlers } from "@/lib/api-crud"
import { Compagnie } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Compagnie)
