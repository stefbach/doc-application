import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard, Plus } from "lucide-react"
import { identifyAllPatientsDocuments } from "@/app/actions/patient-actions"
import PatientBoard from "@/components/patient-board"
import { getPatientLists } from "@/app/actions/list-actions"

export default async function BoardPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Récupérer tous les patients avec leur statut
  const allPatientsStatus = await identifyAllPatientsDocuments()

  // Récupérer les listes personnalisées de l'utilisateur
  const customLists = await getPatientLists(user.id)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/patients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center">
            <LayoutDashboard className="mr-3 h-8 w-8" />
            Tableau de Bord des Patients
          </h1>
          <p className="text-muted-foreground mt-1">Organisez vos patients par statut et listes personnalisées</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/board/lists/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Liste
          </Link>
        </Button>
      </div>

      {/* Tableau de bord */}
      <PatientBoard initialPatients={allPatientsStatus} initialLists={customLists} userId={user.id} />
    </div>
  )
}
