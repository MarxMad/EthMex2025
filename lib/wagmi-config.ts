'use client'

import { createConfig, http } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'
import { arbitrumSepolia } from 'viem/chains'

// Configuración de wagmi para Arbitrum Sepolia (donde está desplegado el contrato)
// Solo inicializar connectors en el cliente para evitar errores de SSR
const connectors = typeof window !== 'undefined' 
  ? [injected(), metaMask()]
  : []

export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: connectors.length > 0 ? connectors : [injected()], // Fallback durante SSR
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
  },
})

export const arbitrumSepoliaChain = arbitrumSepolia

