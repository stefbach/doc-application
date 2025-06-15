import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PatientDocumentManager from "@/components/patient-document-manager"
import { getDocumentsForPatient, getPatientDetails } from "@/app/actions/document-actions"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function PatientDocumentsPage({ params }: { params: { patientId: string } }) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const patientId = params.patientId
  if (!patientId) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>ID du patient manquant.</AlertDescription>
      </Alert>
    )
  }

  const patientDetails = await getPatientDetails(patientId)
  if (!patientDetails) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Patient non trouvé</AlertTitle>
        <AlertDescription>
          Aucun patient trouvé avec l'ID: {patientId}. Veuillez vérifier l'ID ou créer ce patient.
        </AlertDescription>
      </Alert>
    )
  }

  const initialDocuments = await getDocumentsForPatient(patientId)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Documents pour {patientDetails.full_name || `Patient ${patientId.substring(0, 8)}...`}
      </h1>
      <p className="text-muted-foreground mb-6">Gérez les documents associés à ce patient.</p>
      <PatientDocumentManager
        patientId={patientId}
        initialDocuments={initialDocuments}
        patientName={patientDetails.full_name || `Patient ${patientId.substring(0, 8)}...`}
      />
    </div>
  )
}
