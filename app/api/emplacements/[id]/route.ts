import { itemHandlers } from "@/lib/api-crud"
import { Emplacement } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Emplacement)
