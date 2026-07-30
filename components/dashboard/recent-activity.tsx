import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { activites } from "@/lib/mock-data"
import {
  PackagePlus,
  PackageMinus,
  ArrowLeftRight,
  ClipboardList,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  entree: PackagePlus,
  sortie: PackageMinus,
  mouvement: ArrowLeftRight,
  inventaire: ClipboardList,
  utilisateur: UserPlus,
}

const colorMap: Record<string, string> = {
  entree: "bg-success/15 text-success",
  sortie: "bg-info/15 text-info",
  mouvement: "bg-warning/15 text-warning",
  inventaire: "bg-primary/15 text-primary",
  utilisateur: "bg-accent text-accent-foreground",
}

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {activites.map((a) => {
            const Icon = iconMap[a.type]
            return (
              <li key={a.id} className="flex items-start gap-3">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${colorMap[a.type]}`}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">{a.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.utilisateur} · {a.temps}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
