import type React from "react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PatientDocumentManager from "@/components/patient-document-manager"
import PatientDocumentStatusComponent from "@/components/patient-document-status"
import { getDocumentsForPatient, getPatientDetails, type PatientDetailsType } from "@/app/actions/document-actions"
import { identifyPatientDocuments } from "@/app/actions/patient-actions"
import {
  AlertTriangle,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Scale,
  TrendingUp,
  FileTextIcon,
  ArrowLeft,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
      <div className="mb-6">
        {" "}
        {/* Ajout d'un conteneur avec marge en bas */}
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la recherche des patients
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations patient - 2/3 de l'espace */}
        <div className="lg:col-span-2">
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
                <DetailItem
                  label="Poids"
                  value={patientDetails.poids ? `${patientDetails.poids} kg` : null}
                  icon={Scale}
                />
                <DetailItem
                  label="Taille"
                  value={patientDetails.taille ? `${patientDetails.taille} cm` : null}
                  icon={TrendingUp}
                />
                <DetailItem label="IMC" value={patientDetails.bmi} icon={FileTextIcon} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statut des documents - 1/3 de l'espace */}
        <div className="lg:col-span-1">
          {documentStatus && <PatientDocumentStatusComponent status={documentStatus} showDetails={false} />}
        </div>
      </div>

      {/* Statut détaillé des documents */}
      {documentStatus && <PatientDocumentStatusComponent status={documentStatus} showDetails={true} />}

      {/* Le gestionnaire de documents */}
      <PatientDocumentManager
        patientId={patientId}
        initialDocuments={initialDocuments}
        patientName={patientDetails.full_name || `Patient ${patientId.substring(0, 8)}...`}
      />
    </div>
  )
}
