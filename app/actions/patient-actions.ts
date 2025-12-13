"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { revalidatePath } from "next/cache"

// Fonction searchPatients restaurée
export async function searchPatients(query: string) {
  noStore() // Empêche la mise en cache des résultats de recherche
  const supabase = createSupabaseServerClient()

  // Ne retourne des résultats que si une recherche est effectuée
  if (!query || query.trim() === "") {
    return []
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

// Le reste de vos interfaces et fonctions existantes dans ce fichier :
export interface DocumentType {
  id: string
  patient_id: string
  file_name: string
  storage_path: string
  file_type: string | null
  file_size: number | null
  uploaded_at: string
  user_id: string | null
  document_category: string | null
}

interface NewDocumentMetadata {
  patient_id: string
  file_name: string
  storage_path: string
  file_type?: string
  file_size?: number
  document_category: string
}

export interface PatientDetailsType {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  poids: number | null
  taille: number | null
  bmi: number | null
  facture_envoye: boolean | null
  medical_agrement: boolean | null
  consent_form: boolean | null
  compte_rendu_hospitalisation: string | null
  compte_rendu_consultation: string | null
  patient_s2_form: string | null
  lettre_gp: string | null
}

export async function getPatientDetails(patientId: string): Promise<PatientDetailsType | null> {
  if (!patientId) return null
  const supabase = createSupabaseServerClient()

  const { data: patient, error } = await supabase
    .from("patients")
    .select(`
      id, full_name, email, phone, poids, taille, bmi,
      facture_envoye, medical_agrement, consent_form,
      compte_rendu_hospitalisation, compte_rendu_consultation,
      patient_s2_form, lettre_gp
    `)
    .eq("id", patientId)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching patient details for ID ${patientId}:`, error.message)
    return null
  }
  return patient as PatientDetailsType | null
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
  const { data, error } = await supabase.storage.from("patient-documents").createSignedUrl(filePath, 60 * 5)

  if (error) {
    console.error("Error creating signed URL:", error.message)
    return null
  }
  return data.signedUrl
}

export async function deleteDocumentAction(documentId: string, storagePath: string): Promise<void> {
  const supabase = createSupabaseServerClient()

  const { error: storageError } = await supabase.storage.from("patient-documents").remove([storagePath])

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

// Toutes les catégories de documents possibles
export const ALL_DOCUMENT_CATEGORIES = [
  "Facture",
  "Contrat",
  "Simulation Financière",
  "Compte Rendu Hospitalisation",
  "Compte Rendu Consultation",
  "Lettre GP",
  "Formulaire S2",
  "Autre",
] as const

// Interface pour le résumé des documents par catégorie
export interface DocumentSummaryByCategory {
  category: string
  count: number
  documents: DocumentType[]
}

// Interface pour le statut complet des documents d'un patient
export interface PatientDocumentStatus {
  patientId: string
  patientName: string | null
  totalDocuments: number
  documentsByCategory: DocumentSummaryByCategory[]
  missingCategories: string[]
  completionPercentage: number
}

/**
 * Identifie tous les documents pour un patient donné
 * Retourne un résumé organisé par catégorie
 */
export async function identifyPatientDocuments(patientId: string): Promise<PatientDocumentStatus | null> {
  noStore()
  
  if (!patientId) return null

  const supabase = createSupabaseServerClient()

  // Récupérer les informations du patient
  const patient = await getPatientDetails(patientId)
  if (!patient) return null

  // Récupérer tous les documents du patient
  const documents = await getDocumentsForPatient(patientId)

  // Grouper les documents par catégorie
  const documentsByCategory: { [key: string]: DocumentType[] } = {}
  
  documents.forEach((doc) => {
    const category = doc.document_category || "Autre"
    if (!documentsByCategory[category]) {
      documentsByCategory[category] = []
    }
    documentsByCategory[category].push(doc)
  })

  // Créer le résumé par catégorie
  const summaries: DocumentSummaryByCategory[] = ALL_DOCUMENT_CATEGORIES.map((category) => ({
    category,
    count: documentsByCategory[category]?.length || 0,
    documents: documentsByCategory[category] || [],
  }))

  // Identifier les catégories manquantes (sans "Autre")
  const missingCategories = ALL_DOCUMENT_CATEGORIES.filter(
    (cat) => cat !== "Autre" && (!documentsByCategory[cat] || documentsByCategory[cat].length === 0),
  )

  // Calculer le pourcentage de complétion (hors catégorie "Autre")
  const requiredCategories = ALL_DOCUMENT_CATEGORIES.filter((cat) => cat !== "Autre")
  const completedCategories = requiredCategories.filter(
    (cat) => documentsByCategory[cat] && documentsByCategory[cat].length > 0,
  )
  const completionPercentage = Math.round((completedCategories.length / requiredCategories.length) * 100)

  return {
    patientId,
    patientName: patient.full_name,
    totalDocuments: documents.length,
    documentsByCategory: summaries,
    missingCategories,
    completionPercentage,
  }
}

/**
 * Identifie tous les documents pour tous les patients
 * Utile pour avoir une vue d'ensemble
 */
export async function identifyAllPatientsDocuments(): Promise<PatientDocumentStatus[]> {
  noStore()
  
  const supabase = createSupabaseServerClient()

  // Récupérer tous les patients
  const { data: patients, error } = await supabase
    .from("patients")
    .select("id, full_name")
    .order("full_name", { ascending: true })

  if (error) {
    console.error("Error fetching all patients:", error.message)
    return []
  }

  if (!patients || patients.length === 0) {
    return []
  }

  // Récupérer le statut des documents pour chaque patient
  const statusPromises = patients.map((patient) => identifyPatientDocuments(patient.id))
  const statuses = await Promise.all(statusPromises)

  // Filtrer les résultats null
  return statuses.filter((status): status is PatientDocumentStatus => status !== null)
}
