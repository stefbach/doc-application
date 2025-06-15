import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// It's a security best practice to use POST for sign-out operations
// to prevent Cross-Site Request Forgery (CSRF) vulnerabilities.
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    // Check if there's an active session, though signOut works even if not.
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error("Supabase sign out error:", signOutError.message)
        return NextResponse.json({ error: "Failed to sign out.", details: signOutError.message }, { status: 500 })
      }
    }

    // Redirect to the home page (or login page) after sign out.
    // Ensure the URL is absolute for redirects.
    const redirectUrl = new URL("/", request.url).toString()

    // For POST requests that result in a redirect, 303 See Other is appropriate.
    // This tells the browser to make a GET request to the new URL.
    return NextResponse.redirect(redirectUrl, { status: 303 })
  } catch (error: any) {
    console.error("Unknown error during sign out process:", error.message, error.stack)
    return NextResponse.json(
      { error: "An unexpected error occurred during sign out.", details: error.message },
      { status: 500 },
    )
  }
}

// If you were accessing this route via a GET request (e.g., typing URL in browser or a simple link),
// that would explain an error if only POST is defined.
// While POST is recommended, if you need a GET handler, you can add one:
/*
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    await supabase.auth.signOut();
    
    const redirectUrl = new URL('/', request.url).toString();
    return NextResponse.redirect(redirectUrl, { status: 302 }); // 302 Found for GET redirects

  } catch (error: any) {
    console.error('Unknown error during GET sign out:', error.message, error.stack);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign out.', details: error.message },
      { status: 500 }
    );
  }
}
*/
