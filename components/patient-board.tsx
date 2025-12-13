"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  MoreVertical,
  Plus,
  Trash2,
  Edit,
  FolderOpen,
} from "lucide-react"
import Link from "next/link"
import type { PatientDocumentStatus } from "@/app/actions/patient-actions"
import type { PatientList } from "@/app/actions/types"
import {
  addPatientToList,
  removePatientFromList,
  getPatientsInList,
  deletePatientList,
} from "@/app/actions/list-actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface PatientBoardProps {
  initialPatients: PatientDocumentStatus[]
  initialLists: PatientList[]
  userId: string
}

interface BoardColumn {
  id: string
  title: string
  color: string
  icon: React.ReactNode
  filter: (patient: PatientDocumentStatus) => boolean
  isCustomList?: boolean
  listData?: PatientList
}

export default function PatientBoard({ initialPatients, initialLists, userId }: PatientBoardProps) {
  const [patients] = useState(initialPatients)
  const [lists, setLists] = useState(initialLists)
  const [listPatients, setListPatients] = useState<{ [key: string]: string[] }>({})
  const [selectedPatient, setSelectedPatient] = useState<PatientDocumentStatus | null>(null)
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Charger les patients de chaque liste
  useEffect(() => {
    async function loadListPatients() {
      const assignments: { [key: string]: string[] } = {}
      for (const list of lists) {
        const patientIds = await getPatientsInList(list.id)
        assignments[list.id] = patientIds
      }
      setListPatients(assignments)
    }
    loadListPatients()
  }, [lists])

  // Colonnes par défaut (statut de documents)
  const defaultColumns: BoardColumn[] = [
    {
      id: "complete",
      title: "Dossiers Complets",
      color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      icon: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
      filter: (p) => p.completionPercentage === 100,
    },
    {
      id: "in-progress",
      title: "En Cours",
      color: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
      icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      filter: (p) => p.completionPercentage > 0 && p.completionPercentage < 100,
    },
    {
      id: "incomplete",
      title: "À Compléter",
      color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
      filter: (p) => p.completionPercentage === 0,
    },
  ]

  // Colonnes des listes personnalisées
  const customColumns: BoardColumn[] = lists.map((list) => ({
    id: list.id,
    title: list.name,
    color: list.color || "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    icon: <FolderOpen className="h-5 w-5" style={{ color: list.color }} />,
    filter: (p) => listPatients[list.id]?.includes(p.patientId) || false,
    isCustomList: true,
    listData: list,
  }))

  const allColumns = [...defaultColumns, ...customColumns]

  const handleAddToList = async (patientId: string, listId: string) => {
    try {
      await addPatientToList(listId, patientId)
      // Recharger les assignations
      const patientIds = await getPatientsInList(listId)
      setListPatients((prev) => ({ ...prev, [listId]: patientIds }))
      toast({
        title: "Patient ajouté",
        description: "Le patient a été ajouté à la liste.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRemoveFromList = async (patientId: string, listId: string) => {
    try {
      await removePatientFromList(listId, patientId)
      // Recharger les assignations
      const patientIds = await getPatientsInList(listId)
      setListPatients((prev) => ({ ...prev, [listId]: patientIds }))
      toast({
        title: "Patient retiré",
        description: "Le patient a été retiré de la liste.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette liste ?")) return

    try {
      await deletePatientList(listId)
      setLists(lists.filter((l) => l.id !== listId))
      toast({
        title: "Liste supprimée",
        description: "La liste a été supprimée avec succès.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Grille de colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {allColumns.map((column) => {
          const columnPatients = patients.filter(column.filter)

          return (
            <Card key={column.id} className={`${column.color} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {column.icon}
                    <CardTitle className="text-lg">{column.title}</CardTitle>
                    <Badge variant="secondary">{columnPatients.length}</Badge>
                  </div>
                  {column.isCustomList && column.listData && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/board/lists/${column.listData.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteList(column.listData!.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {columnPatients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Aucun patient</p>
                      </div>
                    ) : (
                      columnPatients.map((patient) => (
                        <Card
                          key={patient.patientId}
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-900"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">
                                  {patient.patientName || `Patient ${patient.patientId.substring(0, 8)}...`}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {patient.totalDocuments} document{patient.totalDocuments > 1 ? "s" : ""}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/patients/${patient.patientId}/documents`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Voir détails
                                    </Link>
                                  </DropdownMenuItem>
                                  {lists.length > 0 && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPatient(patient)
                                          setSelectedList(null)
                                        }}
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter à une liste
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {column.isCustomList && (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleRemoveFromList(patient.patientId, column.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Retirer de cette liste
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Barre de progression */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Complétion</span>
                                <span className="font-medium">{patient.completionPercentage}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${patient.completionPercentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Documents manquants */}
                            {patient.missingCategories.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {patient.missingCategories.slice(0, 2).map((cat) => (
                                  <Badge key={cat} variant="outline" className="text-xs">
                                    {cat}
                                  </Badge>
                                ))}
                                {patient.missingCategories.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{patient.missingCategories.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog pour ajouter à une liste */}
      <Dialog open={selectedPatient !== null} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter à une liste</DialogTitle>
            <DialogDescription>
              Sélectionnez une liste pour ajouter{" "}
              {selectedPatient?.patientName || `le patient ${selectedPatient?.patientId.substring(0, 8)}...`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {lists.map((list) => (
              <Button
                key={list.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (selectedPatient) {
                    handleAddToList(selectedPatient.patientId, list.id)
                    setSelectedPatient(null)
                  }
                }}
              >
                <FolderOpen className="mr-2 h-4 w-4" style={{ color: list.color }} />
                {list.name}
                {list.description && (
                  <span className="ml-2 text-xs text-muted-foreground">- {list.description}</span>
                )}
              </Button>
            ))}
            {lists.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Aucune liste disponible. Créez-en une nouvelle !
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
