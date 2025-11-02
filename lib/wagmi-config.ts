'use client'

import { createConfig, http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia, scrollSepolia } from 'viem/chains'

// Solo ejecutar la configuración en el cliente para evitar problemas con indexedDB durante SSR
let config: ReturnType<typeof getDefaultConfig> | null = null

// Obtener projectId de WalletConnect Cloud
const projectId = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000')
  : '00000000000000000000000000000000'

// Verificar que tenemos un projectId válido
if (typeof window !== 'undefined' && (!projectId || projectId === '00000000000000000000000000000000' || projectId.length !== 32)) {
  console.warn('⚠️ WalletConnect ProjectId no configurado. Algunas funcionalidades pueden no estar disponibles. Obtén uno en https://cloud.walletconnect.com')
}

// Crear config solo en el cliente
if (typeof window !== 'undefined') {
  try {
    config = getDefaultConfig({
      appName: 'CriKula',
      projectId: projectId,
      chains: [arbitrumSepolia, scrollSepolia],
      ssr: false,
    })
  } catch (error) {
    console.error('Error creating wagmi config:', error)
  }
}

// Si no hay config (durante SSR), crear uno básico sin RainbowKit
export const wagmiConfig = config || createConfig({
  chains: [arbitrumSepolia, scrollSepolia],
  connectors: [],
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    [scrollSepolia.id]: http(),
  },
})

export const arbitrumSepoliaChain = arbitrumSepolia
export const scrollSepoliaChain = scrollSepolia

// Para compatibilidad con código existente
export { wagmiConfig as config }
