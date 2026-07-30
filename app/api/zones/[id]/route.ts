import { itemHandlers } from "@/lib/api-crud"
import { Zone } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Zone)
