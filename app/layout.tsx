import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { UserCircle, LogOut } from "lucide-react"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestion Documents Patient",
  description: "Application pour gérer les documents des patients avec Supabase",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="fr">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-obesity-care-clinic.png"
                alt="Obesity Care Clinic Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            </Link>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <UserCircle className="mr-1 h-4 w-4" /> {user.email}
                  </span>
                  <form action="/auth/signout" method="post">
                    <Button variant="outline" size="sm" type="submit">
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </form>
                </>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Connexion</Link>
                </Button>
              )}
            </nav>
          </div>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
