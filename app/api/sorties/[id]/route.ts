import { itemHandlers } from "@/lib/api-crud"
import { Sortie } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Sortie)
