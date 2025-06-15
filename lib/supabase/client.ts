import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"
// If you were using auth-helpers, it would be:
// import { createClientComponentClient, type SupabaseClient } from '@supabase/auth-helpers-nextjs'

// Define the type for your Supabase client if not automatically inferred
// For @supabase/ssr:
// type BrowserClient = SupabaseClient<any, "public", any>; // Adjust if you have specific database types
// For @supabase/auth-helpers-nextjs, SupabaseClient is often generic enough.

let supabaseBrowserClientInstance: SupabaseClient | null = null

/**
 * Gets a singleton instance of the Supabase browser client.
 * Ensures that only one instance is created and used throughout the application's client-side.
 */
export function getSingletonSupabaseBrowserClient(): SupabaseClient {
  if (!supabaseBrowserClientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // This error will be caught by the developer during development if env vars are missing.
      throw new Error(
        "Supabase URL or Anon Key is missing from .env. NEXT_PUBLIC_ prefix is required for browser access.",
      )
    }

    supabaseBrowserClientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    // If using auth-helpers:
    // supabaseBrowserClientInstance = createClientComponentClient({
    //   supabaseUrl,
    //   supabaseKey: supabaseAnonKey,
    // });
  }
  return supabaseBrowserClientInstance
}
