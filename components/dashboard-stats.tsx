"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Inbox } from "lucide-react"

interface DashboardStatsProps {
  complete: number
  incomplete: number
  empty: number
  total: number
}

export function DashboardStats({ complete, incomplete, empty, total }: DashboardStatsProps) {
  const completePercentage = total > 0 ? Math.round((complete / total) * 100) : 0
  const incompletePercentage = total > 0 ? Math.round((incomplete / total) * 100) : 0
  const emptyPercentage = total > 0 ? Math.round((empty / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution des Patients</CardTitle>
        <CardDescription>Répartition par statut de complétion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de progression visuelle */}
        <div className="w-full h-8 flex rounded-lg overflow-hidden">
          <div
            className="bg-green-600 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${completePercentage}%` }}
          >
            {completePercentage > 10 && `${completePercentage}%`}
          </div>
          <div
            className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${incompletePercentage}%` }}
          >
            {incompletePercentage > 10 && `${incompletePercentage}%`}
          </div>
          <div
            className="bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-medium"
            style={{ width: `${emptyPercentage}%` }}
          >
            {emptyPercentage > 10 && `${emptyPercentage}%`}
          </div>
        </div>

        {/* Légende */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Complets</span>
            </div>
            <div className="text-sm">
              <span className="font-bold">{complete}</span>
              <span className="text-muted-foreground ml-1">({completePercentage}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">En cours</span>
            </div>
            <div className="text-sm">
              <span className="font-bold">{incomplete}</span>
              <span className="text-muted-foreground ml-1">({incompletePercentage}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Vides</span>
            </div>
            <div className="text-sm">
              <span className="font-bold">{empty}</span>
              <span className="text-muted-foreground ml-1">({emptyPercentage}%)</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
