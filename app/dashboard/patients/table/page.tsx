import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, FileText, Download } from "lucide-react"
import { identifyAllPatientsDocuments } from "@/app/actions/patient-actions"

export default async function PatientsTablePage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const allPatientsStatus = await identifyAllPatientsDocuments()

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau des Patients</h1>
        <p className="text-muted-foreground">Liste complète de tous les patients avec leurs documents</p>
      </div>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Patients ({allPatientsStatus.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du Patient</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Contrat</TableHead>
                  <TableHead>Simulation Financière</TableHead>
                  <TableHead>Compte Rendu Hosp.</TableHead>
                  <TableHead>Compte Rendu Consult.</TableHead>
                  <TableHead>Lettre GP</TableHead>
                  <TableHead>Formulaire S2</TableHead>
                  <TableHead>Autre</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPatientsStatus.map((patient) => {
                  const getCategoryCount = (category: string) => {
                    const cat = patient.documentsByCategory.find((c) => c.category === category)
                    return cat ? cat.count : 0
                  }

                  return (
                    <TableRow key={patient.patientId}>
                      <TableCell className="font-medium">
                        {patient.patientName || `Patient ${patient.patientId.substring(0, 8)}...`}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Facture") > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {getCategoryCount("Facture")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Contrat") > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {getCategoryCount("Contrat")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Simulation Financière") > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {getCategoryCount("Simulation Financière")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Compte Rendu Hospitalisation") > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {getCategoryCount("Compte Rendu Hospitalisation")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Compte Rendu Consultation") > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {getCategoryCount("Compte Rendu Consultation")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Lettre GP") > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {getCategoryCount("Lettre GP")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Formulaire S2") > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {getCategoryCount("Formulaire S2")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCategoryCount("Autre") > 0 ? (
                          <Badge variant="secondary">{getCategoryCount("Autre")}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{patient.totalDocuments}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/patients/${patient.patientId}/documents`}>
                              <Eye className="mr-1 h-3 w-3" />
                              Voir
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {allPatientsStatus.length === 0 && (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold">Aucun patient trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
