'use client'

import { createConfig, http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia, scrollSepolia } from 'viem/chains'

// Solo ejecutar la configuración en el cliente para evitar problemas con indexedDB durante SSR
let config: ReturnType<typeof getDefaultConfig> | null = null

// Configurar RPC con fallbacks para evitar problemas de CORS y rate limiting
// Prioridad: Alchemy > Infura > PublicNode > Arbitrum público
const getArbitrumSepoliaRpc = (): string => {
  // Intentar usar Alchemy si está configurado
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    return `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  }
  
  // Intentar usar Infura si está configurado
  if (process.env.NEXT_PUBLIC_INFURA_API_KEY) {
    return `https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
  }
  
  // Usar PublicNode (gratis, mejor soporte CORS que el oficial)
  return 'https://arbitrum-sepolia-rpc.publicnode.com'
}

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
      // Configurar transports personalizados para evitar problemas de CORS
      transports: {
        [arbitrumSepolia.id]: http(getArbitrumSepoliaRpc(), {
          batch: {
            multicall: true,
            wait: 100,
          },
          retryCount: 3,
          retryDelay: 1000,
        }),
        [scrollSepolia.id]: http(),
      },
    })
    
    // Log para debugging
    console.log('🔗 RPC Configurado:', {
      arbitrumSepolia: getArbitrumSepoliaRpc(),
      usando: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 'Alchemy' : 
              process.env.NEXT_PUBLIC_INFURA_API_KEY ? 'Infura' : 
              'PublicNode (gratis)'
    })
  } catch (error) {
    console.error('Error creating wagmi config:', error)
  }
}

// Si no hay config (durante SSR), crear uno básico sin RainbowKit
// Usar el mismo RPC configurado
export const wagmiConfig = config || createConfig({
  chains: [arbitrumSepolia, scrollSepolia],
  connectors: [],
  transports: {
    [arbitrumSepolia.id]: http(getArbitrumSepoliaRpc(), {
      // Configuración para reducir rate limiting
      batch: {
        multicall: true,
        wait: 100, // Esperar 100ms antes de agrupar requests
      },
      retryCount: 3, // Reintentar hasta 3 veces
      retryDelay: 1000, // Esperar 1 segundo entre reintentos
    }),
    [scrollSepolia.id]: http(),
  },
})

export const arbitrumSepoliaChain = arbitrumSepolia
export const scrollSepoliaChain = scrollSepolia

// Para compatibilidad con código existente
export { wagmiConfig as config }
