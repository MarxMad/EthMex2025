'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits } from 'viem'
import { PaymentToken } from '@/lib/contracts'
import { RECYCLING_CONTRACT_ADDRESS } from '@/lib/contracts'

// Direcciones de tokens en Arbitrum Sepolia
const TOKEN_ADDRESSES = {
  [PaymentToken.USDC]: '0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1' as const,
  [PaymentToken.MXNB]: '0x7911e898d0F91Db0DF9604574878906a3aB3E61e' as const,
} as const

// ABI mínimo para balanceOf y allowance
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const

const DECIMALS = {
  [PaymentToken.USDC]: 6,
  [PaymentToken.MXNB]: 18,
} as const

/**
 * Hook para obtener el balance de un token ERC20
 */
export function useTokenBalance(paymentToken: PaymentToken | null, enabled = true) {
  const { address, isConnected } = useAccount()
  const tokenAddress = paymentToken && paymentToken !== PaymentToken.ETH 
    ? TOKEN_ADDRESSES[paymentToken as PaymentToken.USDC | PaymentToken.MXNB]
    : undefined

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: enabled && isConnected && !!address && !!tokenAddress,
    },
  })

  return {
    balance: balance || 0n,
    balanceFormatted: balance 
      ? formatUnits(balance, paymentToken === PaymentToken.USDC ? 6 : 18)
      : '0',
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para obtener el allowance de un token ERC20 para el contrato
 */
export function useTokenAllowance(
  paymentToken: PaymentToken | null,
  contractAddress: `0x${string}` | undefined,
  enabled = true
) {
  const { address, isConnected } = useAccount()
  const tokenAddress = paymentToken && paymentToken !== PaymentToken.ETH 
    ? TOKEN_ADDRESSES[paymentToken as PaymentToken.USDC | PaymentToken.MXNB]
    : undefined

  const { data: allowance, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && contractAddress ? [address, contractAddress] : undefined,
    query: {
      enabled: enabled && isConnected && !!address && !!tokenAddress && !!contractAddress,
    },
  })

  return {
    allowance: allowance || 0n,
    allowanceFormatted: allowance 
      ? formatUnits(allowance, paymentToken === PaymentToken.USDC ? 6 : 18)
      : '0',
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para verificar si el usuario tiene suficiente balance y allowance
 */
export function useTokenValidation(
  paymentToken: PaymentToken | null,
  requiredAmount: bigint | undefined,
  contractAddress: `0x${string}` | undefined
) {
  const { balance, isLoading: loadingBalance } = useTokenBalance(
    paymentToken,
    !!requiredAmount && requiredAmount > 0n
  )
  const { allowance, isLoading: loadingAllowance } = useTokenAllowance(
    paymentToken,
    contractAddress,
    !!requiredAmount && requiredAmount > 0n
  )

  const hasSufficientBalance = requiredAmount 
    ? balance >= requiredAmount 
    : true
  const hasSufficientAllowance = requiredAmount 
    ? allowance >= requiredAmount 
    : true
  const needsApproval = requiredAmount 
    ? allowance < requiredAmount 
    : false

  return {
    balance,
    allowance,
    hasSufficientBalance,
    hasSufficientAllowance,
    needsApproval,
    isLoading: loadingBalance || loadingAllowance,
  }
}

/**
 * Hook para aprobar tokens ERC20
 */
export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approveToken = async (
    paymentToken: PaymentToken.USDC | PaymentToken.MXNB,
    spenderAddress: `0x${string}`,
    amount: bigint
  ) => {
    if (paymentToken === PaymentToken.ETH) {
      throw new Error('ETH no requiere aprobación')
    }

    const tokenAddress = TOKEN_ADDRESSES[paymentToken]

    await writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amount],
    })
  }

  return {
    approveToken,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

