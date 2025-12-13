"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { revalidatePath } from "next/cache"
import type { PatientList } from "./types"

/**
 * Récupère toutes les listes d'un utilisateur
 */
export async function getPatientLists(userId: string): Promise<PatientList[]> {
  noStore()
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from("patient_lists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching patient lists:", error.message)
    return []
  }

  // Compter le nombre de patients par liste
  const listsWithCounts = await Promise.all(
    (data || []).map(async (list) => {
      const { count } = await supabase
        .from("list_patient_assignments")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id)

      return {
        ...list,
        patient_count: count || 0,
      }
    }),
  )

  return listsWithCounts
}

/**
 * Crée une nouvelle liste
 */
export async function createPatientList(
  userId: string,
  name: string,
  description: string | null,
  color: string,
  icon: string | null,
): Promise<PatientList | null> {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from("patient_lists")
    .insert([
      {
        user_id: userId,
        name,
        description,
        color,
        icon,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating patient list:", error.message)
    throw new Error(`Failed to create list: ${error.message}`)
  }

  revalidatePath("/dashboard/board")
  return data as PatientList
}

/**
 * Met à jour une liste
 */
export async function updatePatientList(
  listId: string,
  name: string,
  description: string | null,
  color: string,
  icon: string | null,
): Promise<void> {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase
    .from("patient_lists")
    .update({
      name,
      description,
      color,
      icon,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listId)

  if (error) {
    console.error("Error updating patient list:", error.message)
    throw new Error(`Failed to update list: ${error.message}`)
  }

  revalidatePath("/dashboard/board")
}

/**
 * Supprime une liste
 */
export async function deletePatientList(listId: string): Promise<void> {
  const supabase = createSupabaseServerClient()

  // Supprimer d'abord toutes les assignations
  await supabase.from("list_patient_assignments").delete().eq("list_id", listId)

  // Puis supprimer la liste
  const { error } = await supabase.from("patient_lists").delete().eq("id", listId)

  if (error) {
    console.error("Error deleting patient list:", error.message)
    throw new Error(`Failed to delete list: ${error.message}`)
  }

  revalidatePath("/dashboard/board")
}

/**
 * Récupère les patients d'une liste
 */
export async function getPatientsInList(listId: string): Promise<string[]> {
  noStore()
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from("list_patient_assignments")
    .select("patient_id")
    .eq("list_id", listId)

  if (error) {
    console.error("Error fetching patients in list:", error.message)
    return []
  }

  return (data || []).map((item) => item.patient_id)
}

/**
 * Ajoute un patient à une liste
 */
export async function addPatientToList(listId: string, patientId: string): Promise<void> {
  const supabase = createSupabaseServerClient()

  // Vérifier si l'assignation existe déjà
  const { data: existing } = await supabase
    .from("list_patient_assignments")
    .select("id")
    .eq("list_id", listId)
    .eq("patient_id", patientId)
    .maybeSingle()

  if (existing) {
    // Déjà assigné
    return
  }

  const { error } = await supabase.from("list_patient_assignments").insert([
    {
      list_id: listId,
      patient_id: patientId,
    },
  ])

  if (error) {
    console.error("Error adding patient to list:", error.message)
    throw new Error(`Failed to add patient to list: ${error.message}`)
  }

  revalidatePath("/dashboard/board")
}

/**
 * Retire un patient d'une liste
 */
export async function removePatientFromList(listId: string, patientId: string): Promise<void> {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase
    .from("list_patient_assignments")
    .delete()
    .eq("list_id", listId)
    .eq("patient_id", patientId)

  if (error) {
    console.error("Error removing patient from list:", error.message)
    throw new Error(`Failed to remove patient from list: ${error.message}`)
  }

  revalidatePath("/dashboard/board")
}

/**
 * Récupère toutes les listes d'un patient
 */
export async function getPatientListAssignments(patientId: string): Promise<string[]> {
  noStore()
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from("list_patient_assignments")
    .select("list_id")
    .eq("patient_id", patientId)

  if (error) {
    console.error("Error fetching patient list assignments:", error.message)
    return []
  }

  return (data || []).map((item) => item.list_id)
}
