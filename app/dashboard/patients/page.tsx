import { Suspense } from "react"
import Link from "next/link"
import { searchPatients } from "@/app/actions/patient-actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, User } from "lucide-react"
import PatientListSkeleton from "./loading"

// Interface pour typer les props de la page
interface PatientsPageProps {
  searchParams?: {
    query?: string
  }
}

export default function PatientsPage({ searchParams }: PatientsPageProps) {
  const query = searchParams?.query || ""

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Rechercher un Patient</h1>
        <p className="text-muted-foreground">Entrez le nom d'un patient pour trouver ses documents.</p>
      </header>

      <div className="mb-6">
        <form className="flex w-full max-w-lg items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" name="query" placeholder="Nom du patient..." defaultValue={query} className="pl-10" />
          </div>
          <Button type="submit">Rechercher</Button>
        </form>
      </div>

      <Suspense key={query} fallback={<PatientListSkeleton />}>
        <PatientList query={query} />
      </Suspense>
    </div>
  )
}

// Composant séparé pour la liste, afin d'utiliser Suspense
async function PatientList({ query }: { query: string }) {
  const patients = await searchPatients(query)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{query ? `Résultats pour "${query}"` : "Tous les patients"}</CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length > 0 ? (
          <ul className="space-y-4">
            {patients.map((patient) => (
              <li
                key={patient.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-secondary p-3 rounded-full">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <span className="font-medium">{patient.full_name}</span>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/patients/${patient.id}/documents`}>Voir Documents</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {query ? "Aucun patient trouvé." : "Aucun patient dans la base de données."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
