import { itemHandlers } from "@/lib/api-crud"
import { Compagnie } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Compagnie)
