"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface PatientSearchResult {
  id: string
  full_name: string | null
}

export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  if (!query || query.trim() === "") {
    return [] // Retourne un tableau vide si la recherche est vide
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name")
    .ilike("full_name", `%${query}%`) // Recherche partielle insensible à la casse
    .limit(10) // Limite le nombre de résultats pour commencer

  if (error) {
    console.error("Erreur lors de la recherche de patients:", error.message)
    return []
  }

  return data as PatientSearchResult[]
}

export async function getAllPatients(): Promise<PatientSearchResult[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name")
    .order("full_name", { ascending: true })
    .limit(20) // Limite pour l'affichage initial

  if (error) {
    console.error("Erreur lors de la récupération de tous les patients:", error.message)
    return []
  }
  return data as PatientSearchResult[]
}
