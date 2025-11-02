'use client'

import { createConfig, http } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'
import { arbitrumSepolia } from 'viem/chains'

// Configuración de wagmi para Arbitrum Sepolia (donde está desplegado el contrato)
export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
  },
})

export const arbitrumSepoliaChain = arbitrumSepolia

