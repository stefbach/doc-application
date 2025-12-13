// Types partagés pour les actions serveur

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
