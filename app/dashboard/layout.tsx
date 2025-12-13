import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardNav />
      {children}
    </div>
  )
}
