import { collectionHandlers } from "@/lib/api-crud"
import { Depot } from "@/lib/models"

export const { GET, POST } = collectionHandlers(Depot)
