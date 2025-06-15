// Ceci est la page de LISTE des patients.
// Le contenu précédent a été déplacé vers [patientId]/documents/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, FileText, Search } from "lucide-react"
import { searchPatients } from "@/app/actions/patient-actions" // Assurez-vous que cette action existe

// Interface simple pour un patient dans la liste
interface PatientListItem {
  id: string
  full_name: string | null
  // Ajoutez d'autres champs si nécessaire pour la liste, ex: email
}

export default async function PatientsListPage({
  searchParams,
}: {
  searchParams?: { query?: string }
}) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const query = searchParams?.query || ""
  const patients: PatientListItem[] = await searchPatients(query) // Utilise searchPatients

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="mr-2 h-7 w-7" />
              Liste des Patients
            </div>
            {/* Vous pouvez ajouter un bouton "Ajouter Patient" ici plus tard */}
            {/* <Button asChild><Link href="/dashboard/patients/new">Ajouter Patient</Link></Button> */}
          </CardTitle>
          <CardDescription>Recherchez et sélectionnez un patient pour voir ses documents.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche (simple pour l'instant, peut être améliorée) */}
          <form className="mb-4 flex gap-2">
            <input
              type="text"
              name="query"
              placeholder="Rechercher par nom..."
              defaultValue={query}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" /> Rechercher
            </Button>
          </form>

          {patients.length === 0 ? (
            <p className="text-muted-foreground text-center">
              {query ? `Aucun patient trouvé pour "${query}".` : "Aucun patient à afficher."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom Complet</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.full_name || "Nom non défini"}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/patients/${patient.id}/documents`}>
                          <FileText className="mr-2 h-4 w-4" /> Voir Documents
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {/* Pagination à ajouter ici si nécessaire */}
        </CardContent>
      </Card>
    </div>
  )
}
