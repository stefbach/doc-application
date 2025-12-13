"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { DocumentType, PatientDetailsType } from "./types"

interface NewDocumentMetadata {
  patient_id: string
  file_name: string
  storage_path: string
  file_type?: string
  file_size?: number
  document_category: string // Important: this is the category selected during upload
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

// Mappage des catégories de documents aux colonnes de la table 'patients'
// Clé: Catégorie du document (exactement comme dans votre liste déroulante `documentCategories`)
// Valeur: Nom de la colonne booléenne dans la table 'patients'
const categoryToPatientColumnMap: {
  [key: string]: keyof Pick<PatientDetailsType, "facture_envoye" | "medical_agrement" | "consent_form">
} = {
  Facture: "facture_envoye",
  Contrat: "medical_agrement", // À vérifier: "Contrat" correspond-il bien à `medical_agrement`?
  // Ou peut-être une catégorie "Accord Médical" ou "Consentement" ?
  // Exemple pour consent_form (si vous avez une catégorie "Consentement" ou similaire):
  // "Consentement": "consent_form",
  // Ajoutez d'autres mappages ici si nécessaire
}

export async function addDocumentMetadata(metadata: NewDocumentMetadata): Promise<DocumentType | null> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: newDocument, error } = await supabase
    .from("documents")
    .insert([{ ...metadata, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error("Error adding document metadata:", error.message)
    throw new Error(`Failed to add document metadata: ${error.message}`)
  }

  // Si un nouveau document a été ajouté avec succès, vérifions sa catégorie
  // et mettons à jour la table 'patients' si nécessaire.
  if (newDocument && metadata.document_category) {
    const patientColumnToUpdate = categoryToPatientColumnMap[metadata.document_category]

    if (patientColumnToUpdate) {
      console.log(
        `Updating patient ${metadata.patient_id}, setting ${patientColumnToUpdate} to true due to upload of ${metadata.document_category}`,
      )
      const { error: updatePatientError } = await supabase
        .from("patients")
        .update({ [patientColumnToUpdate]: true })
        .eq("id", metadata.patient_id)

      if (updatePatientError) {
        // Log l'erreur mais ne bloque pas le processus, car les métadonnées du document sont déjà sauvegardées.
        console.error(
          `Failed to update patient table for category "${metadata.document_category}" on patient ${metadata.patient_id}:`,
          updatePatientError.message,
        )
      } else {
        console.log(
          `Patient table updated successfully for category "${metadata.document_category}" on patient ${metadata.patient_id}.`,
        )
      }
    }
  }

  // Revalidate le chemin pour mettre à jour la liste des documents ET les détails du patient affichés.
  revalidatePath(`/dashboard/patients/${metadata.patient_id}/documents`)
  return newDocument as DocumentType
}

export async function getSignedUrlForDownload(filePath: string): Promise<string | null> {
  console.log(`[getSignedUrlForDownload] Received filePath: "${filePath}"`)
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.storage.from("patient-documents").createSignedUrl(filePath, 60 * 5)

  if (error) {
    console.error("Error creating signed URL for patient-documents:", error.message)
    return null
  }
  console.log("[getSignedUrlForDownload] Signed URL created successfully for patient-documents.")
  return data.signedUrl
}

export async function deleteDocumentAction(documentId: string, storagePath: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  let patientIdToRevalidate: string | null = null
  const { data: documentToDelete, error: fetchError } = await supabase
    .from("documents")
    .select("patient_id")
    .eq("id", documentId)
    .single()

  if (fetchError) {
    console.error("Erreur lors de la récupération du document avant suppression:", fetchError.message)
  } else if (documentToDelete) {
    patientIdToRevalidate = documentToDelete.patient_id
  }

  const { error: storageError } = await supabase.storage.from("patient-documents").remove([storagePath])
  if (storageError) {
    console.error("Erreur lors de la suppression du fichier du stockage:", storageError.message)
    throw new Error(`Échec de la suppression du fichier du stockage: ${storageError.message}`)
  }

  const { error: dbError } = await supabase.from("documents").delete().eq("id", documentId)
  if (dbError) {
    console.error("Erreur lors de la suppression des métadonnées du document:", dbError.message)
    throw new Error(`Échec de la suppression des métadonnées du document: ${dbError.message}`)
  }

  if (patientIdToRevalidate) {
    revalidatePath(`/dashboard/patients/${patientIdToRevalidate}/documents`)
    // TODO: Potentially add logic here to set patient flags to false if ALL documents of a certain category are deleted.
    // This is more complex and depends on requirements.
  } else {
    console.warn(`Impossible de déterminer le patient_id pour le document ${documentId} afin de revalider le chemin.`)
  }
}
