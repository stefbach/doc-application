"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Eye, FileX } from "lucide-react"

interface PatientStatus {
  patientId: string
  patientName: string | null
  totalDocuments: number
  completionPercentage: number
  missingCategories: string[]
}

interface RecentActivityListProps {
  patients: PatientStatus[]
}

export function RecentActivityList({ patients }: RecentActivityListProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Tous les patients ont leurs documents complets ! 🎉
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {patients.map((patient) => (
        <div
          key={patient.patientId}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm truncate">
                {patient.patientName || `Patient ${patient.patientId.substring(0, 8)}...`}
              </p>
              <Badge variant="outline" className="text-xs">
                {patient.completionPercentage}%
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileX className="h-3 w-3" />
              <span>
                {patient.missingCategories.length} document(s) manquant(s)
              </span>
            </div>
            {patient.missingCategories.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {patient.missingCategories.slice(0, 2).map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {patient.missingCategories.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{patient.missingCategories.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button asChild variant="ghost" size="sm" className="ml-2 shrink-0">
            <Link href={`/dashboard/patients/${patient.patientId}/documents`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
