'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useUserRole } from '@/lib/hooks/use-user-role'

/**
 * Componente que redirige al usuario a su dashboard según su rol
 * Solo redirige si está en la página principal y está conectado
 * NO redirige inmediatamente para permitir desconectar
 */
export function RoleBasedRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { role, isLoading } = useUserRole()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    // Solo redirigir desde la página principal si está conectado y tiene rol
    // Agregar un delay para permitir que el usuario desconecte si quiere
    if (pathname === '/' && isConnected && !isLoading && role) {
      redirectTimeoutRef.current = setTimeout(() => {
        switch (role) {
          case 'centro':
            router.push('/centro/dashboard')
            break
          case 'recolector':
            router.push('/recolector/dashboard')
            break
          case 'usuario':
            router.push('/usuario/dashboard')
            break
        }
      }, 2000) // Esperar 2 segundos antes de redirigir
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [pathname, isConnected, role, isLoading, router])

  return null
}
