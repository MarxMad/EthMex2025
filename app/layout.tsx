import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WagmiProvider } from "@/components/providers/wagmi-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CriKula - El Uber del Reciclaje",
  description: "Conectamos usuarios, recolectores y centros de reciclaje para transformar residuos en oportunidades",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <WagmiProvider>
        {children}
        </WagmiProvider>
        <Analytics />
      </body>
    </html>
  )
}
