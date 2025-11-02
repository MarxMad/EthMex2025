'use client'

import { createConfig, http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia, scrollSepolia } from 'viem/chains'

// Obtener projectId de WalletConnect Cloud
// IMPORTANTE: Para producción, obtén un projectId real en https://cloud.walletconnect.com
// y agrega NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID en las variables de entorno de Vercel
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000'

// Verificar que tenemos un projectId válido (debe ser una cadena hexadecimal de 32 caracteres)
if (!projectId || projectId === '00000000000000000000000000000000' || projectId.length !== 32) {
  console.warn('⚠️ WalletConnect ProjectId no configurado. Algunas funcionalidades pueden no estar disponibles. Obtén uno en https://cloud.walletconnect.com')
}

// Configuración de wagmi con RainbowKit para Arbitrum Sepolia y Scroll Sepolia
export const config = getDefaultConfig({
  appName: 'CriKula',
  projectId: projectId,
  chains: [arbitrumSepolia, scrollSepolia],
  ssr: false, // Deshabilitar SSR para evitar problemas
})

export const arbitrumSepoliaChain = arbitrumSepolia
export const scrollSepoliaChain = scrollSepolia
