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
  // Ajout des champs spécifiques aux documents de la table patients
  facture_envoye: boolean | null
  medical_agrement: boolean | null
  consent_form: boolean | null
  compte_rendu_hospitalisation: string | null
  compte_rendu_consultation: string | null
  patient_s2_form: string | null
  lettre_gp: string | null
  // Ajoutez d'autres champs de la table 'patients' que vous voulez afficher ici
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
  `) // Ajout des nouvelles colonnes ici
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
  console.log(`[getSignedUrlForDownload] Received filePath: "${filePath}"`)
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

  // 1. Récupérer le patient_id avant de supprimer les métadonnées du document
  let patientIdToRevalidate: string | null = null
  const { data: documentToDelete, error: fetchError } = await supabase
    .from("documents")
    .select("patient_id")
    .eq("id", documentId)
    .single()

  if (fetchError) {
    console.error("Erreur lors de la récupération du document avant suppression:", fetchError.message)
    // Vous pourriez vouloir lever une erreur ici ou tenter la suppression quand même.
    // Pour l'instant, nous allons logger et continuer avec prudence.
    // Si le document n'est pas trouvé, la suppression échouera de toute façon ou ne fera rien.
  } else if (documentToDelete) {
    patientIdToRevalidate = documentToDelete.patient_id
  }

  // 2. Supprimer le fichier du stockage
  const { error: storageError } = await supabase.storage.from("patient-documents").remove([storagePath])

  if (storageError) {
    console.error("Erreur lors de la suppression du fichier du stockage:", storageError.message)
    // Si la suppression du stockage échoue, nous pourrions ne pas vouloir supprimer l'enregistrement de la BDD,
    // ou gérer cela comme un échec partiel.
    throw new Error(`Échec de la suppression du fichier du stockage: ${storageError.message}`)
  }

  // 3. Supprimer les métadonnées du document de la base de données
  const { error: dbError } = await supabase.from("documents").delete().eq("id", documentId)
  // Pas de .select().single() ici après la suppression

  if (dbError) {
    console.error("Erreur lors de la suppression des métadonnées du document:", dbError.message)
    throw new Error(`Échec de la suppression des métadonnées du document: ${dbError.message}`)
  }

  // 4. Revalider le chemin si nous avons un patient_id
  if (patientIdToRevalidate) {
    revalidatePath(`/dashboard/patients/${patientIdToRevalidate}/documents`)
  } else {
    // Revalidation de secours si patient_id n'a pas pu être récupéré.
    // Cela pourrait être moins spécifique, par ex. revalider la liste de tous les patients.
    // Pour l'instant, nous ne revaliderons que si nous avons le patient_id spécifique.
    console.warn(`Impossible de déterminer le patient_id pour le document ${documentId} afin de revalider le chemin.`)
  }
}
