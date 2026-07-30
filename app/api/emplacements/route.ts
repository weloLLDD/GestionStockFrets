import { collectionHandlers } from "@/lib/api-crud"
import { Emplacement } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Emplacement)
