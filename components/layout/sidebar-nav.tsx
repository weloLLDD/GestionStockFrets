"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plane } from "lucide-react"
import { navItems, navGroups } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Plane className="size-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">FretDépôt</p>
          <p className="text-xs text-sidebar-foreground/60">Gestion des stocks</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation principale">
        {navGroups.map((group) => {
          const items = navItems.filter((i) => i.group === group)
          if (items.length === 0) return null
          return (
            <div key={group} className="mb-4">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group}
              </p>
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-3">
        <p className="text-xs text-sidebar-foreground/50">Version 1.0 · Frontend</p>
      </div>
    </div>
  )
}
