'use client'

import { useAccount, useBalance, usePublicClient } from 'wagmi'
import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { RECYCLING_CONTRACT_ADDRESS, RECYCLING_CONTRACT_ABI, PaymentToken } from '@/lib/contracts'
import { formatEther, parseEther, encodeFunctionData } from 'viem'

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
    const user = deliveryData[0] as string // user (creador de la entrega)
    const paymentAmount = deliveryData[5] as bigint // paymentAmount
    const paymentToken = deliveryData[6] as PaymentToken // paymentToken
    const collector = deliveryData[2] as string // collector

    console.log('📋 Datos de la entrega obtenidos:', {
      deliveryId: deliveryId.toString(),
      user: user,
      collector: collector || 'Sin recolector',
      paymentAmount: paymentAmount.toString(),
      paymentAmountFormatted: formatEther(paymentAmount),
      paymentToken,
    })

    // CRÍTICO: Validar que el usuario no está intentando aceptar su propia entrega
    // El contrato tiene: require(msg.sender != delivery.user, "User cannot accept their own delivery")
    if (address && user.toLowerCase() === address.toLowerCase()) {
      throw new Error('No puedes aceptar tu propia solicitud de recolección. Solo otros recolectores pueden aceptarla.')
    }

    // Validar que la entrega esté pendiente y sin recolector
    if (collector && collector !== '0x0000000000000000000000000000000000000000') {
      throw new Error('Esta entrega ya tiene un recolector asignado')
    }

    // Validar que paymentAmount sea válido
    if (!paymentAmount || paymentAmount === 0n) {
      throw new Error('El monto de pago de esta entrega no está configurado o es cero')
    }

    // Calcular el valor a enviar si es ETH
    // IMPORTANTE: Este valor DEBE ser exactamente paymentAmount para que el contrato lo acepte
    // El contrato verifica: require(msg.value >= delivery.paymentAmount, "Insufficient ETH payment")
    let value: bigint = 0n
    if (paymentToken === PaymentToken.ETH) {
      // CRÍTICO: value debe ser exactamente paymentAmount (o mayor, el contrato reembolsa el exceso)
      value = paymentAmount
      
      console.log('✅ Valor calculado para enviar al contrato:', {
        paymentAmountWei: paymentAmount.toString(),
        paymentAmountETH: formatEther(paymentAmount),
        valueWei: value.toString(),
        valueETH: formatEther(value),
        sonIguales: value === paymentAmount,
      })
      
      console.log('💰 Preparando pago al contrato:', {
        deliveryId: deliveryId.toString(),
        paymentAmount: formatEther(paymentAmount),
        paymentAmountWei: paymentAmount.toString(),
        paymentToken: 'ETH',
        valorAEnviar: formatEther(value),
      })
      
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

    // Estimar gas y gas prices antes de enviar la transacción
    let gasEstimate: bigint | undefined
    let maxFeePerGas: bigint | undefined
    let maxPriorityFeePerGas: bigint | undefined
    
    try {
      // Obtener gas prices actuales de la red
      const feeData = await publicClient.estimateFeesPerGas()
      
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // Usar valores estimados pero con un límite máximo razonable
        // Limitar maxFeePerGas a máximo 100 gwei para evitar fees excesivos
        const maxFeeLimit = parseEther('0.0000001') // 100 gwei
        maxFeePerGas = feeData.maxFeePerGas > maxFeeLimit ? maxFeeLimit : feeData.maxFeePerGas
        
        // Limitar maxPriorityFeePerGas a máximo 5 gwei
        const maxPriorityLimit = parseEther('0.000000005') // 5 gwei
        maxPriorityFeePerGas = feeData.maxPriorityFeePerGas > maxPriorityLimit 
          ? maxPriorityLimit 
          : feeData.maxPriorityFeePerGas
          
        console.log('💰 Gas prices estimados:', {
          maxFeePerGas: formatEther(maxFeePerGas) + ' ETH',
          maxPriorityFeePerGas: formatEther(maxPriorityFeePerGas) + ' ETH',
        })
      }
      
      // Estimar gas limit necesario
      gasEstimate = await publicClient.estimateGas({
        account: address,
        to: RECYCLING_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: RECYCLING_CONTRACT_ABI,
          functionName: 'acceptDelivery',
          args: [deliveryId], // ✅ Solo necesita deliveryId (uint256)
        }),
        value: value,
      })
      
      // Limitar el gas a un máximo razonable (250,000 unidades de gas es más que suficiente)
      const MAX_GAS_LIMIT = 250000n
      const gasWithMargin = gasEstimate > MAX_GAS_LIMIT 
        ? MAX_GAS_LIMIT 
        : (gasEstimate * BigInt(120)) / BigInt(100) // 20% margen si es menor al límite
      
      console.log('⛽ Gas estimado para acceptDelivery:', {
        estimado: gasEstimate.toString(),
        conMargen: gasWithMargin.toString(),
        maxFeePerGas: maxFeePerGas ? formatEther(maxFeePerGas) : 'N/A',
        costoEstimado: maxFeePerGas ? formatEther(gasWithMargin * maxFeePerGas) : 'N/A',
      })
      
      console.log('📤 Enviando transacción acceptDelivery:', {
        functionName: 'acceptDelivery',
        args: [deliveryId.toString()], // ✅ Solo deliveryId como requiere el contrato
        value: formatEther(value) + ' ETH',
        gasLimit: gasWithMargin.toString(),
        maxFeePerGas: maxFeePerGas?.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
      })
      
      // IMPORTANTE: 
      // - La función del contrato solo requiere: acceptDelivery(uint256 _deliveryId)
      // - Es payable, así que el campo 'value' envía ETH al contrato
      // - Establecemos límites de gas para evitar fees excesivos
      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'acceptDelivery', // ✅ Nombre correcto
        args: [deliveryId], // ✅ Solo deliveryId (uint256) como requiere el contrato
        value: value, // ✅ Enviar ETH al contrato (payable)
        gas: gasWithMargin, // ✅ Limitar gas para evitar estimaciones excesivas
        ...(maxFeePerGas && maxPriorityFeePerGas ? {
          maxFeePerGas,
          maxPriorityFeePerGas,
        } : {}),
      })
    } catch (gasError: any) {
      console.error('Error estimando gas o fees:', gasError)
      
      // Fallback: intentar sin límites de gas price pero con gas limit
      // Esto es más seguro que sin límites
      console.log('🔄 Intentando con configuración de fallback...')
      
      // Estimar solo el gas limit sin límites de precio
      try {
        const fallbackGasEstimate = await publicClient.estimateGas({
          account: address,
          to: RECYCLING_CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: RECYCLING_CONTRACT_ABI,
            functionName: 'acceptDelivery',
            args: [deliveryId],
          }),
          value: value,
        })
        
        const fallbackGasLimit = fallbackGasEstimate > 250000n 
          ? 250000n 
          : (fallbackGasEstimate * BigInt(120)) / BigInt(100)
        
        await writeContract({
          address: RECYCLING_CONTRACT_ADDRESS,
          abi: RECYCLING_CONTRACT_ABI,
          functionName: 'acceptDelivery',
          args: [deliveryId], // ✅ Solo deliveryId
          value: value, // ✅ CRÍTICO: El recolector debe enviar el pago
          gas: fallbackGasLimit, // ✅ Limitar gas limit al menos
        })
      } catch (fallbackError: any) {
        // Último fallback: sin límites (solo para casos extremos)
        console.warn('⚠️ Usando configuración sin límites de gas (fallback final)')
        await writeContract({
          address: RECYCLING_CONTRACT_ADDRESS,
          abi: RECYCLING_CONTRACT_ABI,
          functionName: 'acceptDelivery',
          args: [deliveryId], // ✅ Solo deliveryId como requiere el contrato
          value: value, // ✅ CRÍTICO: El recolector debe enviar el pago
        })
      }
    }

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

