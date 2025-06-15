import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Redirige vers un tableau de bord ou une page de liste de patients
    // Pour cet exemple, on va vers une page de patient spécifique (ID à remplacer)
    // Idéalement, vous auriez une page listant les patients ou un dashboard.
    redirect(`/dashboard/patients/0e518519-75ea-4b55-941f-6afdd88f8a48/documents`) // Remplacez par un ID de patient valide
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <h1 className="text-3xl font-bold mb-6">Bienvenue sur DocPatient</h1>
      <p className="text-muted-foreground mb-8">Veuillez vous connecter pour gérer les documents des patients.</p>
      <Button asChild size="lg">
        <Link href="/login">Se connecter</Link>
      </Button>
    </div>
  )
}
