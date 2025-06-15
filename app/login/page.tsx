import AuthForm from "@/components/auth-form"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard/patients")
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      {/* The AuthForm is now self-contained with Card styling */}
      {/* So we might not need another Card wrapper here unless desired for extra padding/layout */}
      <AuthForm type="sign-in" />
    </div>
  )
}
