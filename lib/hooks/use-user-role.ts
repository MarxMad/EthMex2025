'use client'

import { useAccount } from 'wagmi'
import { useIsRecyclingCenter } from './use-recycling-contract'
import { useUserDeliveries } from './use-recycling-contract'
import { useState, useEffect } from 'react'

export type UserRole = 'usuario' | 'recolector' | 'centro' | null

/**
 * Hook para determinar el rol del usuario conectado
 * - Centro: si la wallet está registrada como centro de reciclaje
 * - Recolector: si está marcado como recolector (localStorage) o ha aceptado entregas
 * - Usuario: por defecto o si ha creado entregas
 */

// Constante para la clave de localStorage
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

  // Prioridad: Centro > Recolector (explícito o implícito) > Usuario
  if (isRecyclingCenter) {
    return {
      role: 'centro',
      isLoading,
    }
  }

  // Es recolector si está marcado explícitamente O ha aceptado entregas
  if (isMarkedAsCollector || hasAcceptedDelivery) {
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

