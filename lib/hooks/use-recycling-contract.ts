'use client'

import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useAccount, useWatchContractEvent, usePublicClient } from 'wagmi'
import { parseEther, formatEther, parseUnits, encodeFunctionData, type Address } from 'viem'
import { RECYCLING_CONTRACT_ADDRESS, RECYCLING_CONTRACT_ABI, type Delivery, DeliveryStatus, PaymentToken } from '@/lib/contracts'
import { useState, useEffect } from 'react'

// Hook para crear una entrega (actualizado para V2)
export function useCreateDelivery() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
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
      if (!address) {
        throw new Error('Wallet no conectada')
      }

      // Normalizar dirección del centro
      const normalizedCenter = recyclingCenter.toLowerCase() as Address

      console.log('🔍 Creando entrega:', {
        recyclingCenter: normalizedCenter,
        materialType,
        amount: amount.toString(),
        paymentToken,
        valueAmount,
      })

      // Para ETH: calcular y enviar el valor correcto
      let value: bigint = 0n
      if (paymentToken === PaymentToken.ETH) {
        if (!valueAmount || parseFloat(valueAmount) <= 0) {
          throw new Error('Debe proporcionar un monto válido para pagos en ETH')
        }

        value = parseEther(valueAmount)
        console.log('💰 Valor ETH a enviar:', formatEther(value), 'ETH')
      } else {
        // Para tokens ERC20, no se envía ETH
        value = 0n
        console.log('💰 Pago con token ERC20 - no se envía ETH')
      }

      // Validar que los parámetros sean correctos
      if (amount <= 0n) {
        throw new Error('La cantidad debe ser mayor a 0')
      }

      if (!materialType || materialType.trim() === '') {
        throw new Error('Debe especificar un tipo de material')
      }

      // Estimar gas antes de enviar (opcional, para debugging)
      if (publicClient && paymentToken === PaymentToken.ETH) {
        try {
          const encodedData = encodeFunctionData({
            abi: RECYCLING_CONTRACT_ABI,
            functionName: 'createDelivery',
            args: [normalizedCenter, materialType, amount, paymentToken, metadata || ''],
          })

          const gasEstimate = await publicClient.estimateGas({
            account: address,
            to: RECYCLING_CONTRACT_ADDRESS,
            data: encodedData,
            value: paymentToken === PaymentToken.ETH ? value : 0n,
          })
          console.log('⛽ Gas estimado:', gasEstimate.toString())
        } catch (gasErr: any) {
          console.warn('⚠️ No se pudo estimar gas (puede ser normal):', gasErr?.message)
        }
      }

      // Enviar la transacción
      const result = await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'createDelivery',
        args: [
          normalizedCenter,
          materialType,
          amount,
          paymentToken,
          metadata || '',
        ],
        value: value, // Enviar ETH si es PaymentToken.ETH, 0n si es token ERC20
      })

      console.log('✅ Transacción enviada, hash:', result)
      return result
    } catch (err: any) {
      console.error('❌ Error creating delivery:', err)
      console.error('Error completo:', JSON.stringify(err, null, 2))
      
      if (err?.shortMessage) {
        console.error('Short message:', err.shortMessage)
      }
      if (err?.cause) {
        console.error('Error cause:', err.cause)
      }

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
        value: 0n, // No enviar ETH - solo validar entrega
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
        value: 0n, // No enviar ETH - solo rechazar entrega
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
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addRecyclingCenter = async (centerAddress: `0x${string}`) => {
    try {
      // Validar que la dirección sea válida antes de enviar
      if (!centerAddress || !centerAddress.match(/^0x[a-fA-F0-9]{40}$/i)) {
        throw new Error('Dirección inválida')
      }

      if (!address || !publicClient) {
        throw new Error('Wallet no conectada')
      }

      // Normalizar dirección
      const normalizedAddress = centerAddress.toLowerCase() as Address

      console.log('🔍 Preparando transacción addRecyclingCenter:', {
        contract: RECYCLING_CONTRACT_ADDRESS,
        centerAddress: normalizedAddress,
        functionName: 'addRecyclingCenter',
      })

      // Codificar la función manualmente para verificar que está correcta
      const encodedData = encodeFunctionData({
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'addRecyclingCenter',
        args: [normalizedAddress],
      })

      console.log('📦 Datos codificados:', encodedData)

      // Estimar gas manualmente para ver qué está pasando
      try {
        const gasEstimate = await publicClient.estimateGas({
          account: address,
          to: RECYCLING_CONTRACT_ADDRESS,
          data: encodedData,
          value: 0n,
        })
        console.log('⛽ Gas estimado:', gasEstimate.toString())
      } catch (gasErr: any) {
        console.error('⚠️ Error estimando gas:', gasErr)
      }

      // Enviar transacción con todos los parámetros explícitos
      const result = await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'addRecyclingCenter',
        args: [normalizedAddress],
        value: 0n, // EXPLÍCITAMENTE 0 - función nonpayable
      })

      console.log('✅ Transacción enviada, hash:', result)
      return result
    } catch (err: any) {
      console.error('❌ Error adding recycling center:', err)
      console.error('Error completo:', JSON.stringify(err, null, 2))
      
      // Si el error tiene información sobre la transacción, loguearla
      if (err?.cause) {
        console.error('Error cause:', err.cause)
      }
      if (err?.data) {
        console.error('Error data:', err.data)
      }
      if (err?.shortMessage) {
        console.error('Short message:', err.shortMessage)
      }
      
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

