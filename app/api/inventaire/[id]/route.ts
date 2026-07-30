import { itemHandlers } from "@/lib/api-crud"
import { Inventaire } from "@/lib/models"

export const { GET, PUT, DELETE } = itemHandlers(Inventaire)
