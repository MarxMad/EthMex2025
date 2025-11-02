'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { arbitrumSepoliaChain } from '@/lib/wagmi-config'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Desconectar
        </Button>
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

