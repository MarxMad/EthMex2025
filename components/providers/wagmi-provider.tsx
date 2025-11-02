'use client'

import dynamic from 'next/dynamic'
import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { wagmiConfig as config } from '@/lib/wagmi-config'

// Cargar RainbowKitProvider dinámicamente solo en el cliente para evitar problemas con indexedDB
const RainbowKitProvider = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.RainbowKitProvider),
  { ssr: false }
)

// Importar estilos de RainbowKit solo en el cliente
if (typeof window !== 'undefined') {
  import('@rainbow-me/rainbowkit/styles.css')
}

export function WagmiProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProviderBase>
  )
}
