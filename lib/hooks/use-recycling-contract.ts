'use client'

import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useAccount, useWatchContractEvent, usePublicClient } from 'wagmi'
import { parseEther, formatEther, parseUnits } from 'viem'
import { RECYCLING_CONTRACT_ADDRESS, RECYCLING_CONTRACT_ABI, type Delivery, DeliveryStatus, PaymentToken } from '@/lib/contracts'
import { useState, useEffect } from 'react'

// Hook para crear una entrega (actualizado para V2)
export function useCreateDelivery() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Crea una nueva entrega de material reciclable
   * @param recyclingCenter Dirección del centro de reciclaje
   * @param materialType Tipo de material (ej: "plastico", "papel")
   * @param amount Cantidad en kg
   * @param paymentToken Token de pago (0=ETH, 1=USDC, 2=MXNB)
   * @param metadata Metadata adicional (opcional, puede ser "")
   * @param valueAmount Solo necesario para ETH. Cantidad en ETH como string (ej: "0.002")
   */
  const createDelivery = async (
    recyclingCenter: `0x${string}`,
    materialType: string,
    amount: bigint,
    paymentToken: PaymentToken,
    metadata: string = '',
    valueAmount?: string // Solo para ETH
  ) => {
    try {
      // El contrato calcula el precio automáticamente, pero necesitamos enviar value si es ETH
      const value = paymentToken === PaymentToken.ETH && valueAmount 
        ? parseEther(valueAmount)
        : 0n

      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'createDelivery',
        args: [recyclingCenter, materialType, amount, paymentToken, metadata],
        value,
      })
    } catch (err) {
      console.error('Error creating delivery:', err)
      throw err
    }
  }

  return {
    createDelivery,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Hook para validar una entrega (solo centros autorizados)
export function useValidateDelivery() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const validateDelivery = async (deliveryId: bigint) => {
    try {
      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'validateDelivery',
        args: [deliveryId],
      })
    } catch (err) {
      console.error('Error validating delivery:', err)
      throw err
    }
  }

  return {
    validateDelivery,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Hook para rechazar una entrega
export function useRejectDelivery() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const rejectDelivery = async (deliveryId: bigint, reason: string) => {
    try {
      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'rejectDelivery',
        args: [deliveryId, reason],
      })
    } catch (err) {
      console.error('Error rejecting delivery:', err)
      throw err
    }
  }

  return {
    rejectDelivery,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Hook para obtener una entrega específica
export function useDelivery(deliveryId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'getDelivery',
    args: deliveryId !== undefined ? [deliveryId] : undefined,
    query: {
      enabled: deliveryId !== undefined,
    },
  })

  return {
    delivery: data as Delivery | undefined,
    isLoading,
    error,
    refetch,
  }
}

// Hook para obtener todas las entregas de un usuario
export function useUserDeliveries(userAddress: `0x${string}` | undefined) {
  const { data: deliveryIds, isLoading, error, refetch } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'getUserDeliveries',
    args: userAddress !== undefined ? [userAddress] : undefined,
    query: {
      enabled: userAddress !== undefined,
    },
  })

  return {
    deliveryIds: deliveryIds as bigint[] | undefined,
    isLoading,
    error,
    refetch,
  }
}

// Hook para obtener todas las entregas del usuario conectado
export function useMyDeliveries() {
  const { address } = useAccount()
  return useUserDeliveries(address)
}

// Hook para obtener el estado de una entrega
export function useDeliveryStatus(deliveryId: bigint | undefined) {
  const { delivery } = useDelivery(deliveryId)

  const getStatusLabel = (status: DeliveryStatus | undefined): string => {
    if (status === undefined) return 'Desconocido'
    switch (status) {
      case DeliveryStatus.Pending:
        return 'Pendiente'
      case DeliveryStatus.Validated:
        return 'Validado'
      case DeliveryStatus.Rejected:
        return 'Rechazado'
      case DeliveryStatus.Completed:
        return 'Completado'
      default:
        return 'Desconocido'
    }
  }

  return {
    status: delivery?.status,
    statusLabel: getStatusLabel(delivery?.status),
    delivery,
  }
}

// Hook para verificar si una dirección es un centro autorizado
export function useIsRecyclingCenter(centerAddress: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'recyclingCenters',
    args: centerAddress !== undefined ? [centerAddress] : undefined,
    query: {
      enabled: centerAddress !== undefined,
    },
  })

  return {
    isRecyclingCenter: data as boolean | undefined,
    isLoading,
    error,
  }
}

// Hook para verificar si el usuario conectado es el owner del contrato
export function useIsOwner() {
  const { address } = useAccount()
  const { data: owner, isLoading, error } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'owner',
  })

  return {
    isOwner: address && owner && address.toLowerCase() === (owner as string).toLowerCase(),
    owner: owner as `0x${string}` | undefined,
    isLoading,
    error,
  }
}

// Hook para agregar un centro de reciclaje (solo owner)
export function useAddRecyclingCenter() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addRecyclingCenter = async (centerAddress: `0x${string}`) => {
    try {
      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'addRecyclingCenter',
        args: [centerAddress],
      })
    } catch (err) {
      console.error('Error adding recycling center:', err)
      throw err
    }
  }

  return {
    addRecyclingCenter,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Hook para obtener precio de un material para un token específico
export function useMaterialPrice(materialType: string | undefined, token: PaymentToken) {
  const { data, isLoading, error } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'getMaterialPrice',
    args: materialType !== undefined ? [materialType, token] : undefined,
    query: {
      enabled: materialType !== undefined,
    },
  })

  return {
    price: data as bigint | undefined,
    isLoading,
    error,
  }
}

// Hook para obtener la lista de centros autorizados
// Escucha eventos RecyclingCenterAdded y RecyclingCenterRemoved para mantener la lista actualizada
export function useRecyclingCenters() {
  const [centers, setCenters] = useState<Array<{ address: `0x${string}`, name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const publicClient = usePublicClient()

  // Función para actualizar la lista de centros
  const updateCenters = (centerAddress: `0x${string}`, add: boolean) => {
    if (add) {
      setCenters(prev => {
        if (prev.find(c => c.address.toLowerCase() === centerAddress.toLowerCase())) {
          return prev
        }
        return [...prev, { 
          address: centerAddress, 
          name: `Centro ${centerAddress.slice(0, 6)}...${centerAddress.slice(-4)}` 
        }]
      })
    } else {
      setCenters(prev => prev.filter(c => c.address.toLowerCase() !== centerAddress.toLowerCase()))
    }
  }

  // Cargar centros desde localStorage y luego intentar obtener eventos recientes
  useEffect(() => {
    const loadCenters = async () => {
      // Primero cargar desde localStorage
      const stored = localStorage.getItem('recyclingCenters')
      let storedCenters: Array<{ address: string }> = []
      
      if (stored) {
        try {
          storedCenters = JSON.parse(stored)
          setCenters(storedCenters as Array<{ address: `0x${string}`, name: string }>)
        } catch (e) {
          console.error('Error parsing stored centers:', e)
        }
      }

      // Luego intentar obtener eventos recientes (últimos 1000 bloques)
      // Solo si hay publicClient disponible
      if (!publicClient) {
        setIsLoading(false)
        return
      }

      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n

        // Obtener eventos recientes de RecyclingCenterAdded
        const addedLogs = await publicClient.getLogs({
          address: RECYCLING_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'RecyclingCenterAdded',
            inputs: [
              { type: 'address', name: 'center', indexed: true },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        }).catch(() => []) // Si falla, usar array vacío

        // Obtener eventos recientes de RecyclingCenterRemoved
        const removedLogs = await publicClient.getLogs({
          address: RECYCLING_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'RecyclingCenterRemoved',
            inputs: [
              { type: 'address', name: 'center', indexed: true },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        }).catch(() => []) // Si falla, usar array vacío

        // Procesar eventos: combinar con localStorage
        const centersSet = new Set<string>()
        
        // Agregar centros que ya estaban en localStorage
        storedCenters.forEach((c: { address: string }) => {
          if (c.address) {
            centersSet.add(c.address.toLowerCase())
          }
        })

        // Agregar todos los centros de eventos recientes
        addedLogs.forEach((log) => {
          const centerAddress = (log.args as any)?.center?.toLowerCase()
          if (centerAddress) {
            centersSet.add(centerAddress)
          }
        })

        // Remover los que fueron removidos en eventos recientes
        removedLogs.forEach((log) => {
          const centerAddress = (log.args as any)?.center?.toLowerCase()
          if (centerAddress) {
            centersSet.delete(centerAddress)
          }
        })

        // Convertir a formato de lista
        const centersList = Array.from(centersSet).map(addr => ({
          address: addr as `0x${string}`,
          name: `Centro ${addr.slice(0, 6)}...${addr.slice(-4)}`
        }))

        setCenters(centersList)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading recent centers:', error)
        setIsLoading(false)
      }
    }

    loadCenters()
  }, [publicClient])

  // Escuchar eventos de centros agregados en tiempo real
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'RecyclingCenterAdded',
    onLogs(logs) {
      logs.forEach((log) => {
        const centerAddress = log.args.center as `0x${string}`
        if (centerAddress) {
          updateCenters(centerAddress, true)
        }
      })
    },
  })

  // Escuchar eventos de centros removidos en tiempo real
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'RecyclingCenterRemoved',
    onLogs(logs) {
      logs.forEach((log) => {
        const centerAddress = log.args.center as `0x${string}`
        if (centerAddress) {
          updateCenters(centerAddress, false)
        }
      })
    },
  })

  // Guardar en localStorage cuando cambien los centros
  useEffect(() => {
    if (centers.length > 0) {
      localStorage.setItem('recyclingCenters', JSON.stringify(centers))
    }
  }, [centers])

  return {
    centers,
    isLoading,
    error: null,
  }
}

