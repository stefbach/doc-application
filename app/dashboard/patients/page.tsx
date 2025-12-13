import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, SearchIcon, Inbox, ListChecks } from "lucide-react"
import { searchPatients } from "@/app/actions/patient-actions"
import { Input } from "@/components/ui/input"

interface PatientListItem {
  id: string
  full_name: string | null
}

export default async function PatientsSearchPage({
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
  const patients: PatientListItem[] = await searchPatients(query)

  return (
    <div className="flex flex-col items-center justify-start pt-10 min-h-[calc(100vh-10rem)] space-y-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <SearchIcon className="mr-3 h-8 w-8" />
          Rechercher un Patient
        </h1>
        <p className="text-muted-foreground mb-6">Entrez le nom du patient que vous souhaitez trouver.</p>
        <form className="flex gap-2 items-center">
          <Input
            type="text"
            name="query"
            placeholder="Nom du patient..."
            defaultValue={query}
            className="flex-grow h-14 text-lg px-4 py-3"
            aria-label="Rechercher un patient"
          />
          <Button type="submit" size="lg" className="h-14 px-6">
            <SearchIcon className="mr-2 h-5 w-5" /> Rechercher
          </Button>
        </form>
      </div>

      {query.trim() !== "" && (
        <div className="w-full max-w-4xl">
          {patients.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Résultats de la recherche pour "{query}"</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold">Aucun patient trouvé.</p>
              <p className="text-muted-foreground">
                Aucun patient ne correspond à votre recherche pour "{query}". Veuillez essayer un autre nom.
              </p>
            </div>
          )}
        </div>
      )}
      {query.trim() === "" && (
        <div className="text-center py-10 mt-8">
          <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-xl text-muted-foreground">Commencez votre recherche pour afficher les patients.</p>
        </div>
      )}
    </div>
  )
}
