'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

// Hook para aceptar una entrega como recolector
export function useAcceptDelivery() {
  const { address } = useAccount()

  const acceptDelivery = (deliveryId: bigint) => {
    if (typeof window === 'undefined') {
      throw new Error('localStorage solo disponible en el cliente')
    }

    if (!address) {
      throw new Error('Wallet no conectada')
    }

    // Guardar en localStorage que este recolector aceptó esta entrega
    const key = `delivery_collector_${deliveryId.toString()}`
    localStorage.setItem(key, JSON.stringify({
      collector: address.toLowerCase(),
      acceptedAt: Date.now(),
    }))

    // También guardar en una lista de entregas aceptadas por este recolector
    const collectorDeliveriesKey = `collector_deliveries_${address.toLowerCase()}`
    const stored = localStorage.getItem(collectorDeliveriesKey)
    const deliveries: string[] = stored ? JSON.parse(stored) : []
    if (!deliveries.includes(deliveryId.toString())) {
      deliveries.push(deliveryId.toString())
      localStorage.setItem(collectorDeliveriesKey, JSON.stringify(deliveries))
    }
  }

  return {
    acceptDelivery,
  }
}

// Utilidad para verificar si una entrega tiene recolector asignado
export function useDeliveryCollector(deliveryId: bigint | undefined) {
  const [collector, setCollector] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    if (!deliveryId) {
      setCollector(null)
      return
    }

    // Verificar en localStorage si hay un recolector asignado
    const stored = localStorage.getItem(`delivery_collector_${deliveryId.toString()}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setCollector(data.collector as `0x${string}`)
      } catch {
        setCollector(null)
      }
    } else {
      setCollector(null)
    }
  }, [deliveryId])

  return collector
}

// Función helper para verificar si una entrega tiene recolector asignado
export function hasCollector(deliveryId: bigint): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(`delivery_collector_${deliveryId.toString()}`)
  return stored !== null
}

// Función helper para obtener el recolector de una entrega
export function getDeliveryCollector(deliveryId: bigint): `0x${string}` | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(`delivery_collector_${deliveryId.toString()}`)
  if (!stored) return null
  
  try {
    const data = JSON.parse(stored)
    return data.collector as `0x${string}`
  } catch {
    return null
  }
}

