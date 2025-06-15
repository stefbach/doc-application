import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowserClient() {
  // TEMPORARY: For debugging "Failed to fetch" errors. Remove after testing.
  // console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  // console.log("Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Loaded" : "NOT LOADED");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL is not defined!")
    throw new Error("Supabase URL is not defined. Check your environment variables.")
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined!")
    throw new Error("Supabase Anon Key is not defined. Check your environment variables.")
  }

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
