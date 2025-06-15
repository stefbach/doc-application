import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Supabase sign out error (GET):", error.message)
      // Rediriger vers la page de connexion avec un message d'erreur
      // Vous pouvez personnaliser l'URL ou la gestion d'erreur ici
      return NextResponse.redirect(new URL("/login?error=signout_failed", req.url), {
        status: 302,
      })
    }
  } catch (e: any) {
    console.error("Catch block error during sign out (GET):", e.message)
    return NextResponse.redirect(new URL("/login?error=signout_exception", req.url), {
      status: 302,
    })
  }

  // Redirection après une déconnexion réussie
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  })
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Supabase sign out error (POST):", error.message)
      return NextResponse.redirect(new URL("/login?error=signout_failed", req.url), {
        status: 302,
      })
    }
  } catch (e: any) {
    console.error("Catch block error during sign out (POST):", e.message)
    return NextResponse.redirect(new URL("/login?error=signout_exception", req.url), {
      status: 302,
    })
  }

  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  })
}
