'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, AlertCircle } from 'lucide-react'
import { arbitrumSepoliaChain } from '@/lib/wagmi-config'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Cambiar automáticamente a Arbitrum Sepolia si está conectado en otra red
  useEffect(() => {
    if (isConnected && chainId && chainId !== arbitrumSepoliaChain.id) {
      switchChain({ chainId: arbitrumSepoliaChain.id })
    }
  }, [isConnected, chainId, switchChain])

  // Evitar hidratación: solo renderizar después de mount
  if (!mounted) {
    return (
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            disabled
            size="sm"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Conectar {connector.name}
          </Button>
        ))}
      </div>
    )
  }

  if (isConnected) {
    const isWrongChain = chainId && chainId !== arbitrumSepoliaChain.id

    return (
      <div className="flex flex-col gap-2">
        {isWrongChain && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Estás en otra red. Cambiando a Arbitrum Sepolia...
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            {chainId === arbitrumSepoliaChain.id && (
              <span className="text-xs text-green-600 dark:text-green-400">✓ Arbitrum</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            Desconectar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector, chainId: arbitrumSepoliaChain.id })}
          disabled={isPending}
          size="sm"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Conectar {connector.name}
        </Button>
      ))}
    </div>
  )
}

