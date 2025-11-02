'use client'

import { useAccount } from 'wagmi'
import { useIsRecyclingCenter } from './use-recycling-contract'
import { useUserDeliveries } from './use-recycling-contract'
import { useState, useEffect } from 'react'

export type UserRole = 'usuario' | 'recolector' | 'centro' | null

/**
 * Hook para determinar el rol del usuario conectado
 * - Centro: si la wallet está registrada como centro de reciclaje
 * - Recolector: si ha aceptado al menos una entrega (localStorage)
 * - Usuario: por defecto o si ha creado entregas
 */
export function useUserRole(): {
  role: UserRole
  isLoading: boolean
} {
  const { address, isConnected } = useAccount()
  const { isRecyclingCenter, isLoading: checkingCenter } = useIsRecyclingCenter(
    address ? (address as `0x${string}`) : undefined
  )
  const { deliveries: userDeliveries, isLoading: loadingUserDeliveries } = useUserDeliveries()
  const [hasAcceptedDelivery, setHasAcceptedDelivery] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Verificar si ha aceptado alguna entrega (recolector)
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

  // Prioridad: Centro > Recolector > Usuario
  if (isRecyclingCenter) {
    return {
      role: 'centro',
      isLoading,
    }
  }

  if (hasAcceptedDelivery) {
    return {
      role: 'recolector',
      isLoading,
    }
  }

  // Si ha creado entregas, es un usuario activo
  // Si no, también es usuario por defecto
  return {
    role: 'usuario',
    isLoading,
  }
}

