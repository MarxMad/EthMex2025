'use client'

import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useAccount, useWatchContractEvent, usePublicClient } from 'wagmi'
import { parseEther, formatEther, parseUnits, encodeFunctionData, type Address } from 'viem'
import { useBalance } from 'wagmi'
import { getContractAddress, RECYCLING_CONTRACT_ABI, type Delivery, DeliveryStatus, PaymentToken } from '@/lib/contracts'
import { useState, useEffect } from 'react'

// Hook helper para obtener la dirección del contrato según la chain activa
function useContractAddress(): `0x${string}` {
  const { chainId } = useAccount()
  if (!chainId) {
    // Por defecto, usar Arbitrum Sepolia
    return getContractAddress(421614)
  }
  return getContractAddress(chainId)
}

// Hook para crear una entrega (actualizado para V3)
export function useCreateDelivery() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  const { data: balance } = useBalance({ address })

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

      // NUEVO MODELO: El usuario NO paga al crear la entrega
      // El recolector será quien pague cuando acepte la entrega
      // Por lo tanto, no enviamos ningún valor
      let value: bigint = 0n
      console.log('💰 Creando entrega sin costo - El recolector pagará al aceptar')

      // Validar que los parámetros sean correctos
      if (amount <= 0n) {
        throw new Error('La cantidad debe ser mayor a 0')
      }

      if (!materialType || materialType.trim() === '') {
        throw new Error('Debe especificar un tipo de material')
      }

      // OPTIMIZACIÓN: Limitar el tamaño del metadata para reducir costos de gas
      // Strings grandes en storage son muy costosos. Limitar a ~500 caracteres
      if (metadata && metadata.length > 500) {
        console.warn('⚠️ Metadata muy larga, truncando para reducir gas...')
        metadata = metadata.substring(0, 500)
      }
      
      console.log('📤 Enviando transacción...')
      
      // NUEVO: Ya no necesitamos estimar gas complejo porque no enviamos valor
      // La transacción es más simple (solo crear el registro)
      console.log('📤 Enviando transacción (sin pago - el recolector pagará al aceptar)...')
      
      const result = await writeContract({
        address: contractAddress,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'createDelivery',
        args: [
          normalizedCenter,
          materialType,
          amount,
          paymentToken,
          metadata || '',
        ],
        value: 0n, // NO enviamos valor - el usuario no paga
      })

      console.log('✅ Transacción enviada, hash:', result)
      return result
    } catch (err: any) {
      console.error('❌ Error creating delivery:', err)
      console.error('Error completo:', JSON.stringify(err, null, 2))
      
      // Mejorar mensajes de error para diferentes tipos de wallets
      const errorMessage = err?.message || err?.shortMessage || ''
      const errorCode = err?.code || err?.error?.code
      
      // Errores de saldo insuficiente
      if (
        errorMessage.includes('insufficient funds') || 
        errorMessage.includes('Saldo insuficiente') ||
        errorCode === 'INSUFFICIENT_FUNDS'
      ) {
        throw new Error(err.message || 'Saldo insuficiente. Verifica que tengas suficiente ETH para el pago y gas.')
      }
      
      // Errores de rechazo del usuario
      if (
        errorMessage.includes('user rejected') || 
        errorMessage.includes('User denied') ||
        errorMessage.includes('User rejected') ||
        errorCode === 4001 || // MetaMask user rejection
        errorCode === 'ACTION_REJECTED'
      ) {
        throw new Error('Transacción cancelada por el usuario')
      }
      
      // Errores de gas
      if (
        errorMessage.includes('gas') ||
        errorMessage.includes('Gas') ||
        errorCode === 'UNPREDICTABLE_GAS_LIMIT' ||
        errorCode === 'OUT_OF_GAS'
      ) {
        throw new Error('Error estimando gas. Por favor, intenta nuevamente o verifica que el contrato esté correctamente desplegado.')
      }
      
      // Errores del contrato (revert)
      if (
        errorMessage.includes('Invalid recycling center') ||
        errorMessage.includes('Price not set') ||
        errorMessage.includes('Amount must be greater than zero')
      ) {
        throw new Error(errorMessage)
      }
      
      // Usar el mensaje corto de viem si está disponible
      if (err?.shortMessage) {
        throw new Error(err.shortMessage)
      }
      
      // Mensaje genérico con más contexto
      if (errorMessage) {
        throw new Error(errorMessage)
      }
      
      // Último recurso
      throw new Error('Error desconocido al crear la entrega. Verifica tu conexión, saldo y que el contrato esté correctamente desplegado.')
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
        address: contractAddress,
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
        address: contractAddress,
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
              address: contractAddress,
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
              address: contractAddress,
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
          contract: contractAddress,
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
          to: contractAddress,
          data: encodedData,
          value: 0n,
        })
        console.log('⛽ Gas estimado:', gasEstimate.toString())
      } catch (gasErr: any) {
        console.error('⚠️ Error estimando gas:', gasErr)
      }

      // Enviar transacción con todos los parámetros explícitos
      const result = await writeContract({
        address: contractAddress,
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
  const { data, isLoading, error, refetch } = useReadContract({
              address: contractAddress,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'getMaterialPrice',
    args: materialType !== undefined && centerAddress !== undefined 
      ? [centerAddress, materialType, token] 
      : undefined,
    query: {
      enabled: materialType !== undefined && centerAddress !== undefined,
      // Refetch cada 30 segundos si no hay precio (reducido para evitar rate limiting)
      // Solo refetch si no hay error y no está cargando
      refetchInterval: (query) => {
        const price = query.state.data as bigint | undefined
        const hasError = query.state.error !== null
        const isLoading = query.state.isLoading
        
        // Solo refetch si no hay precio, no hay error, y no está cargando
        // Reducido a 30 segundos para evitar rate limiting del RPC
        if (!price || price === 0n) {
          if (!hasError && !isLoading && materialType !== undefined && centerAddress !== undefined) {
            return 30000 // 30 segundos en lugar de 5
          }
        }
        return false
      },
      // Reintentar si falla, pero con menos frecuencia
      retry: 2, // Solo reintentar 2 veces
      retryDelay: 5000, // Esperar 5 segundos entre reintentos
    },
  })

  // Log para debugging - ayuda a identificar problemas con precios
  useEffect(() => {
    if (materialType && centerAddress) {
      console.log(`[useMaterialPrice] Consultando precio:`, {
        materialType,
        centerAddress: centerAddress.slice(0, 10) + '...',
        token: token === PaymentToken.ETH ? 'ETH' : token === PaymentToken.USDC ? 'USDC' : 'MXNB',
        price: data?.toString(),
        hasPrice: data && data > 0n,
        isLoading,
        error: error?.message,
      })
    }
  }, [materialType, centerAddress, token, data, isLoading, error])

  return {
    price: data as bigint | undefined,
    isLoading,
    error,
    refetch, // Exponer refetch para que se pueda llamar manualmente
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
        address: contractAddress,
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
        address: contractAddress,
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
        address: contractAddress,
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
  const contractAddress = useContractAddress()

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
        
        console.log('🔍 Cargando centros de reciclaje...', {
          currentBlock: currentBlock.toString(),
          contractAddress: contractAddress,
          chainId: chainId,
        })

        const addedLogs: any[] = []
        const removedLogs: any[] = []
        
        // ESTRATEGIA MEJORADA: Buscar PRIMERO en bloques recientes (más rápido y confiable)
        // Luego buscar en el historial si es necesario
        
        // Paso 1: Buscar en últimos 2000 bloques (muy rápido, captura centros recientes)
        try {
          const recentRange = currentBlock > 2000n ? currentBlock - 2000n : 0n
          const recentAdded = await publicClient.getLogs({
            address: contractAddress,
            event: {
              type: 'event',
              name: 'RecyclingCenterAdded',
              inputs: [{ type: 'address', name: 'center', indexed: true }],
            },
            fromBlock: recentRange,
            toBlock: currentBlock,
          }).catch(() => [])

          const recentRemoved = await publicClient.getLogs({
            address: contractAddress,
            event: {
              type: 'event',
              name: 'RecyclingCenterRemoved',
              inputs: [{ type: 'address', name: 'center', indexed: true }],
            },
            fromBlock: recentRange,
            toBlock: currentBlock,
          }).catch(() => [])

          addedLogs.push(...recentAdded)
          removedLogs.push(...recentRemoved)
          console.log(`✅ Encontrados ${recentAdded.length} eventos de centros agregados en bloques recientes`)
        } catch (err) {
          console.warn('Error buscando en bloques recientes:', err)
        }
        
        // Paso 2: Si no encontramos nada, buscar en un rango más amplio
        if (addedLogs.length === 0) {
          const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n
          const searchRanges = [
            { from: fromBlock, to: currentBlock },
          ]

          // Buscar en chunks para evitar límites de RPC
          for (const range of searchRanges) {
            if (range.from >= range.to) continue

            try {
              // Intentar obtener eventos en este rango
              const chunkAddedLogs = await publicClient.getLogs({
                address: contractAddress,
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
                address: contractAddress,
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
              
              if (chunkAddedLogs.length > 0 || chunkRemovedLogs.length > 0) {
                console.log(`✅ Encontrados ${chunkAddedLogs.length} agregados, ${chunkRemovedLogs.length} removidos en rango amplio`)
              }
            } catch (error: any) {
              // Si el rango es muy grande, intentar dividirlo en chunks más pequeños
              if (error?.message?.includes('too large') || error?.message?.includes('range')) {
                const chunkSize = 10000n
                let chunkFrom = range.from
                
                while (chunkFrom < range.to) {
                  const chunkTo = chunkFrom + chunkSize > range.to ? range.to : chunkFrom + chunkSize
                  
                  try {
                    const chunkAdded = await publicClient.getLogs({
                      address: contractAddress,
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
                      address: contractAddress,
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

        // FALLBACK 1: Si no encontramos centros por eventos, buscar en entregas existentes
        // Esto puede pasar si el RPC tiene problemas leyendo eventos históricos
        if (centersSet.size === 0) {
          console.log('⚠️ No se encontraron centros por eventos, buscando en entregas existentes...')
          
          try {
            // Buscar eventos DeliveryCreated para extraer centros únicos
            const deliveryLogs = await publicClient.getLogs({
              address: contractAddress,
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
              fromBlock: fromBlock,
              toBlock: currentBlock,
            }).catch(() => [])

            // Extraer centros únicos de las entregas
            deliveryLogs.forEach((log: any) => {
              const centerAddress = (log.args as any)?.recyclingCenter?.toLowerCase()
              if (centerAddress && centerAddress !== '0x0000000000000000000000000000000000000000') {
                centersSet.add(centerAddress)
              }
            })
            
            console.log(`✅ Encontrados ${centersSet.size} centros desde entregas existentes`)
          } catch (err) {
            console.error('Error buscando centros en entregas:', err)
          }
        }
        
        // Si no encontramos centros por eventos ni por fallback, intentar una última vez con rango más corto
        if (centersSet.size === 0) {
          console.log('⚠️ No se encontraron centros, intentando búsqueda en últimos bloques...')
          try {
            // Buscar solo en los últimos 5000 bloques (más probable que esté disponible)
            const recentRange = currentBlock > 5000n ? currentBlock - 5000n : 0n
            const recentAdded = await publicClient.getLogs({
              address: contractAddress,
              event: {
                type: 'event',
                name: 'RecyclingCenterAdded',
                inputs: [{ type: 'address', name: 'center', indexed: true }],
              },
              fromBlock: recentRange,
              toBlock: currentBlock,
            }).catch(() => [])

            const recentRemoved = await publicClient.getLogs({
              address: contractAddress,
              event: {
                type: 'event',
                name: 'RecyclingCenterRemoved',
                inputs: [{ type: 'address', name: 'center', indexed: true }],
              },
              fromBlock: recentRange,
              toBlock: currentBlock,
            }).catch(() => [])

            recentAdded.forEach((log: any) => {
              const addr = (log.args as any)?.center?.toLowerCase()
              if (addr) centersSet.add(addr)
            })
            recentRemoved.forEach((log: any) => {
              const addr = (log.args as any)?.center?.toLowerCase()
              if (addr) centersSet.delete(addr)
            })
            
            if (centersSet.size > 0) {
              console.log(`✅ Encontrados ${centersSet.size} centros en bloques recientes`)
            }
          } catch (err) {
            console.error('Error en búsqueda de últimos bloques:', err)
          }
        }

        // Simplificar: usar los centros encontrados directamente, sin verificaciones adicionales que pueden fallar
        // Los eventos y entregas son fuentes confiables
        const centersList = Array.from(centersSet).map(addr => ({
          address: addr as `0x${string}`,
          name: `Centro ${addr.slice(0, 6)}...${addr.slice(-4)}`
        }))

        console.log(`✅ Centros cargados: ${centersList.length}`, centersList.map(c => c.address))

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
    address: contractAddress,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'RecyclingCenterAdded',
    onLogs(logs) {
      console.log('🔔 Evento RecyclingCenterAdded detectado:', logs.length, 'centros')
      logs.forEach((log) => {
        const centerAddress = log.args.center as `0x${string}`
        if (centerAddress) {
          console.log('✅ Agregando centro desde evento:', centerAddress)
          updateCenters(centerAddress, true)
        }
      })
    },
  })

  // Escuchar eventos de centros removidos en tiempo real
  useWatchContractEvent({
    address: contractAddress,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'RecyclingCenterRemoved',
    onLogs(logs) {
      console.log('🔔 Evento RecyclingCenterRemoved detectado:', logs.length, 'centros')
      logs.forEach((log) => {
        const centerAddress = log.args.center as `0x${string}`
        if (centerAddress) {
          console.log('❌ Removiendo centro desde evento:', centerAddress)
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
          address: contractAddress,
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
              address: contractAddress,
              abi: RECYCLING_CONTRACT_ABI,
              functionName: 'deliveries',
              args: [deliveryId],
            }) as any

            return {
              id: deliveryId,
              delivery: parseDeliveryFromContract(delivery),
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
              address: contractAddress,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryCreated',
    onLogs(logs) {
      logs.forEach(async (log) => {
        if (log.args.user?.toLowerCase() === address?.toLowerCase()) {
          const deliveryId = log.args.deliveryId as bigint
          if (!publicClient) return

          try {
            const delivery = await publicClient.readContract({
              address: contractAddress,
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
        
        // Intentar buscar desde un rango más amplio (10,000 bloques) o desde el bloque 0
        // Usar una estrategia de chunks para evitar límites de RPC
        const searchRanges = [
          { from: currentBlock > 10000n ? currentBlock - 10000n : 0n, to: currentBlock }, // Últimos 10k bloques
          { from: 0n, to: currentBlock > 10000n ? currentBlock - 10000n : currentBlock }, // Resto si hay más
        ]

        const allLogs: any[] = []

        // Buscar en chunks para evitar límites de RPC
        for (const range of searchRanges) {
          if (range.from >= range.to) continue

          try {
            // Intentar obtener eventos en este rango
            const chunkLogs = await publicClient.getLogs({
              address: contractAddress,
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
              fromBlock: range.from,
              toBlock: range.to,
            }).catch(() => [])

            allLogs.push(...chunkLogs)
          } catch (error: any) {
            // Si el rango es muy grande, intentar dividirlo en chunks más pequeños
            if (error?.message?.includes('too large') || error?.message?.includes('range')) {
              const chunkSize = 5000n
              let chunkFrom = range.from
              
              while (chunkFrom < range.to) {
                const chunkTo = chunkFrom + chunkSize > range.to ? range.to : chunkFrom + chunkSize
                
                try {
                  const chunkLogs = await publicClient.getLogs({
                    address: contractAddress,
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
                    fromBlock: chunkFrom,
                    toBlock: chunkTo,
                  }).catch(() => [])

                  allLogs.push(...chunkLogs)
                } catch {
                  // Ignorar errores en chunks individuales
                }
                
                chunkFrom = chunkTo + 1n
              }
            } else {
              console.warn('Error loading deliveries in range:', error)
            }
          }
        }

        const logs = allLogs

        // Obtener detalles de cada entrega y filtrar solo las pendientes
        const deliveryPromises = logs.map(async (log: any) => {
          const deliveryId = log.args.deliveryId as bigint
          try {
            const delivery = await publicClient.readContract({
              address: contractAddress,
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
  
  // Agregar dependencia de chainId para recargar cuando cambia la red
  const { chainId } = useAccount()
  
  useEffect(() => {
    // Recargar cuando cambia la red
    if (chainId) {
      setDeliveries([])
      setIsLoading(true)
      // Esto se recargará automáticamente por el useEffect anterior
    }
  }, [chainId])

  // Escuchar nuevos eventos en tiempo real - DeliveryCreated
  useWatchContractEvent({
              address: contractAddress,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryCreated',
    onLogs(logs) {
      logs.forEach(async (log) => {
        const deliveryId = log.args.deliveryId as bigint
        if (!publicClient) return

        try {
          const delivery = await publicClient.readContract({
            address: contractAddress,
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
                  ...parseDeliveryFromContract(delivery),
                  status: status,
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
              address: contractAddress,
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
              address: contractAddress,
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
                address: contractAddress,
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
                  ...parseDeliveryFromContract(delivery),
                  status: status,
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

// Helper function para parsear Delivery desde datos del contrato
// El struct en Solidity es: user, recyclingCenter, collector, materialType, amount, paymentAmount, paymentToken, status, createdAt, validatedAt, rejectionReason, metadata
function parseDeliveryFromContract(deliveryData: any): Delivery {
  return {
    user: deliveryData[0],
    recyclingCenter: deliveryData[1],
    collector: deliveryData[2], // Nuevo campo
    materialType: deliveryData[3],
    amount: deliveryData[4],
    paymentAmount: deliveryData[5],
    paymentToken: deliveryData[6] as PaymentToken,
    status: deliveryData[7] as DeliveryStatus,
    createdAt: deliveryData[8],
    validatedAt: deliveryData[9],
    rejectionReason: deliveryData[10],
    metadata: deliveryData[11],
  }
}

// Hook para obtener una entrega específica por ID usando el mapping deliveries
// Esta versión reemplaza la anterior que usaba getDelivery
export function useDelivery(deliveryId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
              address: contractAddress,
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

  const delivery = parseDeliveryFromContract(data)

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
        
        // Intentar buscar desde un rango más amplio (10,000 bloques) o desde el bloque 0
        // Usar una estrategia de chunks para evitar límites de RPC
        const searchRanges = [
          { from: currentBlock > 10000n ? currentBlock - 10000n : 0n, to: currentBlock }, // Últimos 10k bloques
          { from: 0n, to: currentBlock > 10000n ? currentBlock - 10000n : currentBlock }, // Resto si hay más
        ]

        const allLogs: any[] = []

        // Buscar en chunks para evitar límites de RPC
        for (const range of searchRanges) {
          if (range.from >= range.to) continue

          try {
            // Intentar obtener eventos en este rango filtrados por centro
            const chunkLogs = await publicClient.getLogs({
              address: contractAddress,
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
              fromBlock: range.from,
              toBlock: range.to,
            }).catch(() => [])

            allLogs.push(...chunkLogs)
          } catch (error: any) {
            // Si el rango es muy grande, intentar dividirlo en chunks más pequeños
            if (error?.message?.includes('too large') || error?.message?.includes('range')) {
              const chunkSize = 5000n
              let chunkFrom = range.from
              
              while (chunkFrom < range.to) {
                const chunkTo = chunkFrom + chunkSize > range.to ? range.to : chunkFrom + chunkSize
                
                try {
                  const chunkLogs = await publicClient.getLogs({
                    address: contractAddress,
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
                    fromBlock: chunkFrom,
                    toBlock: chunkTo,
                  }).catch(() => [])

                  allLogs.push(...chunkLogs)
                } catch {
                  // Ignorar errores en chunks individuales
                }
                
                chunkFrom = chunkTo + 1n
              }
            } else {
              console.warn('Error loading center deliveries in range:', error)
            }
          }
        }

        // Filtrar logs para este centro específico (por si acaso algunos chunks no filtraron correctamente)
        const logs = allLogs.filter((log: any) => 
          log.args.recyclingCenter?.toLowerCase() === centerAddress.toLowerCase()
        )

        // Obtener detalles de cada entrega
        const deliveryPromises = logs.map(async (log: any) => {
          const deliveryId = log.args.deliveryId as bigint
          try {
            const delivery = await publicClient.readContract({
              address: contractAddress,
              abi: RECYCLING_CONTRACT_ABI,
              functionName: 'deliveries',
              args: [deliveryId],
            }) as any

            return {
              id: deliveryId,
              delivery: parseDeliveryFromContract(delivery),
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
  
  // Agregar dependencia de chainId para recargar cuando cambia la red
  const { chainId } = useAccount()
  
  useEffect(() => {
    // Recargar cuando cambia la red o el centro
    if (chainId && centerAddress) {
      setDeliveries([])
      setIsLoading(true)
      // Esto se recargará automáticamente por el useEffect anterior
    }
  }, [chainId, centerAddress])

  // Escuchar nuevos eventos en tiempo real
  useWatchContractEvent({
              address: contractAddress,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryCreated',
    onLogs(logs) {
      logs.forEach(async (log) => {
        if (log.args.recyclingCenter?.toLowerCase() === centerAddress?.toLowerCase()) {
          const deliveryId = log.args.deliveryId as bigint
          if (!publicClient) return

          try {
            const delivery = await publicClient.readContract({
              address: contractAddress,
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

