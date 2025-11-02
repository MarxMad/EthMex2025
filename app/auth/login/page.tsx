"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Recycle, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulación de login - en producción conectar con Supabase
    setTimeout(() => {
      // Por ahora redirigir según email para demo
      if (email.includes("recolector")) {
        router.push("/recolector/dashboard")
      } else if (email.includes("centro")) {
        router.push("/centro/dashboard")
      } else {
        router.push("/usuario/dashboard")
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <Card className="p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Recycle className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2">Iniciar Sesión</h1>
          <p className="text-center text-muted-foreground mb-8">Accede a tu cuenta de CriKula</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/registro" className="text-primary hover:underline font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Demo: usa "recolector@test.com", "centro@test.com" o "usuario@test.com"
        </p>
      </div>
    </div>
  )
}
