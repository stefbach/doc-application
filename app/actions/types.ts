// Types partagés pour les actions serveur

// Types pour les listes de patients
export interface PatientList {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  user_id: string
  created_at: string
  updated_at: string
  patient_count?: number
}

export interface ListPatientAssignment {
  id: string
  list_id: string
  patient_id: string
  created_at: string
}

// Types pour les documents
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

// Types pour les patients
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

// Types pour l'analyse des documents
export interface DocumentSummaryByCategory {
  category: string
  count: number
  documents: DocumentType[]
}

export interface PatientDocumentStatus {
  patientId: string
  patientName: string | null
  totalDocuments: number
  documentsByCategory: DocumentSummaryByCategory[]
  missingCategories: string[]
  completionPercentage: number
}

// Constantes
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
