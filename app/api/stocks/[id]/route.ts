import { itemHandlers } from "@/lib/api-crud"
import { Stock } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Stock)
