'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { setCollectorWallet, isCollectorWallet } from '@/lib/hooks/use-user-role'
import { CheckCircle2, Truck, AlertCircle } from 'lucide-react'

/**
 * Componente para activar el rol de recolector manualmente
 * Útil para demostraciones o cuando una wallet no ha aceptado entregas aún
 */
export function ActivateCollectorRole() {
  const { address, isConnected } = useAccount()
  const [isCollector, setIsCollector] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [justActivated, setJustActivated] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && address) {
      setIsCollector(isCollectorWallet(address))
    }
  }, [mounted, address])

  const handleToggleCollector = () => {
    if (!address) return
    
    const newState = !isCollector
    setCollectorWallet(address, newState)
    setIsCollector(newState)
    
    if (newState) {
      setJustActivated(true)
      setTimeout(() => {
        setJustActivated(false)
        // Recargar la página para que el sistema detecte el nuevo rol
        window.location.reload()
      }, 1500)
    } else {
      // Recargar inmediatamente si desactiva
      window.location.reload()
    }
  }

  if (!mounted || !isConnected || !address) {
    return null
  }

  return (
    <Card className="p-4 mb-6 bg-accent/5 border-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">
              {isCollector ? 'Rol de Recolector Activo' : 'Activar como Recolector'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {isCollector 
              ? 'Tu wallet está configurada como recolector. Podrás ver y aceptar solicitudes de recolección.'
              : 'Marca esta wallet como recolector para acceder al dashboard de recolectores. Útil para demostraciones.'}
          </p>
        </div>
        <Button
          variant={isCollector ? "outline" : "default"}
          onClick={handleToggleCollector}
          className="ml-4"
        >
          {isCollector ? 'Desactivar' : 'Activar como Recolector'}
        </Button>
      </div>
      
      {justActivated && (
        <Alert className="mt-4 border-green-500/20 bg-green-500/5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            ¡Rol de recolector activado! Redirigiendo al dashboard de recolectores...
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}

