import { collectionHandlers } from "@/lib/api-crud"
import { Stock } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Stock)
