'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useUserRole } from '@/lib/hooks/use-user-role'

/**
 * Componente que redirige al usuario a su dashboard según su rol
 * Solo redirige si está en la página principal y está conectado
 */
export function RoleBasedRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { role, isLoading } = useUserRole()

  useEffect(() => {
    // Solo redirigir desde la página principal si está conectado y tiene rol
    if (pathname === '/' && isConnected && !isLoading && role) {
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
    }
  }, [pathname, isConnected, role, isLoading, router])

  return null
}

