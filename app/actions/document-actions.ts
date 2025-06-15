"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface DocumentType {
  id: string
  patient_id: string
  file_name: string
  storage_path: string
  file_type: string | null
  file_size: number | null
  uploaded_at: string
  user_id: string | null
}

interface NewDocumentMetadata {
  patient_id: string
  file_name: string
  storage_path: string
  file_type?: string
  file_size?: number
}

// Nouvelle interface pour les détails complets du patient
export interface PatientDetailsType {
  id: string
  full_name: string | null
  email: string | null
  numero_de_telephone: string | null
  adresse: string | null
  poids: number | null // ex: en kg
  taille: number | null // ex: en cm
  bmi: number | null // Indice de Masse Corporelle
}

export async function getPatientDetails(patientId: string): Promise<PatientDetailsType | null> {
  if (!patientId) return null
  const supabase = createSupabaseServerClient()

  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, full_name, email, numero_de_telephone, adresse, poids, taille, bmi") // Champs mis à jour
    .eq("id", patientId)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching patient details for ID ${patientId}:`, error.message)
    return null
  }
  return patient as PatientDetailsType | null // Cast vers la nouvelle interface
}

export async function getDocumentsForPatient(patientId: string): Promise<DocumentType[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("patient_id", patientId)
    .order("uploaded_at", { ascending: false })

  if (error) {
    console.error("Error fetching documents:", error.message)
    return []
  }
  return data as DocumentType[]
}

export async function addDocumentMetadata(metadata: NewDocumentMetadata): Promise<DocumentType | null> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("documents")
    .insert([{ ...metadata, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error("Error adding document metadata:", error.message)
    throw new Error(`Failed to add document metadata: ${error.message}`)
  }
  revalidatePath(`/dashboard/patients/${metadata.patient_id}/documents`)
  return data as DocumentType
}

export async function getSignedUrlForDownload(filePath: string): Promise<string | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.storage.from("patient_documents").createSignedUrl(filePath, 60 * 5)

  if (error) {
    console.error("Error creating signed URL:", error.message)
    return null
  }
  return data.signedUrl
}

export async function deleteDocumentAction(documentId: string, storagePath: string): Promise<void> {
  const supabase = createSupabaseServerClient()

  const { error: storageError } = await supabase.storage.from("patient_documents").remove([storagePath])

  if (storageError) {
    console.error("Error deleting file from storage:", storageError.message)
    throw new Error(`Failed to delete file from storage: ${storageError.message}`)
  }

  const { error: dbError, data: documentData } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .select("patient_id")
    .single()

  if (dbError) {
    console.error("Error deleting document metadata:", dbError.message)
    throw new Error(`Failed to delete document metadata: ${dbError.message}`)
  }

  if (documentData?.patient_id) {
    revalidatePath(`/dashboard/patients/${documentData.patient_id}/documents`)
  }
}
