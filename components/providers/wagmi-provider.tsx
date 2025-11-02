'use client'

import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { useState, useEffect, type ReactNode } from 'react'
import { config } from '@/lib/wagmi-config'
import '@rainbow-me/rainbowkit/styles.css'

export function WagmiProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  // Solo renderizar en el cliente para evitar problemas con indexedDB durante SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Durante SSR, renderizar solo los children sin los providers de wallet
  if (!mounted) {
    return <>{children}</>
  }

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
