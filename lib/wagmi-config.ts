'use client'

import { createConfig, http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia, scrollSepolia } from 'viem/chains'

// Configuración de wagmi con RainbowKit para Arbitrum Sepolia y Scroll Sepolia
export const config = getDefaultConfig({
  appName: 'CriKula',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '', // Opcional: obtener en https://cloud.walletconnect.com
  chains: [arbitrumSepolia, scrollSepolia],
  ssr: false, // Deshabilitar SSR para evitar problemas
})

export const arbitrumSepoliaChain = arbitrumSepolia
export const scrollSepoliaChain = scrollSepolia
