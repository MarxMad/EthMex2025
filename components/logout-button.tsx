'use client'

import { useRouter } from 'next/navigation'
import { useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function LogoutButton({ variant = 'ghost', size = 'icon', className }: LogoutButtonProps) {
  const router = useRouter()
  const { disconnect } = useDisconnect()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleLogout = async () => {
    setIsDisconnecting(true)
    try {
      // Desconectar la wallet primero
      disconnect()
      // Esperar un momento para que la desconexión se procese
      await new Promise(resolve => setTimeout(resolve, 300))
      // Redirigir al home
      router.push('/')
      // Forzar recarga para limpiar cualquier estado local
      router.refresh()
    } catch (error) {
      console.error('Error al desconectar:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isDisconnecting}
      className={className}
      title="Desconectar wallet y salir"
    >
      <LogOut className="w-5 h-5" />
    </Button>
  )
}

