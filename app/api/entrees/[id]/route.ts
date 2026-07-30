import { itemHandlers } from "@/lib/api-crud"
import { Entree } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Entree)
