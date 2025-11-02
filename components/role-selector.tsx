'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useIsRecyclingCenter } from '@/lib/hooks/use-recycling-contract'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Package, Truck, Building2, Loader2 } from 'lucide-react'

export type SelectedRole = 'usuario' | 'recolector' | null

const ROLE_STORAGE_KEY = 'selected_user_role'

/**
 * Obtiene el rol seleccionado del usuario para una dirección específica
 */
export function getSelectedRole(address: string | undefined): SelectedRole {
  if (!address || typeof window === 'undefined') return null
  try {
    const key = `${ROLE_STORAGE_KEY}_${address.toLowerCase()}`
    const stored = localStorage.getItem(key)
    if (stored === 'usuario' || stored === 'recolector') {
      return stored as SelectedRole
    }
    return null
  } catch {
    return null
  }
}

/**
 * Guarda el rol seleccionado del usuario
 */
export function setSelectedRole(address: string | undefined, role: SelectedRole): void {
  if (!address || typeof window === 'undefined') return
  try {
    const key = `${ROLE_STORAGE_KEY}_${address.toLowerCase()}`
    if (role) {
      localStorage.setItem(key, role)
    } else {
      localStorage.removeItem(key)
    }
  } catch {
    // Ignorar errores
  }
}

/**
 * Componente para seleccionar el rol del usuario al conectar la wallet
 * Si es centro de reciclaje, automáticamente se asigna como centro
 * Si no es centro, permite elegir entre usuario o recolector
 */
export function RoleSelector() {
  const { address, isConnected } = useAccount()
  const { isRecyclingCenter, isLoading: checkingCenter } = useIsRecyclingCenter(
    address ? (address as `0x${string}`) : undefined
  )
  const [selectedRole, setSelectedRoleState] = useState<SelectedRole>(null)
  const [mounted, setMounted] = useState(false)
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Verificar si ya tiene rol seleccionado
  useEffect(() => {
    if (!mounted || !address) {
      setSelectedRoleState(null)
      setShowSelector(false)
      return
    }

    // Si es centro, no mostrar selector (se asigna automáticamente)
    if (isRecyclingCenter) {
      setSelectedRoleState(null)
      setShowSelector(false)
      return
    }

    // Esperar a que termine de verificar si es centro
    if (checkingCenter) {
      return
    }

    // Una vez verificado que NO es centro, verificar si tiene rol seleccionado
    const existingRole = getSelectedRole(address)
    
    // Si no tiene rol seleccionado, mostrar selector
    if (!existingRole) {
      setShowSelector(true)
    } else {
      setSelectedRoleState(existingRole)
      setShowSelector(false)
    }
  }, [address, isRecyclingCenter, checkingCenter, mounted])

  const handleSelectRole = (role: SelectedRole) => {
    if (!address) return
    setSelectedRole(address, role)
    setSelectedRoleState(role)
    setShowSelector(false)
    // Recargar página para aplicar el rol
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  if (!mounted || !isConnected || !address) {
    return null
  }

  // Si está verificando si es centro, mostrar loading
  if (checkingCenter) {
    return (
      <Card className="mb-4 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Verificando rol...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si es centro, no mostrar selector
  if (isRecyclingCenter) {
    return (
      <Alert className="mb-4 border-green-500/20 bg-green-500/5">
        <Building2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-sm text-green-700 dark:text-green-400">
          Tu wallet está registrada como <strong>Centro de Reciclaje</strong>. 
          Puedes gestionar entregas y configurar precios.
        </AlertDescription>
      </Alert>
    )
  }

  // Si ya tiene rol seleccionado y no es centro, no mostrar selector
  if (selectedRole && !showSelector) {
    return null
  }

  // Mostrar selector solo si no tiene rol seleccionado
  if (!showSelector) {
    return null
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Selecciona tu Rol
        </CardTitle>
        <CardDescription>
          Elige cómo quieres usar la plataforma. Puedes cambiar esto más tarde.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-auto p-4 flex items-start gap-4 justify-start hover:bg-primary/10"
          onClick={() => handleSelectRole('usuario')}
        >
          <div className="flex-1 text-left">
            <div className="font-semibold flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-primary" />
              Usuario
            </div>
            <div className="text-sm text-muted-foreground">
              Crea solicitudes de recolección y recibe pagos cuando el material sea validado
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100" />
        </Button>

        <Button
          variant="outline"
          className="w-full h-auto p-4 flex items-start gap-4 justify-start hover:bg-primary/10"
          onClick={() => handleSelectRole('recolector')}
        >
          <div className="flex-1 text-left">
            <div className="font-semibold flex items-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-primary" />
              Recolector
            </div>
            <div className="text-sm text-muted-foreground">
              Acepta solicitudes de recolección, bloquea el pago en el contrato y completa entregas
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100" />
        </Button>
      </CardContent>
    </Card>
  )
}

