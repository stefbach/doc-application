import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ListForm from "@/components/list-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function NewListPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/dashboard/board">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Créer une Nouvelle Liste</h1>
        <p className="text-muted-foreground mt-2">Organisez vos patients avec des listes personnalisées</p>
      </div>

      <ListForm userId={user.id} />
    </div>
  )
}
