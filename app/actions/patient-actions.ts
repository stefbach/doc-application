"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function searchPatients(query: string) {
  noStore() // Empêche la mise en cache des résultats de recherche
  const supabase = createSupabaseServerClient()

  if (!query) {
    // Optionnel : retourner tous les patients ou une liste vide si pas de recherche
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name")
      .order("full_name", { ascending: true })

    if (error) {
      console.error("Error fetching all patients:", error)
      return []
    }
    return data || []
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name")
    .ilike("full_name", `%${query}%`) // Recherche insensible à la casse
    .order("full_name", { ascending: true })

  if (error) {
    console.error("Error searching patients:", error)
    return []
  }

  return data || []
}
