"use client"

import type React from "react"

import { useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { toast } = useToast()

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast({
          title: "Inscription réussie!",
          description: "Veuillez vérifier votre email pour confirmer votre compte.",
        })
        // router.push("/"); // Redirection après inscription ou attente de confirmation
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast({ title: "Connexion réussie!" })
        router.push("/") // Redirige vers la page d'accueil/dashboard
        router.refresh() // Important pour que le layout se mette à jour
      }
    } catch (error: any) {
      toast({ title: "Erreur d'authentification", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isSignUp ? "Créer un compte" : "Se connecter"}</CardTitle>
        <CardDescription>
          {isSignUp
            ? "Entrez vos informations pour créer un compte."
            : "Entrez vos identifiants pour accéder à votre compte."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nom@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? "S'inscrire" : "Se connecter"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Déjà un compte? Se connecter" : "Pas de compte? S'inscrire"}
        </Button>
      </CardFooter>
    </Card>
  )
}
