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
import { toast } from "react-hot-toast"
import type { AuthResponse } from "@supabase/supabase-js"
import { getSingletonSupabaseBrowserClient } from "@/lib/supabase/client"

interface AuthFormProps {
  type: "sign-in" | "sign-up"
  className?: string
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

const AuthForm: React.FC<AuthFormProps> = ({ type, className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = getSingletonSupabaseBrowserClient()

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
          toast.error(error.message)
        } else {
          toast.success("Signed in successfully!")
          router.refresh()
          router.push("/dashboard")
        }
      } else {
        const { error }: AuthResponse = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })

        if (error) {
          toast.error(error.message)
        } else {
          toast.success("Confirmation email sent!")
          router.push("/auth/verify-email")
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="mail@example.com" {...field} type="email" />
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
                  <Input placeholder="Password" {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} className="w-full" type="submit">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default AuthForm
