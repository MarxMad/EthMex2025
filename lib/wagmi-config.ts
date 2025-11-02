'use client'

import { createConfig, http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia, scrollSepolia } from 'viem/chains'

// Obtener projectId de WalletConnect Cloud
// Puedes obtener uno gratuito en https://cloud.walletconnect.com
// Para producción, agrega NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID en tus variables de entorno
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE'

// Configuración de wagmi con RainbowKit para Arbitrum Sepolia y Scroll Sepolia
export const config = getDefaultConfig({
  appName: 'CriKula',
  projectId: projectId,
  chains: [arbitrumSepolia, scrollSepolia],
  ssr: false, // Deshabilitar SSR para evitar problemas
})

export const arbitrumSepoliaChain = arbitrumSepolia
export const scrollSepoliaChain = scrollSepolia
