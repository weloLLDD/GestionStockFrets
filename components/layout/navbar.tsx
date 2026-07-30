"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, Search, Bell, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarNav } from "./sidebar-nav"
import { navItems } from "@/lib/navigation"

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const current = navItems.find((i) => (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)))

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur lg:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu" />}
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-r-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden text-sm font-medium text-muted-foreground sm:block">
        {current?.label ?? "Tableau de bord"}
      </div>

      <div className="relative ml-auto hidden w-full max-w-xs md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input placeholder="Rechercher..." className="pl-9" aria-label="Recherche globale" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="relative ml-auto md:ml-0" aria-label="Notifications" />}
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-sm font-medium">3 colis dépassent la durée</span>
            <span className="text-xs text-muted-foreground">Dépôt Central Nord</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-sm font-medium">Inventaire INV-2026-014 en cours</span>
            <span className="text-xs text-muted-foreground">Il y a 1 h</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-sm font-medium">5 sorties en attente de validation</span>
            <span className="text-xs text-muted-foreground">Tous dépôts</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent"
              aria-label="Menu utilisateur"
            />
          }
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">KB</AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-medium">Karim Benali</p>
            <p className="text-xs text-muted-foreground">Administrateur</p>
          </div>
          <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profil</DropdownMenuItem>
          <DropdownMenuItem>Paramètres</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
