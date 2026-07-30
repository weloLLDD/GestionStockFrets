import { collectionHandlers } from "@/lib/api-crud"
import { Zone } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Zone)
