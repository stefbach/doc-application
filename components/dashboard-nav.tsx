"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Search, Table, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/patients",
    label: "Recherche",
    icon: Search,
  },
  {
    href: "/dashboard/patients/all",
    label: "Tableau de Suivi",
    icon: Table,
  },
  {
    href: "/dashboard/board",
    label: "Vue Kanban",
    icon: Layers,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="mb-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-colors",
                isActive && "pointer-events-none"
              )}
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
