'use client'

import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { arbitrumSepolia } from 'viem/chains'

// Configuración de wagmi para Arbitrum Sepolia (donde está desplegado el contrato)
// Usar solo injected() para evitar problemas de SSR con metaMask()
// MetaMask funciona automáticamente a través de injected() si está instalado
export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
  },
})

export const arbitrumSepoliaChain = arbitrumSepolia

