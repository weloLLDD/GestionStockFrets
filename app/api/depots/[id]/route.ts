import { itemHandlers } from "@/lib/api-crud"
import { Depot } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Depot)
