"use client"

import React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { UploadCloud, FileText, Download, Trash2, Loader2 } from "lucide-react"
import {
  addDocumentMetadata,
  getSignedUrlForDownload,
  deleteDocumentAction,
  type DocumentType,
} from "@/app/actions/document-actions"
import { useRouter } from "next/navigation"

interface PatientDocumentManagerProps {
  patientId: string
  initialDocuments: DocumentType[]
  patientName: string
}

export default function PatientDocumentManager({
  patientId,
  initialDocuments,
  patientName,
}: PatientDocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentType[]>(initialDocuments)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)

  const supabase = React.useMemo(() => createSupabaseBrowserClient(), [])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setDocuments(initialDocuments)
  }, [initialDocuments])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    } else {
      setFile(null)
    }
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez choisir un fichier à uploader.",
        variant: "destructive",
      })
      return
    }
    if (!patientId) {
      toast({
        title: "ID Patient manquant",
        description: "Impossible d'uploader sans ID patient.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const { data: userSession } = await supabase.auth.getUser()
      if (!userSession?.user) {
        toast({ title: "Non authentifié", description: "Veuillez vous connecter.", variant: "destructive" })
        router.push("/login")
        return
      }

      const fileName = `${userSession.user.id}/${patientId}/${Date.now()}_${file.name}`
      const uploadResponse = await supabase.storage
        .from("patient_documents") // Assurez-vous que ce nom de bucket correspond à votre configuration Supabase
        .upload(fileName, file)

      const uploadError = uploadResponse.error
      if (uploadError) throw uploadError

      const newDocumentMetadata = await addDocumentMetadata({
        patient_id: patientId,
        file_name: file.name,
        storage_path: fileName,
        file_type: file.type,
        file_size: file.size,
      })

      if (newDocumentMetadata) {
        setDocuments((prevDocs) => [...prevDocs, newDocumentMetadata])
        toast({ title: "Upload réussi!", description: `Le fichier ${file.name} a été uploadé.` })
        setFile(null)
        // Reset file input if possible or clear its visual state
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        toast({
          title: "Erreur de métadonnées",
          description: "Le fichier a été uploadé mais les métadonnées n'ont pas pu être sauvegardées.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (filePath: string, originalFileName: string) => {
    try {
      const url = await getSignedUrlForDownload(filePath)
      if (url) {
        // Créer un lien temporaire pour déclencher le téléchargement avec le nom original
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", originalFileName) // Suggère le nom original du fichier
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast({ title: "Téléchargement initié", description: `Téléchargement de ${originalFileName} en cours.` })
      } else {
        toast({
          title: "Erreur de téléchargement",
          description: "Impossible d'obtenir l'URL de téléchargement.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({ title: "Erreur de téléchargement", description: error.message, variant: "destructive" })
    }
  }

  const handleDelete = async (documentId: string, storagePath: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document? Cette action est irréversible.")) return
    setDeletingDocId(documentId)
    try {
      await deleteDocumentAction(documentId, storagePath)
      setDocuments(documents.filter((doc) => doc.id !== documentId))
      toast({ title: "Document supprimé", description: "Le document a été supprimé avec succès." })
    } catch (error: any) {
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" })
    } finally {
      setDeletingDocId(null)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadCloud className="mr-2 h-5 w-5" /> Uploader un nouveau document
          </CardTitle>
          <CardDescription>Sélectionnez un fichier à associer à {patientName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Choisir un fichier</Label>
              <Input id="file-upload" type="file" onChange={handleFileChange} />
            </div>
            {file && <p className="text-sm text-muted-foreground">Fichier sélectionné: {file.name}</p>}
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Uploader
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Documents existants
          </CardTitle>
          <CardDescription>Liste des documents pour {patientName}.</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground">Aucun document trouvé pour ce patient.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du fichier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Uploadé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.file_name}</TableCell>
                    <TableCell>{doc.file_type || "N/A"}</TableCell>
                    <TableCell>{doc.file_size ? (doc.file_size / 1024).toFixed(2) + " KB" : "N/A"}</TableCell>
                    <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.storage_path, doc.file_name)}
                      >
                        <Download className="mr-1 h-4 w-4" /> Télécharger
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.storage_path)}
                        disabled={deletingDocId === doc.id}
                      >
                        {deletingDocId === doc.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 h-4 w-4" />
                        )}
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
