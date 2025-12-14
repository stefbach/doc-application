"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Search,
  ArrowUpDown,
  Filter,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PatientStatus {
  patientId: string
  patientName: string | null
  totalDocuments: number
  completionPercentage: number
  missingCategories: string[]
  documentsByCategory: Record<string, number>
}

interface PatientsTrackingTableProps {
  patients: PatientStatus[]
}

type SortField = "name" | "documents" | "completion" | "missing"
type SortDirection = "asc" | "desc"
type FilterStatus = "all" | "complete" | "incomplete" | "empty"
type MissingDocumentFilter = "all" | "S2 Form" | "S2 Provider" | "Devis" | "Compte Rendu Consultation" | "Undelay" | "Pièce Identité" | "Justificatif de Domicile" | "Patient Authorisation Letter" | "Lettre GP" | "Autre"

export function PatientsTrackingTable({ patients }: PatientsTrackingTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [missingDocFilter, setMissingDocFilter] = useState<MissingDocumentFilter>("all")

  // Filtrage et tri
  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients]

    // Filtrage par recherche
    if (searchQuery.trim() !== "") {
      result = result.filter((p) =>
        (p.patientName || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtrage par statut
    if (filterStatus !== "all") {
      result = result.filter((p) => {
        if (filterStatus === "complete") return p.completionPercentage === 100
        if (filterStatus === "incomplete") return p.completionPercentage > 0 && p.completionPercentage < 100
        if (filterStatus === "empty") return p.totalDocuments === 0
        return true
      })
    }

    // Filtrage par document manquant OU documents "Autre"
    if (missingDocFilter !== "all") {
      if (missingDocFilter === "Autre") {
        // Filtre spécial pour les patients avec documents "Autre"
        result = result.filter((p) => p.documentsByCategory["Autre"] && p.documentsByCategory["Autre"] > 0)
      } else {
        // Filtre pour les patients sans un document spécifique
        result = result.filter((p) => p.missingCategories.includes(missingDocFilter))
      }
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "name":
          comparison = (a.patientName || "").localeCompare(b.patientName || "")
          break
        case "documents":
          comparison = a.totalDocuments - b.totalDocuments
          break
        case "completion":
          comparison = a.completionPercentage - b.completionPercentage
          break
        case "missing":
          comparison = a.missingCategories.length - b.missingCategories.length
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [patients, searchQuery, sortField, sortDirection, filterStatus, missingDocFilter])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
    setMissingDocFilter("all")
    setSortField("name")
    setSortDirection("asc")
  }

  const hasActiveFilters = searchQuery !== "" || filterStatus !== "all" || missingDocFilter !== "all"

  // Statistiques filtrées
  const stats = useMemo(() => {
    return {
      total: filteredAndSortedPatients.length,
      complete: filteredAndSortedPatients.filter((p) => p.completionPercentage === 100).length,
      incomplete: filteredAndSortedPatients.filter((p) => p.completionPercentage > 0 && p.completionPercentage < 100)
        .length,
      empty: filteredAndSortedPatients.filter((p) => p.totalDocuments === 0).length,
    }
  }, [filteredAndSortedPatients])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tableau de Suivi des Patients</CardTitle>
        <CardDescription>
          Recherchez, filtrez et triez les patients selon leurs documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de filtres */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="complete">Complets</SelectItem>
                <SelectItem value="incomplete">Incomplets</SelectItem>
                <SelectItem value="empty">Sans documents</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="icon">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Nouveau filtre par document manquant */}
          <Select value={missingDocFilter} onValueChange={(value) => setMissingDocFilter(value as MissingDocumentFilter)}>
            <SelectTrigger className="w-full">
              <AlertCircle className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrer par document manquant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les documents</SelectItem>
              <SelectItem value="S2 Form">Patients sans S2 Form</SelectItem>
              <SelectItem value="S2 Provider">Patients sans S2 Provider</SelectItem>
              <SelectItem value="Devis">Patients sans Devis</SelectItem>
              <SelectItem value="Compte Rendu Consultation">Patients sans Compte Rendu Consultation</SelectItem>
              <SelectItem value="Undelay">Patients sans Undelay</SelectItem>
              <SelectItem value="Pièce Identité">Patients sans Pièce Identité</SelectItem>
              <SelectItem value="Justificatif de Domicile">Patients sans Justificatif de Domicile</SelectItem>
              <SelectItem value="Patient Authorisation Letter">Patients sans Patient Authorisation Letter</SelectItem>
              <SelectItem value="Lettre GP">Patients sans Lettre GP</SelectItem>
              <SelectItem value="Autre">Patients avec documents "Autre"</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques filtrées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
            <div className="text-xs text-muted-foreground">Complets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.incomplete}</div>
            <div className="text-xs text-muted-foreground">Incomplets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500">{stats.empty}</div>
            <div className="text-xs text-muted-foreground">Vides</div>
          </div>
        </div>

        {/* Tableau */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("name")}
                    className="-ml-3"
                  >
                    Nom du Patient
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("documents")}
                  >
                    Nb Docs
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("completion")}
                  >
                    Complétion
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("missing")}
                  >
                    Manquants
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-semibold">Aucun patient trouvé</p>
                    <p className="text-sm text-muted-foreground">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedPatients.map((patientStatus) => {
                  const isComplete = patientStatus.completionPercentage === 100
                  const hasIssues = patientStatus.missingCategories.length > 0
                  const hasAutreDocuments = patientStatus.documentsByCategory["Autre"] && patientStatus.documentsByCategory["Autre"] > 0

                  return (
                    <TableRow key={patientStatus.patientId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{patientStatus.patientName || `Patient ${patientStatus.patientId.substring(0, 8)}...`}</span>
                          {hasAutreDocuments && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Autre ({patientStatus.documentsByCategory["Autre"]})
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{patientStatus.totalDocuments}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{patientStatus.completionPercentage}%</span>
                          </div>
                          <Progress value={patientStatus.completionPercentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {isComplete ? (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Complet
                          </Badge>
                        ) : hasIssues ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Incomplet
                          </Badge>
                        ) : (
                          <Badge variant="outline">Vide</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {patientStatus.missingCategories.length > 0 ? (
                          <Badge variant="outline">{patientStatus.missingCategories.length}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/patients/${patientStatus.patientId}/documents`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
