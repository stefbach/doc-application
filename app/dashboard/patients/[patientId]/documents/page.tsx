import type React from "react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PatientDocumentManager from "@/components/patient-document-manager"
import { getDocumentsForPatient, getPatientDetails, type PatientDetailsType } from "@/app/actions/document-actions" // Importez PatientDetailsType
import { AlertTriangle, UserCircle, Mail, Phone, MapPin, Scale, TrendingUp, FileTextIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Helper pour afficher une information si elle existe
const DetailItem = ({
  label,
  value,
  icon: Icon,
}: { label: string; value: string | number | null | undefined; icon?: React.ElementType }) => {
  if (value === null || value === undefined || value === "") return null
  return (
    <div className="flex items-start text-sm">
      {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />}
      <span className="font-medium text-muted-foreground">{label}:&nbsp;</span>
      <span>{value}</span>
    </div>
  )
}

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

  const patientDetails: PatientDetailsType | null = await getPatientDetails(patientId) // Utilisez PatientDetailsType
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="mr-2 h-7 w-7" />
            {patientDetails.full_name || `Patient ${patientId.substring(0, 8)}...`}
          </CardTitle>
          <CardDescription>Informations détaillées du patient.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailItem label="Email" value={patientDetails.email} icon={Mail} />
          <DetailItem label="Téléphone" value={patientDetails.numero_de_telephone} icon={Phone} />
          <DetailItem label="Adresse" value={patientDetails.adresse} icon={MapPin} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <DetailItem label="Poids" value={patientDetails.poids ? `${patientDetails.poids} kg` : null} icon={Scale} />
            <DetailItem
              label="Taille"
              value={patientDetails.taille ? `${patientDetails.taille} cm` : null}
              icon={TrendingUp}
            />
            <DetailItem label="IMC" value={patientDetails.bmi} icon={FileTextIcon} />
          </div>
        </CardContent>
      </Card>

      {/* Le gestionnaire de documents reste ici */}
      <PatientDocumentManager
        patientId={patientId}
        initialDocuments={initialDocuments}
        patientName={patientDetails.full_name || `Patient ${patientId.substring(0, 8)}...`}
      />
    </div>
  )
}
