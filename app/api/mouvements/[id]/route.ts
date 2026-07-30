import { itemHandlers } from "@/lib/api-crud"
import { Mouvement } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Mouvement)
