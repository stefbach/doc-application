import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, LayoutDashboard, CheckCircle2 } from "lucide-react"
import { identifyAllPatientsDocuments } from "@/app/actions/patient-actions"
import { PatientsTrackingTable } from "@/components/patients-tracking-table"

export default async function AllPatientsDocumentsPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const allPatientsStatus = await identifyAllPatientsDocuments()

  // Statistiques globales
  const totalPatients = allPatientsStatus.length
  const patientsWithAllDocuments = allPatientsStatus.filter((p) => p.completionPercentage === 100).length
  const averageCompletion =
    totalPatients > 0
      ? Math.round(allPatientsStatus.reduce((sum, p) => sum + p.completionPercentage, 0) / totalPatients)
      : 0

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/board">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Vue Kanban
          </Link>
        </Button>
      </div>

      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <LayoutDashboard className="mr-3 h-8 w-8" />
          Tableau de Suivi des Patients
        </h1>
        <p className="text-muted-foreground">Statut de complétion des documents pour tous les patients</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Patients</CardDescription>
            <CardTitle className="text-3xl">{totalPatients}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Documents Complets</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              {patientsWithAllDocuments}
              <CheckCircle2 className="ml-2 h-6 w-6 text-green-600" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Complétion Moyenne</CardDescription>
            <CardTitle className="text-3xl">{averageCompletion}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tableau avec filtres et tri */}
      <PatientsTrackingTable patients={allPatientsStatus} />
    </div>
  )
}
