"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast" // Corrected import
import type { AuthResponse } from "@supabase/supabase-js"
import { getSingletonSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface AuthFormProps {
  type: "sign-in" | "sign-up"
  className?: string
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, {
    message: "Le mot de passe ne peut pas être vide.",
  }),
})

const AuthForm: React.FC<AuthFormProps> = ({ type, className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = getSingletonSupabaseBrowserClient()
  const { toast } = useToast() // Correct way to get the toast function

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true)

    try {
      if (type === "sign-in") {
        const { error }: AuthResponse = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

        if (error) {
          toast({
            // Corrected toast call
            title: "Sign-in Error",
            description: error.message,
            variant: "destructive",
          })
        } else {
          toast({
            // Corrected toast call
            title: "Signed in successfully!",
          })
          router.refresh() // Refresh server components
          router.push("/dashboard/patients") // Redirect to a relevant page
        }
      } else {
        // sign-up
        const { error }: AuthResponse = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })

        if (error) {
          toast({
            // Corrected toast call
            title: "Sign-up Error",
            description: error.message,
            variant: "destructive",
          })
        } else {
          toast({
            // Corrected toast call
            title: "Confirmation email sent!",
            description: "Please check your email to verify your account.",
          })
          // Optionally, redirect to a page informing the user to check their email
          // router.push("/auth/verify-email");
        }
      }
    } catch (error: any) {
      toast({
        // Corrected toast call
        title: "An unexpected error occurred",
        description: error.message || "Something went wrong!",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Determine button text and toggle text based on type
  const buttonText = type === "sign-in" ? "Sign In" : "Sign Up"
  const toggleFormText = type === "sign-in" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"

  const toggleFormType = () => {
    // This basic toggle won't work directly if 'type' is a prop.
    // For a real toggle, this component would need to manage its own state for type,
    // or the parent component would need to re-render it with a different 'type' prop.
    // For now, we'll assume 'type' is fixed per instance or handled by parent.
    // If you need this form to toggle between sign-in and sign-up itself,
    // we'd need to adjust its internal state management.
    console.log("Toggling form type is not fully implemented in this version of AuthForm.")
    // A simple way if this component were to manage its own type:
    // setFormType(currentType => currentType === 'sign-in' ? 'sign-up' : 'sign-in');
  }

  return (
    <div className={cn("w-full max-w-md p-8 space-y-8 bg-card shadow-lg rounded-lg", className)}>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {type === "sign-in" ? "Sign in to your account" : "Create a new account"}
        </h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} className="w-full" type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </form>
      </Form>
      {/* 
      The toggle functionality needs to be properly implemented if desired.
      This typically involves the parent component controlling the 'type' prop,
      or this component managing its own 'formType' state.
      For simplicity, if you have separate /login and /signup pages,
      each would render AuthForm with a fixed 'type' prop.
      If you want a single page that toggles, the logic would be different.
      The original AuthForm from previous turns had a self-contained toggle.
      This version from Git sync receives 'type' as a prop.
    */}
      {/* <div className="text-sm text-center">
      <button
        type="button"
        onClick={toggleFormType}
        className="font-medium text-primary hover:text-primary/90"
      >
        {toggleFormText}
      </button>
    </div> */}
    </div>
  )
}

export default AuthForm
