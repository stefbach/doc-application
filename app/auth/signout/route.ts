import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // Ignored
          }
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Supabase sign out error:", error)
      return NextResponse.json({ error: "Failed to sign out.", details: error.message }, { status: 500 })
    }
  }

  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  })
}
