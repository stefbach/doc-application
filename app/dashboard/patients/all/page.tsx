import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, ArrowLeft, CheckCircle2, AlertCircle, Eye } from "lucide-react"
import { identifyAllPatientsDocuments } from "@/app/actions/patient-actions"

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
      {/* Bouton retour */}
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la recherche
          </Link>
        </Button>
      </div>

      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <FileText className="mr-3 h-8 w-8" />
          Vue d'ensemble des Documents Patients
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

      {/* Tableau des patients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Patients</CardTitle>
          <CardDescription>Cliquez sur un patient pour voir les détails de ses documents</CardDescription>
        </CardHeader>
        <CardContent>
          {allPatientsStatus.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold">Aucun patient trouvé</p>
              <p className="text-muted-foreground">Il n'y a actuellement aucun patient dans la base de données.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du Patient</TableHead>
                  <TableHead className="text-center">Nb Documents</TableHead>
                  <TableHead>Complétion</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Documents Manquants</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPatientsStatus.map((patientStatus) => {
                  const isComplete = patientStatus.completionPercentage === 100
                  const hasIssues = patientStatus.missingCategories.length > 0

                  return (
                    <TableRow key={patientStatus.patientId}>
                      <TableCell className="font-medium">
                        {patientStatus.patientName || `Patient ${patientStatus.patientId.substring(0, 8)}...`}
                      </TableCell>
                      <TableCell className="text-center">{patientStatus.totalDocuments}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{patientStatus.completionPercentage}%</span>
                          </div>
                          <Progress value={patientStatus.completionPercentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {isComplete ? (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Complet
                          </Badge>
                        ) : hasIssues ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Incomplet
                          </Badge>
                        ) : (
                          <Badge variant="outline">En cours</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {patientStatus.missingCategories.length > 0 ? (
                          <Badge variant="outline">{patientStatus.missingCategories.length} manquant(s)</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/patients/${patientStatus.patientId}/documents`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
