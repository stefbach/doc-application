import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowserClient() {
  // Lignes de débogage temporaires :
  // Affiche les valeurs utilisées pour initialiser le client Supabase dans la console du navigateur.
  // Commentez ou supprimez ces lignes après le débogage.
  console.log("Tentative d'utilisation de l'URL Supabase :", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log(
    "La clé anonyme Supabase est :",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Chargée" : "NON CHARGÉE / INDÉFINIE",
  )

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("ERREUR CRITIQUE : NEXT_PUBLIC_SUPABASE_URL n'est pas définie dans l'environnement !")
    throw new Error("L'URL Supabase n'est pas définie. Vérifiez les variables d'environnement de votre projet Vercel.")
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("ERREUR CRITIQUE : NEXT_PUBLIC_SUPABASE_ANON_KEY n'est pas définie dans l'environnement !")
    throw new Error(
      "La clé anonyme Supabase n'est pas définie. Vérifiez les variables d'environnement de votre projet Vercel.",
    )
  }

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
