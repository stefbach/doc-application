"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createPatientList, updatePatientList } from "@/app/actions/list-actions"
import type { PatientList } from "@/app/actions/types"

interface ListFormProps {
  userId: string
  existingList?: PatientList
}

const PREDEFINED_COLORS = [
  { name: "Bleu", value: "#3b82f6" },
  { name: "Vert", value: "#22c55e" },
  { name: "Rouge", value: "#ef4444" },
  { name: "Jaune", value: "#eab308" },
  { name: "Violet", value: "#a855f7" },
  { name: "Rose", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
]

export default function ListForm({ userId, existingList }: ListFormProps) {
  const [name, setName] = useState(existingList?.name || "")
  const [description, setDescription] = useState(existingList?.description || "")
  const [color, setColor] = useState(existingList?.color || PREDEFINED_COLORS[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la liste est requis.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (existingList) {
        await updatePatientList(existingList.id, name, description || null, color, null)
        toast({
          title: "Liste mise à jour",
          description: "La liste a été mise à jour avec succès.",
        })
      } else {
        await createPatientList(userId, name, description || null, color, null)
        toast({
          title: "Liste créée",
          description: "La nouvelle liste a été créée avec succès.",
        })
      }
      router.push("/dashboard/board")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingList ? "Modifier la Liste" : "Nouvelle Liste"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom de la liste */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la liste *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Patients prioritaires"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez une description pour cette liste..."
              rows={3}
            />
          </div>

          {/* Couleur */}
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="grid grid-cols-4 gap-2">
              {PREDEFINED_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    color === colorOption.value ? "border-primary ring-2 ring-primary ring-offset-2" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: colorOption.value + "20" }}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div className="space-y-2">
            <Label>Aperçu</Label>
            <div
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: color + "15",
                borderColor: color,
              }}
            >
              <h3 className="font-semibold" style={{ color: color }}>
                {name || "Nom de la liste"}
              </h3>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : existingList ? "Mettre à jour" : "Créer la liste"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/board")}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
