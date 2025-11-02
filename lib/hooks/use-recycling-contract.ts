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

// Nota: useDelivery y useUserDeliveries están definidos más abajo usando eventos
// useDeliveryStatus se moverá después de useDelivery para evitar dependencia circular

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

// Hook para obtener precio de un material para un centro específico (V3)
// Retorna el precio del centro si existe, sino el precio global
export function useMaterialPrice(
  materialType: string | undefined, 
  token: PaymentToken,
  centerAddress: `0x${string}` | undefined // Requerido para V3
) {
  const { data, isLoading, error } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'getMaterialPrice',
    args: materialType !== undefined && centerAddress !== undefined 
      ? [centerAddress, materialType, token] 
      : undefined,
    query: {
      enabled: materialType !== undefined && centerAddress !== undefined,
    },
  })

  return {
    price: data as bigint | undefined,
    isLoading,
    error,
  }
}

// Hook para obtener precio específico de un centro (alias para claridad)
export function useCenterMaterialPrice(
  centerAddress: `0x${string}` | undefined,
  materialType: string | undefined,
  token: PaymentToken
) {
  return useMaterialPrice(materialType, token, centerAddress)
}

// Hook para configurar precio de un material (solo owner)
export function useSetMaterialPrice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Configura el precio de un material para un token específico
   * @param materialType Tipo de material (ej: "plastico", "papel")
   * @param token Token de pago (0=ETH, 1=USDC, 2=MXNB)
   * @param pricePerKg Precio por kg en ETH (para ETH) o en unidades del token
   * @param isETH Si es true, pricePerKg se interpreta como ETH y se convierte a wei
   */
  const setMaterialPrice = async (
    materialType: string,
    token: PaymentToken,
    pricePerKg: string, // String porque puede ser decimal
    isETH: boolean = token === PaymentToken.ETH
  ) => {
    try {
      // Convertir el precio a wei si es ETH, o a unidades del token si es ERC20
      // Para USDC (6 decimals): 2 USDC = 2000000
      // Para MXNB (18 decimals): 1 MXNB = 1000000000000000000
      const priceInWei = isETH
        ? parseEther(pricePerKg)
        : token === PaymentToken.USDC
        ? parseUnits(pricePerKg, 6) // USDC tiene 6 decimals
        : parseEther(pricePerKg) // MXNB probablemente tiene 18 decimals como ETH

      console.log('🔧 Configurando precio:', {
        materialType,
        token,
        pricePerKg,
        priceInWei: priceInWei.toString(),
      })

      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'setMaterialPrice',
        args: [materialType, token, priceInWei],
        value: 0n, // Función nonpayable
      })
    } catch (err: any) {
      console.error('Error setting material price:', err)
      throw err
    }
  }

  return {
    setMaterialPrice,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Hook para configurar precio de un material para un centro específico (V3)
// Puede ser llamado por el owner o por el propio centro
export function useSetCenterMaterialPrice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const setCenterMaterialPrice = async (
    centerAddress: `0x${string}`,
    materialType: string,
    token: PaymentToken,
    pricePerKg: string, // String porque puede ser decimal
    isETH: boolean = token === PaymentToken.ETH
  ) => {
    try {
      // Convertir el precio a wei si es ETH, o a unidades del token si es ERC20
      const priceInWei = isETH
        ? parseEther(pricePerKg)
        : token === PaymentToken.USDC
        ? parseUnits(pricePerKg, 6) // USDC tiene 6 decimals
        : parseEther(pricePerKg) // MXNB probablemente tiene 18 decimals

      console.log('🔧 Configurando precio del centro:', {
        centerAddress,
        materialType,
        token,
        pricePerKg,
        priceInWei: priceInWei.toString(),
      })

      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'setCenterMaterialPrice',
        args: [centerAddress, materialType, token, priceInWei],
      })
    } catch (err: any) {
      console.error('Error setting center material price:', err)
      throw err
    }
  }

  return {
    setCenterMaterialPrice,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Hook para configurar precio global de un material (solo owner)
export function useSetGlobalMaterialPrice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const setGlobalMaterialPrice = async (
    materialType: string,
    token: PaymentToken,
    pricePerKg: string,
    isETH: boolean = token === PaymentToken.ETH
  ) => {
    try {
      const priceInWei = isETH
        ? parseEther(pricePerKg)
        : token === PaymentToken.USDC
        ? parseUnits(pricePerKg, 6)
        : parseEther(pricePerKg)

      console.log('🔧 Configurando precio global:', {
        materialType,
        token,
        pricePerKg,
        priceInWei: priceInWei.toString(),
      })

      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'setGlobalMaterialPrice',
        args: [materialType, token, priceInWei],
      })
    } catch (err: any) {
      console.error('Error setting global material price:', err)
      throw err
    }
  }

  return {
    setGlobalMaterialPrice,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

// Hook para obtener la lista de centros autorizados
// Escucha eventos RecyclingCenterAdded y RecyclingCenterRemoved para mantener la lista actualizada
export function useRecyclingCenters() {
  const [centers, setCenters] = useState<Array<{ address: `0x${string}`, name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const publicClient = usePublicClient()
  const { chainId } = useAccount()

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

  // Cargar centros desde blockchain (no usar localStorage porque puede ser de otra red)
  useEffect(() => {
    // No ejecutar en servidor
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // Resetear centros cuando cambia la red o wallet
    setCenters([])
    setIsLoading(true)

    const loadCenters = async () => {
      // No cargar desde localStorage - siempre obtener desde blockchain para evitar centros de otra red
      // Solo intentar obtener eventos recientes si hay publicClient disponible
      if (!publicClient) {
        setIsLoading(false)
        return
      }

      try {
        const currentBlock = await publicClient.getBlockNumber()
        
        // Intentar buscar desde un rango más amplio (10,000 bloques) o desde el bloque 0
        // Usar una estrategia de chunks para evitar límites de RPC
        const searchRanges = [
          { from: currentBlock > 10000n ? currentBlock - 10000n : 0n, to: currentBlock }, // Últimos 10k bloques
          { from: 0n, to: currentBlock > 10000n ? currentBlock - 10000n : currentBlock }, // Resto si hay más
        ]

        const addedLogs: any[] = []
        const removedLogs: any[] = []

        // Buscar en chunks para evitar límites de RPC
        for (const range of searchRanges) {
          if (range.from >= range.to) continue

          try {
            // Intentar obtener eventos en este rango
            const chunkAddedLogs = await publicClient.getLogs({
              address: RECYCLING_CONTRACT_ADDRESS,
              event: {
                type: 'event',
                name: 'RecyclingCenterAdded',
                inputs: [
                  { type: 'address', name: 'center', indexed: true },
                ],
              },
              fromBlock: range.from,
              toBlock: range.to,
            }).catch(() => [])

            const chunkRemovedLogs = await publicClient.getLogs({
              address: RECYCLING_CONTRACT_ADDRESS,
              event: {
                type: 'event',
                name: 'RecyclingCenterRemoved',
                inputs: [
                  { type: 'address', name: 'center', indexed: true },
                ],
              },
              fromBlock: range.from,
              toBlock: range.to,
            }).catch(() => [])

            addedLogs.push(...chunkAddedLogs)
            removedLogs.push(...chunkRemovedLogs)
          } catch (error: any) {
            // Si el rango es muy grande, intentar dividirlo en chunks más pequeños
            if (error?.message?.includes('too large') || error?.message?.includes('range')) {
              const chunkSize = 5000n
              let chunkFrom = range.from
              
              while (chunkFrom < range.to) {
                const chunkTo = chunkFrom + chunkSize > range.to ? range.to : chunkFrom + chunkSize
                
                try {
                  const chunkAdded = await publicClient.getLogs({
                    address: RECYCLING_CONTRACT_ADDRESS,
                    event: {
                      type: 'event',
                      name: 'RecyclingCenterAdded',
                      inputs: [
                        { type: 'address', name: 'center', indexed: true },
                      ],
                    },
                    fromBlock: chunkFrom,
                    toBlock: chunkTo,
                  }).catch(() => [])

                  const chunkRemoved = await publicClient.getLogs({
                    address: RECYCLING_CONTRACT_ADDRESS,
                    event: {
                      type: 'event',
                      name: 'RecyclingCenterRemoved',
                      inputs: [
                        { type: 'address', name: 'center', indexed: true },
                      ],
                    },
                    fromBlock: chunkFrom,
                    toBlock: chunkTo,
                  }).catch(() => [])

                  addedLogs.push(...chunkAdded)
                  removedLogs.push(...chunkRemoved)
                } catch {
                  // Ignorar errores en chunks individuales
                }
                
                chunkFrom = chunkTo + 1n
              }
            } else {
              console.warn('Error loading centers in range:', error)
            }
          }
        }

        // Procesar eventos: solo usar eventos recientes (sin localStorage)
        const centersSet = new Set<string>()

        // Agregar todos los centros de eventos
        addedLogs.forEach((log) => {
          const centerAddress = (log.args as any)?.center?.toLowerCase()
          if (centerAddress) {
            centersSet.add(centerAddress)
          }
        })

        // Remover los que fueron removidos
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
        console.error('Error loading centers:', error)
        setIsLoading(false)
      }
    }

    loadCenters()
  }, [publicClient, chainId])

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

  // Ya no guardamos en localStorage para evitar centros de otras redes

  return {
    centers,
    isLoading,
    error: null,
  }
}

// Hook para obtener entregas del usuario conectado usando eventos
export function useUserDeliveries() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [deliveries, setDeliveries] = useState<Array<{ id: bigint, delivery: Delivery }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDeliveries = async () => {
      if (!address || !publicClient) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n

        // Obtener eventos DeliveryCreated para este usuario
        const logs = await publicClient.getLogs({
          address: RECYCLING_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'DeliveryCreated',
            inputs: [
              { type: 'uint256', name: 'deliveryId', indexed: true },
              { type: 'address', name: 'user', indexed: true },
              { type: 'address', name: 'recyclingCenter', indexed: true },
              { type: 'string', name: 'materialType' },
              { type: 'uint256', name: 'amount' },
              { type: 'uint256', name: 'paymentAmount' },
              { type: 'uint8', name: 'paymentToken' },
            ],
          },
          args: {
            user: address.toLowerCase() as `0x${string}`,
          },
          fromBlock,
          toBlock: 'latest',
        }).catch(() => [])

        // Obtener detalles de cada entrega
        const deliveryPromises = logs.map(async (log: any) => {
          const deliveryId = log.args.deliveryId as bigint
          try {
            const delivery = await publicClient.readContract({
              address: RECYCLING_CONTRACT_ADDRESS,
              abi: RECYCLING_CONTRACT_ABI,
              functionName: 'deliveries',
              args: [deliveryId],
            }) as any

            return {
              id: deliveryId,
              delivery: {
                user: delivery[0],
                recyclingCenter: delivery[1],
                materialType: delivery[2],
                amount: delivery[3],
                paymentAmount: delivery[4],
                paymentToken: delivery[5] as PaymentToken,
                status: delivery[6] as DeliveryStatus,
                createdAt: delivery[7],
                validatedAt: delivery[8],
                rejectionReason: delivery[9],
                metadata: delivery[10],
              } as Delivery,
            }
          } catch (err) {
            console.error(`Error loading delivery ${deliveryId}:`, err)
            return null
          }
        })

        const deliveriesData = (await Promise.all(deliveryPromises)).filter(Boolean) as Array<{ id: bigint, delivery: Delivery }>
        
        // Ordenar por fecha de creación (más reciente primero)
        deliveriesData.sort((a, b) => {
          const timeA = Number(a.delivery.createdAt)
          const timeB = Number(b.delivery.createdAt)
          return timeB - timeA
        })

        setDeliveries(deliveriesData)
      } catch (error) {
        console.error('Error loading user deliveries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDeliveries()
  }, [address, publicClient])

  // Escuchar nuevos eventos en tiempo real
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryCreated',
    onLogs(logs) {
      logs.forEach(async (log) => {
        if (log.args.user?.toLowerCase() === address?.toLowerCase()) {
          const deliveryId = log.args.deliveryId as bigint
          if (!publicClient) return

          try {
            const delivery = await publicClient.readContract({
              address: RECYCLING_CONTRACT_ADDRESS,
              abi: RECYCLING_CONTRACT_ABI,
              functionName: 'deliveries',
              args: [deliveryId],
            }) as any

            setDeliveries(prev => [{
              id: deliveryId,
              delivery: {
                user: delivery[0],
                recyclingCenter: delivery[1],
                materialType: delivery[2],
                amount: delivery[3],
                paymentAmount: delivery[4],
                paymentToken: delivery[5] as PaymentToken,
                status: delivery[6] as DeliveryStatus,
                createdAt: delivery[7],
                validatedAt: delivery[8],
                rejectionReason: delivery[9],
                metadata: delivery[10],
              } as Delivery,
            }, ...prev])
          } catch (err) {
            console.error('Error loading new delivery:', err)
          }
        }
      })
    },
  })

  return {
    deliveries,
    isLoading,
  }
}

// Hook para obtener entregas pendientes (para recolectores)
export function usePendingDeliveries() {
  const publicClient = usePublicClient()
  const [deliveries, setDeliveries] = useState<Array<{ id: bigint, delivery: Delivery }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPendingDeliveries = async () => {
      if (!publicClient) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n

        // Obtener todos los eventos DeliveryCreated recientes
        const logs = await publicClient.getLogs({
          address: RECYCLING_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'DeliveryCreated',
            inputs: [
              { type: 'uint256', name: 'deliveryId', indexed: true },
              { type: 'address', name: 'user', indexed: true },
              { type: 'address', name: 'recyclingCenter', indexed: true },
              { type: 'string', name: 'materialType' },
              { type: 'uint256', name: 'amount' },
              { type: 'uint256', name: 'paymentAmount' },
              { type: 'uint8', name: 'paymentToken' },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        }).catch(() => [])

        // Obtener detalles de cada entrega y filtrar solo las pendientes
        const deliveryPromises = logs.map(async (log: any) => {
          const deliveryId = log.args.deliveryId as bigint
          try {
            const delivery = await publicClient.readContract({
              address: RECYCLING_CONTRACT_ADDRESS,
              abi: RECYCLING_CONTRACT_ABI,
              functionName: 'deliveries',
              args: [deliveryId],
            }) as any

            const status = delivery[6] as DeliveryStatus
            // Solo incluir si está pendiente
            if (status !== DeliveryStatus.Pending) {
              return null
            }

            return {
              id: deliveryId,
              delivery: {
                user: delivery[0],
                recyclingCenter: delivery[1],
                materialType: delivery[2],
                amount: delivery[3],
                paymentAmount: delivery[4],
                paymentToken: delivery[5] as PaymentToken,
                status: status,
                createdAt: delivery[7],
                validatedAt: delivery[8],
                rejectionReason: delivery[9],
                metadata: delivery[10],
              } as Delivery,
            }
          } catch (err) {
            console.error(`Error loading delivery ${deliveryId}:`, err)
            return null
          }
        })

        const deliveriesData = (await Promise.all(deliveryPromises)).filter(Boolean) as Array<{ id: bigint, delivery: Delivery }>
        
        // Ordenar por fecha de creación (más reciente primero)
        deliveriesData.sort((a, b) => {
          const timeA = Number(a.delivery.createdAt)
          const timeB = Number(b.delivery.createdAt)
          return timeB - timeA
        })

        setDeliveries(deliveriesData)
      } catch (error) {
        console.error('Error loading pending deliveries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPendingDeliveries()
  }, [publicClient])

  // Escuchar nuevos eventos en tiempo real - DeliveryCreated
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryCreated',
    onLogs(logs) {
      logs.forEach(async (log) => {
        const deliveryId = log.args.deliveryId as bigint
        if (!publicClient) return

        try {
          const delivery = await publicClient.readContract({
            address: RECYCLING_CONTRACT_ADDRESS,
            abi: RECYCLING_CONTRACT_ABI,
            functionName: 'deliveries',
            args: [deliveryId],
          }) as any

          const status = delivery[6] as DeliveryStatus
          if (status === DeliveryStatus.Pending) {
            // Evitar duplicados: verificar si ya existe
            setDeliveries(prev => {
              const exists = prev.some(d => d.id === deliveryId)
              if (exists) return prev

              return [{
                id: deliveryId,
                delivery: {
                  user: delivery[0],
                  recyclingCenter: delivery[1],
                  materialType: delivery[2],
                  amount: delivery[3],
                  paymentAmount: delivery[4],
                  paymentToken: delivery[5] as PaymentToken,
                  status: status,
                  createdAt: delivery[7],
                  validatedAt: delivery[8],
                  rejectionReason: delivery[9],
                  metadata: delivery[10],
                } as Delivery,
              }, ...prev].sort((a, b) => {
                const timeA = Number(a.delivery.createdAt)
                const timeB = Number(b.delivery.createdAt)
                return timeB - timeA
              })
            })
          }
        } catch (err) {
          console.error('Error loading new pending delivery:', err)
        }
      })
    },
  })

  // Escuchar cambios de estado - DeliveryValidated
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryValidated',
    onLogs(logs) {
      logs.forEach((log) => {
        const deliveryId = log.args.deliveryId as bigint
        // Remover de la lista de pendientes cuando se valida
        setDeliveries(prev => prev.filter(d => d.id !== deliveryId))
      })
    },
  })

  // Escuchar cambios de estado - DeliveryRejected
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryRejected',
    onLogs(logs) {
      logs.forEach((log) => {
        const deliveryId = log.args.deliveryId as bigint
        // Remover de la lista de pendientes cuando se rechaza
        setDeliveries(prev => prev.filter(d => d.id !== deliveryId))
      })
    },
  })

  // Refrescar periódicamente para asegurar sincronización (cada 30 segundos)
  useEffect(() => {
    if (!publicClient) return

    const interval = setInterval(async () => {
      try {
        // Actualizar el estado de todas las entregas actuales
        const updatedDeliveries = await Promise.all(
          deliveries.map(async ({ id }) => {
            try {
              const delivery = await publicClient.readContract({
                address: RECYCLING_CONTRACT_ADDRESS,
                abi: RECYCLING_CONTRACT_ABI,
                functionName: 'deliveries',
                args: [id],
              }) as any

              const status = delivery[6] as DeliveryStatus
              if (status !== DeliveryStatus.Pending) {
                return null // Remover si ya no está pendiente
              }

              return {
                id,
                delivery: {
                  user: delivery[0],
                  recyclingCenter: delivery[1],
                  materialType: delivery[2],
                  amount: delivery[3],
                  paymentAmount: delivery[4],
                  paymentToken: delivery[5] as PaymentToken,
                  status: status,
                  createdAt: delivery[7],
                  validatedAt: delivery[8],
                  rejectionReason: delivery[9],
                  metadata: delivery[10],
                } as Delivery,
              }
            } catch {
              return null
            }
          })
        )

        const validDeliveries = updatedDeliveries.filter(Boolean) as Array<{ id: bigint, delivery: Delivery }>
        validDeliveries.sort((a, b) => {
          const timeA = Number(a.delivery.createdAt)
          const timeB = Number(b.delivery.createdAt)
          return timeB - timeA
        })

        setDeliveries(validDeliveries)
      } catch (error) {
        console.error('Error refreshing pending deliveries:', error)
      }
    }, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [publicClient, deliveries.length]) // Solo cuando cambia la cantidad de entregas

  return {
    deliveries,
    isLoading,
  }
}

// Hook para obtener una entrega específica por ID usando el mapping deliveries
// Esta versión reemplaza la anterior que usaba getDelivery
export function useDelivery(deliveryId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'deliveries',
    args: deliveryId !== undefined ? [deliveryId] : undefined,
    query: {
      enabled: deliveryId !== undefined,
    },
  })

  if (!data) {
    return {
      delivery: undefined,
      isLoading,
      error,
    }
  }

  const deliveryData = data as any
  const delivery: Delivery = {
    user: deliveryData[0],
    recyclingCenter: deliveryData[1],
    materialType: deliveryData[2],
    amount: deliveryData[3],
    paymentAmount: deliveryData[4],
    paymentToken: deliveryData[5] as PaymentToken,
    status: deliveryData[6] as DeliveryStatus,
    createdAt: deliveryData[7],
    validatedAt: deliveryData[8],
    rejectionReason: deliveryData[9],
    metadata: deliveryData[10],
  }

  return {
    delivery,
    isLoading,
    error,
  }
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

// Hook para obtener entregas de un centro específico
export function useCenterDeliveries(centerAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient()
  const [deliveries, setDeliveries] = useState<Array<{ id: bigint, delivery: Delivery }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCenterDeliveries = async () => {
      if (!centerAddress || !publicClient) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n

        // Obtener eventos DeliveryCreated para este centro
        const logs = await publicClient.getLogs({
          address: RECYCLING_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'DeliveryCreated',
            inputs: [
              { type: 'uint256', name: 'deliveryId', indexed: true },
              { type: 'address', name: 'user', indexed: true },
              { type: 'address', name: 'recyclingCenter', indexed: true },
              { type: 'string', name: 'materialType' },
              { type: 'uint256', name: 'amount' },
              { type: 'uint256', name: 'paymentAmount' },
              { type: 'uint8', name: 'paymentToken' },
            ],
          },
          args: {
            recyclingCenter: centerAddress.toLowerCase() as `0x${string}`,
          },
          fromBlock,
          toBlock: 'latest',
        }).catch(() => [])

        // Obtener detalles de cada entrega
        const deliveryPromises = logs.map(async (log: any) => {
          const deliveryId = log.args.deliveryId as bigint
          try {
            const delivery = await publicClient.readContract({
              address: RECYCLING_CONTRACT_ADDRESS,
              abi: RECYCLING_CONTRACT_ABI,
              functionName: 'deliveries',
              args: [deliveryId],
            }) as any

            return {
              id: deliveryId,
              delivery: {
                user: delivery[0],
                recyclingCenter: delivery[1],
                materialType: delivery[2],
                amount: delivery[3],
                paymentAmount: delivery[4],
                paymentToken: delivery[5] as PaymentToken,
                status: delivery[6] as DeliveryStatus,
                createdAt: delivery[7],
                validatedAt: delivery[8],
                rejectionReason: delivery[9],
                metadata: delivery[10],
              } as Delivery,
            }
          } catch (err) {
            console.error(`Error loading delivery ${deliveryId}:`, err)
            return null
          }
        })

        const deliveriesData = (await Promise.all(deliveryPromises)).filter(Boolean) as Array<{ id: bigint, delivery: Delivery }>
        
        // Ordenar por fecha de creación (más reciente primero)
        deliveriesData.sort((a, b) => {
          const timeA = Number(a.delivery.createdAt)
          const timeB = Number(b.delivery.createdAt)
          return timeB - timeA
        })

        setDeliveries(deliveriesData)
      } catch (error) {
        console.error('Error loading center deliveries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCenterDeliveries()
  }, [centerAddress, publicClient])

  // Escuchar nuevos eventos en tiempo real
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryCreated',
    onLogs(logs) {
      logs.forEach(async (log) => {
        if (log.args.recyclingCenter?.toLowerCase() === centerAddress?.toLowerCase()) {
          const deliveryId = log.args.deliveryId as bigint
          if (!publicClient) return

          try {
            const delivery = await publicClient.readContract({
              address: RECYCLING_CONTRACT_ADDRESS,
              abi: RECYCLING_CONTRACT_ABI,
              functionName: 'deliveries',
              args: [deliveryId],
            }) as any

            setDeliveries(prev => [{
              id: deliveryId,
              delivery: {
                user: delivery[0],
                recyclingCenter: delivery[1],
                materialType: delivery[2],
                amount: delivery[3],
                paymentAmount: delivery[4],
                paymentToken: delivery[5] as PaymentToken,
                status: delivery[6] as DeliveryStatus,
                createdAt: delivery[7],
                validatedAt: delivery[8],
                rejectionReason: delivery[9],
                metadata: delivery[10],
              } as Delivery,
            }, ...prev])
          } catch (err) {
            console.error('Error loading new center delivery:', err)
          }
        }
      })
    },
  })

  return {
    deliveries,
    isLoading,
  }
}

