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
  "S2 Form",
  "S2 Provider",
  "Devis",
  "Compte Rendu Consultation",
  "Undelay",
  "Pièce Identité",
  "Justificatif de Domicile",
  "Patient Authorisation Letter",
  "Lettre GP",
  "Autre",
] as const

// Mapping des anciennes catégories vers les nouvelles
// Pour assurer la compatibilité avec les documents existants
export const CATEGORY_MAPPING: Record<string, string> = {
  // Anciennes catégories → Nouvelles catégories
  "Formulaire S2": "S2 Form",
  "Facture": "Autre",
  "Contrat": "Autre",
  "Simulation Financière": "Autre",
  "Compte Rendu Hospitalisation": "Autre",
  // Les nouvelles catégories se mappent sur elles-mêmes
  "S2 Form": "S2 Form",
  "S2 Provider": "S2 Provider",
  "Devis": "Devis",
  "Compte Rendu Consultation": "Compte Rendu Consultation",
  "Undelay": "Undelay",
  "Pièce Identité": "Pièce Identité",
  "Justificatif de Domicile": "Justificatif de Domicile",
  "Patient Authorisation Letter": "Patient Authorisation Letter",
  "Lettre GP": "Lettre GP",
  "Autre": "Autre",
}

// Fonction helper pour normaliser une catégorie
export function normalizeCategory(category: string | null | undefined): string {
  if (!category) return "Autre"
  return CATEGORY_MAPPING[category] || "Autre"
}
