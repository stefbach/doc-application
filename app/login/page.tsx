import AuthForm from "@/components/auth-form"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/") // Ou vers le dashboard principal
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <AuthForm />
    </div>
  )
}
