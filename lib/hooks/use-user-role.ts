'use client'

import { useAccount } from 'wagmi'
import { useIsRecyclingCenter } from './use-recycling-contract'
import { useUserDeliveries } from './use-recycling-contract'
import { useState, useEffect } from 'react'
import { getSelectedRole, type SelectedRole } from '@/components/role-selector'

export type UserRole = 'usuario' | 'recolector' | 'centro' | null

/**
 * Hook para determinar el rol del usuario conectado
 * - Centro: si la wallet está registrada como centro de reciclaje (verificado en contrato)
 * - Recolector: si el usuario seleccionó rol de recolector O ha aceptado entregas
 * - Usuario: si el usuario seleccionó rol de usuario O por defecto
 */

// Constante para la clave de localStorage (mantenemos compatibilidad)
const COLLECTOR_ROLE_KEY = 'user_role_collector'

/**
 * Función helper para verificar si una wallet está marcada como recolector
 */
export function isCollectorWallet(address: string | undefined): boolean {
  if (!address || typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(`${COLLECTOR_ROLE_KEY}_${address.toLowerCase()}`)
    return stored === 'true'
  } catch {
    return false
  }
}

/**
 * Función helper para marcar una wallet como recolector
 */
export function setCollectorWallet(address: string | undefined, isCollector: boolean): void {
  if (!address || typeof window === 'undefined') return
  try {
    const key = `${COLLECTOR_ROLE_KEY}_${address.toLowerCase()}`
    if (isCollector) {
      localStorage.setItem(key, 'true')
    } else {
      localStorage.removeItem(key)
    }
  } catch {
    // Ignorar errores
  }
}

export function useUserRole(): {
  role: UserRole
  isLoading: boolean
} {
  const { address, isConnected } = useAccount()
  const { isRecyclingCenter, isLoading: checkingCenter } = useIsRecyclingCenter(
    address ? (address as `0x${string}`) : undefined
  )
  const { deliveries: userDeliveries, isLoading: loadingUserDeliveries } = useUserDeliveries()
  const [isMarkedAsCollector, setIsMarkedAsCollector] = useState(false)
  const [hasAcceptedDelivery, setHasAcceptedDelivery] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Verificar si está marcado como recolector explícitamente
  useEffect(() => {
    if (!mounted || !address) {
      setIsMarkedAsCollector(false)
      return
    }

    if (typeof window === 'undefined') {
      setIsMarkedAsCollector(false)
      return
    }

    setIsMarkedAsCollector(isCollectorWallet(address))
  }, [address, mounted])

  // Verificar si ha aceptado alguna entrega (recolector implícito)
  useEffect(() => {
    if (!mounted || !address) {
      setHasAcceptedDelivery(false)
      return
    }

    if (typeof window === 'undefined') {
      setHasAcceptedDelivery(false)
      return
    }

    try {
      const collectorDeliveriesKey = `collector_deliveries_${address.toLowerCase()}`
      const stored = localStorage.getItem(collectorDeliveriesKey)
      if (stored) {
        const deliveries: string[] = JSON.parse(stored)
        setHasAcceptedDelivery(deliveries.length > 0)
      } else {
        setHasAcceptedDelivery(false)
      }
    } catch {
      setHasAcceptedDelivery(false)
    }
  }, [address, mounted])

  const isLoading = checkingCenter || loadingUserDeliveries

  if (!isConnected || !address) {
    return {
      role: null,
      isLoading: false,
    }
  }

  // Prioridad: Centro > Rol seleccionado > Recolector (implícito por entregas aceptadas) > Usuario

  // Si es centro de reciclaje (verificado en el contrato), siempre es centro
  if (isRecyclingCenter) {
    return {
      role: 'centro',
      isLoading,
    }
  }

  // Verificar si el usuario seleccionó un rol explícitamente
  const selectedRole = mounted ? getSelectedRole(address) : null

  if (selectedRole) {
    return {
      role: selectedRole,
      isLoading,
    }
  }

  // Si no tiene rol seleccionado pero ha aceptado entregas, es recolector implícito
  if (hasAcceptedDelivery) {
    return {
      role: 'recolector',
      isLoading,
    }
  }

  // Por defecto, si no tiene rol seleccionado y no ha aceptado entregas, es usuario
  // (pero el selector de rol aparecerá para que elija)
  return {
    role: null, // null indica que debe seleccionar un rol
    isLoading,
  }
}

