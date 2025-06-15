import type React from "react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PatientDocumentManager from "@/components/patient-document-manager"
import { getDocumentsForPatient, getPatientDetails, type PatientDetailsType } from "@/app/actions/document-actions"
import {
  AlertTriangle,
  UserCircle,
  Mail,
  Phone,
  Scale,
  TrendingUp,
  FileTextIcon,
  CheckCircle,
  XCircle,
  FileType2,
  Info,
  FileText,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Helper pour afficher une information si elle existe
const DetailItem = ({
  label,
  value,
  icon: Icon,
  isBoolean,
}: {
  label: string
  value: string | number | boolean | null | undefined
  icon?: React.ElementType
  isBoolean?: boolean
}) => {
  if (value === null || value === undefined || (typeof value === "string" && value === "")) return null

  let displayValue: React.ReactNode = value as React.ReactNode
  if (isBoolean) {
    displayValue = value ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
        <CheckCircle className="mr-1 h-3 w-3" /> Oui
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" /> Non
      </Badge>
    )
  } else if (typeof value === "string" && value.length > 100) {
    displayValue = <p className="text-sm whitespace-pre-wrap">{value.substring(0, 100)}...</p>
  } else if (typeof value === "string") {
    displayValue = <p className="text-sm whitespace-pre-wrap">{value}</p>
  }

  return (
    <div className="flex items-start text-sm py-1">
      {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />}
      <span className="font-medium text-muted-foreground min-w-[200px] shrink-0">{label}:&nbsp;</span>
      <div className="break-words min-w-0">{displayValue}</div>
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

  const patientDetails: PatientDetailsType | null = await getPatientDetails(patientId)
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
        <CardContent className="space-y-1">
          <DetailItem label="Email" value={patientDetails.email} icon={Mail} />
          <DetailItem label="Téléphone" value={patientDetails.phone} icon={Phone} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-1 pt-2">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-6 w-6" />
            État des Documents (Patient)
          </CardTitle>
          <CardDescription>Informations sur les documents directement depuis la fiche patient.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <DetailItem label="Facture Envoyée" value={patientDetails.facture_envoye} icon={FileType2} isBoolean />
          <DetailItem
            label="Accord Médical Obtenu"
            value={patientDetails.medical_agrement}
            icon={FileType2}
            isBoolean
          />
          <DetailItem
            label="Formulaire de Consentement Reçu"
            value={patientDetails.consent_form}
            icon={FileType2}
            isBoolean
          />
          <DetailItem
            label="Compte Rendu Hospitalisation (Résumé)"
            value={patientDetails.compte_rendu_hospitalisation}
            icon={FileText}
          />
          <DetailItem
            label="Compte Rendu Consultation (Résumé)"
            value={patientDetails.compte_rendu_consultation}
            icon={FileText}
          />
          <DetailItem label="Formulaire S2 Patient (Info)" value={patientDetails.patient_s2_form} icon={FileText} />
          <DetailItem label="Lettre GP (Info)" value={patientDetails.lettre_gp} icon={FileText} />
        </CardContent>
      </Card>

      <PatientDocumentManager
        patientId={patientId}
        initialDocuments={initialDocuments}
        patientName={patientDetails.full_name || `Patient ${patientId.substring(0, 8)}...`}
      />
    </div>
  )
}
