import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  LayoutDashboard,
  Search,
  Table as TableIcon
} from "lucide-react"
import { identifyAllPatientsDocuments } from "@/app/actions/patient-actions"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivityList } from "@/components/recent-activity-list"

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Récupérer les données des patients
  const allPatientsStatus = await identifyAllPatientsDocuments()

  // Calcul des statistiques
  const totalPatients = allPatientsStatus.length
  const patientsComplete = allPatientsStatus.filter((p) => p.completionPercentage === 100).length
  const patientsIncomplete = allPatientsStatus.filter(
    (p) => p.completionPercentage < 100 && p.completionPercentage > 0
  ).length
  const patientsEmpty = allPatientsStatus.filter((p) => p.totalDocuments === 0).length
  
  const averageCompletion =
    totalPatients > 0
      ? Math.round(allPatientsStatus.reduce((sum, p) => sum + p.completionPercentage, 0) / totalPatients)
      : 0

  const totalDocuments = allPatientsStatus.reduce((sum, p) => sum + p.totalDocuments, 0)

  // Patients avec le plus de documents manquants
  const patientsNeedingAttention = allPatientsStatus
    .filter((p) => p.missingCategories.length > 0)
    .sort((a, b) => b.missingCategories.length - a.missingCategories.length)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <LayoutDashboard className="mr-3 h-10 w-10" />
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Vue d'ensemble de la gestion des documents patients
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/patients">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/patients/all">
              <TableIcon className="mr-2 h-4 w-4" />
              Tableau de Suivi
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Patients enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents Complets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patientsComplete}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPatients > 0 ? Math.round((patientsComplete / totalPatients) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patientsIncomplete}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents incomplets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complétion Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageCompletion}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDocuments} documents total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardStats
          complete={patientsComplete}
          incomplete={patientsIncomplete}
          empty={patientsEmpty}
          total={totalPatients}
        />

        <Card>
          <CardHeader>
            <CardTitle>Patients Nécessitant une Attention</CardTitle>
            <CardDescription>
              Patients avec le plus de documents manquants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityList patients={patientsNeedingAttention} />
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Action Rapide</CardTitle>
          <CardDescription>Recherchez un patient pour gérer ses documents</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline" size="lg" className="h-auto py-6 px-8 flex-col">
            <Link href="/dashboard/patients">
              <Search className="h-12 w-12 mb-3" />
              <span className="font-semibold text-lg">Rechercher un Patient</span>
              <span className="text-sm text-muted-foreground mt-2">
                Trouver et gérer les documents d'un patient
              </span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
