import { searchPatients } from "@/app/actions/patient-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { List, Search } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface PatientsPageProps {
  searchParams?: {
    query?: string
  }
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const query = searchParams?.query || ""
  let patients
  if (query) {
    patients = await searchPatients(query)
  } else {
    // Optionnel: afficher tous les patients ou les plus récents si pas de recherche
    // Pour l'instant, on peut ne rien afficher ou un message
    // patients = await getAllPatients(); // Décommentez pour afficher tous les patients par défaut
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-6 w-6" />
            Rechercher un Patient
          </CardTitle>
          <CardDescription>Entrez le nom ou une partie du nom du patient pour trouver son dossier.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" action="/dashboard/patients" className="flex gap-2 mb-6">
            <Input
              type="search"
              name="query"
              placeholder="Nom du patient..."
              defaultValue={query}
              className="flex-grow"
              aria-label="Rechercher un patient"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" /> Rechercher
            </Button>
          </form>

          {/* Affichage des résultats */}
          {query && patients && patients.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Résultats de la recherche pour "{query}"</h2>
              <ul className="space-y-2">
                {patients.map((patient) => (
                  <li key={patient.id} className="border p-3 rounded-md hover:bg-accent">
                    <Link
                      href={`/dashboard/patients/${patient.id}/documents`}
                      className="flex justify-between items-center"
                    >
                      <span>{patient.full_name || "Nom non disponible"}</span>
                      <Button variant="outline" size="sm">
                        Voir Documents
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query && patients && patients.length === 0 && (
            <p className="text-muted-foreground">Aucun patient trouvé pour "{query}".</p>
          )}

          {!query && (
            <div className="text-center text-muted-foreground py-8">
              <List className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p>Veuillez entrer un nom pour commencer la recherche de patients.</p>
              <p className="text-sm mt-2">
                Ou vous pouvez{" "}
                <Link href="/dashboard/patients/add" className="underline hover:text-primary">
                  ajouter un nouveau patient
                </Link>
                .
              </p>{" "}
              {/* Lien optionnel vers une page d'ajout */}
            </div>
          )}
        </CardContent>
      </Card>
      {/* 
        Optionnel: Section pour afficher tous les patients si aucune recherche n'est active
        et si vous avez décommenté `getAllPatients()`
      */}
      {/* !query && allPatients && allPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="mr-2 h-6 w-6" />
              Tous les Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allPatients.map((patient) => (
                <li key={patient.id} className="border p-3 rounded-md hover:bg-accent">
                  <Link
                    href={`/dashboard/patients/${patient.id}/documents`}
                    className="flex justify-between items-center"
                  >
                    <span>{patient.full_name || "Nom non disponible"}</span>
                    <Button variant="outline" size="sm">
                      Voir Documents
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )*/}
    </div>
  )
}
