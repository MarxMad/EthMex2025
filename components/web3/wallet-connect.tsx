'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSwitchChain } from 'wagmi'
import { arbitrumSepoliaChain, scrollSepoliaChain } from '@/lib/wagmi-config'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export function WalletConnect() {
  const { chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  // Verificar si está en una red soportada
  const isSupportedChain = chainId === arbitrumSepoliaChain.id || chainId === scrollSepoliaChain.id

  // Sugerir cambio si está en una red no soportada
  useEffect(() => {
    if (isConnected && chainId && !isSupportedChain) {
      // No cambiar automáticamente, solo mostrar alerta
    }
  }, [isConnected, chainId, isSupportedChain])

  return (
    <div className="flex flex-col gap-2">
      {isConnected && !isSupportedChain && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor cambia a Arbitrum Sepolia o Scroll Sepolia
            {switchChain && (
              <button
                onClick={() => switchChain({ chainId: arbitrumSepoliaChain.id })}
                className="ml-2 underline"
              >
                Cambiar ahora
              </button>
            )}
          </AlertDescription>
        </Alert>
      )}
      <ConnectButton />
    </div>
  )
}
