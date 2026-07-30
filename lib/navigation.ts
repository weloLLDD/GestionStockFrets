import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  Warehouse,
  Grid3x3,
  MapPin,
  PackageMinus,
  ClipboardList,
  ArrowLeftRight,
  FileBarChart,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  group: string
}

export const navItems: NavItem[] = [
  { label: "Tableau de bord", href: "/tableau-de-bord", icon: LayoutDashboard, group: "Général" },
  { label: "Entrées de Fret", href: "/entrees", icon: PackagePlus, group: "Opérations" },
  { label: "Gestion des Stocks", href: "/stocks", icon: Boxes, group: "Opérations" },
  { label: "Sorties de Fret", href: "/sorties", icon: PackageMinus, group: "Opérations" },
  { label: "Dépôts", href: "/depots", icon: Warehouse, group: "Entrepôt" },
  { label: "Zones de Stockage", href: "/zones", icon: Grid3x3, group: "Entrepôt" },
  { label: "Emplacements", href: "/emplacements", icon: MapPin, group: "Entrepôt" },
  { label: "Inventaire", href: "/inventaire", icon: ClipboardList, group: "Suivi" },
  { label: "Mouvements de Stock", href: "/mouvements", icon: ArrowLeftRight, group: "Suivi" },
  { label: "Rapports", href: "/rapports", icon: FileBarChart, group: "Suivi" },
  { label: "Utilisateurs", href: "/utilisateurs", icon: Users, group: "Administration" },
  { label: "Paramètres", href: "/parametres", icon: Settings, group: "Administration" },
]

export const navGroups = ["Général", "Opérations", "Entrepôt", "Suivi", "Administration"]
