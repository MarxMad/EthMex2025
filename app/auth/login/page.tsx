"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Logo } from "@/components/logo"
import { User, Truck, Building2, ArrowLeft } from "lucide-react"

type UserRole = 'usuario' | 'recolector' | 'centro'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>('usuario')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulación de login - en producción conectar con Supabase
    setTimeout(() => {
      // Redirigir según el rol seleccionado
      switch (selectedRole) {
        case 'recolector':
          router.push("/recolector/dashboard")
          break
        case 'centro':
          router.push("/centro/dashboard")
          break
        case 'usuario':
        default:
          router.push("/usuario/dashboard")
          break
      }
      setLoading(false)
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
            <Logo size={80} showText={true} />
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2">Iniciar Sesión</h1>
          <p className="text-center text-muted-foreground mb-8">Accede a tu cuenta de CriKula</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Selector de Rol */}
            <div className="space-y-3">
              <Label>Selecciona tu rol</Label>
              <RadioGroup 
                value={selectedRole} 
                onValueChange={(value) => setSelectedRole(value as UserRole)}
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="usuario" id="usuario" />
                  <Label htmlFor="usuario" className="flex-1 cursor-pointer flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Usuario / Empresa</div>
                      <div className="text-xs text-muted-foreground">Solicita recolecciones</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="recolector" id="recolector" />
                  <Label htmlFor="recolector" className="flex-1 cursor-pointer flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Recolector</div>
                      <div className="text-xs text-muted-foreground">Acepta solicitudes de recolección</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="centro" id="centro" />
                  <Label htmlFor="centro" className="flex-1 cursor-pointer flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Centro de Reciclaje</div>
                      <div className="text-xs text-muted-foreground">Verifica y procesa materiales</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

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
      </div>
    </div>
  )
}
