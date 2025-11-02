'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { getSelectedRole, setSelectedRole } from '@/components/role-selector'
import { CheckCircle2, Truck, AlertCircle, Package } from 'lucide-react'

/**
 * Componente para cambiar el rol del usuario
 * Permite cambiar entre usuario y recolector
 * NOTA: Si es centro de reciclaje, no se puede cambiar (viene del contrato)
 */
export function ActivateCollectorRole() {
  const { address, isConnected } = useAccount()
  const [currentRole, setCurrentRole] = useState<'usuario' | 'recolector' | null>(null)
  const [mounted, setMounted] = useState(false)
  const [justChanged, setJustChanged] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && address) {
      const role = getSelectedRole(address)
      setCurrentRole(role)
    }
  }, [address, mounted])

  const handleChangeRole = (newRole: 'usuario' | 'recolector') => {
    if (!address) return
    
    setSelectedRole(address, newRole)
    setCurrentRole(newRole)
    setJustChanged(true)
    
    setTimeout(() => {
      setJustChanged(false)
      // Recargar la página para aplicar el nuevo rol
      window.location.reload()
    }, 1500)
  }

  if (!mounted || !isConnected || !address) {
    return null
  }

  // Si no tiene rol seleccionado, mostrar mensaje para ir al selector
  if (!currentRole) {
    return (
      <Card className="p-4 mb-6 bg-accent/5 border-accent/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">
              Selecciona tu rol
            </p>
            <p className="text-sm text-muted-foreground">
              Ve al inicio para seleccionar si eres usuario o recolector.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-6 bg-accent/5 border-accent/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-foreground">
              Rol actual: {currentRole === 'recolector' ? 'Recolector' : 'Usuario'}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentRole === 'recolector' 
                ? 'Puedes aceptar solicitudes de recolección y bloquear pagos.'
                : 'Puedes crear solicitudes de recolección y recibir pagos.'
              }
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={currentRole === 'usuario' ? "default" : "outline"}
          size="sm"
          onClick={() => handleChangeRole('usuario')}
          disabled={justChanged || currentRole === 'usuario'}
          className="flex-1"
        >
          <Package className="w-4 h-4 mr-2" />
          Cambiar a Usuario
        </Button>
        <Button
          variant={currentRole === 'recolector' ? "default" : "outline"}
          size="sm"
          onClick={() => handleChangeRole('recolector')}
          disabled={justChanged || currentRole === 'recolector'}
          className="flex-1"
        >
          <Truck className="w-4 h-4 mr-2" />
          Cambiar a Recolector
        </Button>
      </div>
      
      {justChanged && (
        <Alert className="mt-3 border-green-500/20 bg-green-500/5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-700 dark:text-green-400">
            Rol cambiado exitosamente. La página se recargará automáticamente...
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
