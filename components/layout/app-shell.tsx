import { SidebarNav } from "./sidebar-nav"
import { Navbar } from "./navbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:block">
        <SidebarNav />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
