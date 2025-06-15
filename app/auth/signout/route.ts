// Route handler pour la déconnexion
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Handle GET requests for direct navigation or previewing
export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  })
}

// Handle POST requests from the sign-out form
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  })
}
