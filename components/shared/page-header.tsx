import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumb?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

export function PageHeader({ title, description, breadcrumb = [], actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <nav aria-label="Fil d'ariane" className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/tableau-de-bord" className="hover:text-foreground">
          Accueil
        </Link>
        {breadcrumb.map((crumb) => (
          <span key={crumb.label} className="flex items-center gap-1">
            <ChevronRight className="size-3" aria-hidden />
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
