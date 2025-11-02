'use client'

import { useAccount, useBalance, usePublicClient } from 'wagmi'
import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { RECYCLING_CONTRACT_ADDRESS, RECYCLING_CONTRACT_ABI, PaymentToken } from '@/lib/contracts'
import { formatEther, parseEther } from 'viem'

/**
 * Hook para aceptar una entrega como recolector
 * El recolector debe pagar el monto calculado para bloquearlo en el contrato
 */
export function useAcceptDelivery() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const publicClient = usePublicClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  /**
   * Acepta una entrega y bloquea el pago en el contrato
   * El recolector debe pagar el monto calculado de la entrega
   * @param deliveryId ID de la entrega a aceptar
   */
  const acceptDelivery = async (deliveryId: bigint) => {
    if (!address) {
      throw new Error('Wallet no conectada')
    }

    if (!publicClient) {
      throw new Error('No se pudo conectar al cliente de blockchain')
    }

    const deliveryData = await publicClient.readContract({
      address: RECYCLING_CONTRACT_ADDRESS,
      abi: RECYCLING_CONTRACT_ABI,
      functionName: 'deliveries',
      args: [deliveryId],
    }) as any

    if (!deliveryData || deliveryData[0] === '0x0000000000000000000000000000000000000000') {
      throw new Error('No se pudo obtener información de la entrega')
    }

    // El struct es: user, recyclingCenter, collector, materialType, amount, paymentAmount, paymentToken, status, ...
    const paymentAmount = deliveryData[5] as bigint // paymentAmount
    const paymentToken = deliveryData[6] as PaymentToken // paymentToken
    const collector = deliveryData[2] as string // collector

    // Validar que la entrega esté pendiente y sin recolector
    if (collector && collector !== '0x0000000000000000000000000000000000000000') {
      throw new Error('Esta entrega ya tiene un recolector asignado')
    }

    // Calcular el valor a enviar si es ETH
    let value: bigint = 0n
    if (paymentToken === PaymentToken.ETH) {
      value = paymentAmount
      
      // Validar saldo de ETH
      if (balance) {
        const gasBuffer = parseEther('0.001')
        const totalRequired = value + gasBuffer
        
        if (balance.value < totalRequired) {
          const shortfall = totalRequired - balance.value
          throw new Error(
            `Saldo insuficiente. Necesitas ${formatEther(totalRequired)} ETH ` +
            `(${formatEther(value)} para el pago + ${formatEther(gasBuffer)} aprox. para gas), ` +
            `pero solo tienes ${formatEther(balance.value)} ETH. ` +
            `Falta: ${formatEther(shortfall)} ETH`
          )
        }
      }
    } else {
      // Para tokens ERC20, el usuario debe hacer approve primero
      throw new Error('Pagos con tokens ERC20 aún no implementados para aceptar entregas')
    }

    // Enviar transacción al contrato
    await writeContract({
      address: RECYCLING_CONTRACT_ADDRESS,
      abi: RECYCLING_CONTRACT_ABI,
      functionName: 'acceptDelivery',
      args: [deliveryId],
      value: value, // Enviar ETH si es PaymentToken.ETH
    })

    return true
  }

  return {
    acceptDelivery,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Utilidad para verificar si una entrega tiene recolector asignado (desde el contrato)
export function useDeliveryCollector(deliveryId: bigint | undefined) {
  const [collector, setCollector] = useState<`0x${string}` | null>(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!deliveryId || !publicClient) {
      setCollector(null)
      return
    }

    // Leer desde el contrato en lugar de localStorage
    const loadCollector = async () => {
      try {
        const deliveryData = await publicClient.readContract({
          address: RECYCLING_CONTRACT_ADDRESS,
          abi: RECYCLING_CONTRACT_ABI,
          functionName: 'deliveries',
          args: [deliveryId],
        }) as any

        const collectorAddress = deliveryData[2] as string // collector está en índice 2
        if (collectorAddress && collectorAddress !== '0x0000000000000000000000000000000000000000') {
          setCollector(collectorAddress.toLowerCase() as `0x${string}`)
        } else {
          setCollector(null)
        }
      } catch (err) {
        console.error('Error loading collector:', err)
        setCollector(null)
      }
    }

    loadCollector()
  }, [deliveryId, publicClient])

  return collector
}

// Función helper para verificar si una entrega tiene recolector asignado (desde el contrato)
// Esta función ahora es sincrónica pero debería llamarse después de cargar desde el contrato
export function hasCollector(deliveryId: bigint): boolean {
  // NOTA: Esta función ahora solo verifica localStorage como fallback
  // Lo mejor es usar useDeliveryCollector que lee del contrato
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(`delivery_collector_${deliveryId.toString()}`)
  return stored !== null
}

