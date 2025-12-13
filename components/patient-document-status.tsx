"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, FileText, AlertCircle } from "lucide-react"
import type { PatientDocumentStatus } from "@/app/actions/patient-actions"

interface PatientDocumentStatusProps {
  status: PatientDocumentStatus
  showDetails?: boolean
}

export default function PatientDocumentStatusComponent({
  status,
  showDetails = true,
}: PatientDocumentStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Statut des Documents
          </span>
          <Badge variant={status.completionPercentage === 100 ? "default" : "secondary"}>
            {status.completionPercentage}% complété
          </Badge>
        </CardTitle>
        <CardDescription>
          {status.totalDocuments} document{status.totalDocuments > 1 ? "s" : ""} au total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{status.completionPercentage}%</span>
          </div>
          <Progress value={status.completionPercentage} className="h-2" />
        </div>

        {/* Résumé par catégorie */}
        {showDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Documents par catégorie</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {status.documentsByCategory.map((categoryInfo) => {
                const hasDocuments = categoryInfo.count > 0
                const isRequired = categoryInfo.category !== "Autre"

                return (
                  <div
                    key={categoryInfo.category}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hasDocuments
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : isRequired
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                          : "bg-muted border-muted"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {hasDocuments ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : isRequired ? (
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{categoryInfo.category}</span>
                    </div>
                    <Badge variant={hasDocuments ? "default" : "outline"}>
                      {categoryInfo.count} doc{categoryInfo.count > 1 ? "s" : ""}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Documents manquants */}
        {status.missingCategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="mr-2 h-4 w-4" />
              Documents manquants
            </h4>
            <div className="flex flex-wrap gap-2">
              {status.missingCategories.map((category) => (
                <Badge key={category} variant="outline" className="text-amber-600 dark:text-amber-400">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Message de complétion */}
        {status.completionPercentage === 100 && (
          <div className="flex items-center p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Tous les documents requis sont présents !
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
