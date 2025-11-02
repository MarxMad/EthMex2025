import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WagmiProvider } from "@/components/providers/wagmi-provider"
import { Navbar } from "@/components/layout/navbar"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CriKula - El Uber del Reciclaje",
  description: "Conectamos usuarios, recolectores y centros de reciclaje para transformar residuos en oportunidades mediante blockchain",
  generator: "v0.app",
  keywords: ["reciclaje", "blockchain", "economía circular", "Arbitrum", "web3", "sostenibilidad"],
  authors: [{ name: "CriKula Team" }],
  creator: "CriKula",
  publisher: "CriKula",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://eth-mex2025.vercel.app'),
  openGraph: {
    title: "CriKula - El Uber del Reciclaje",
    description: "Conectamos usuarios, recolectores y centros de reciclaje para transformar residuos en oportunidades mediante blockchain",
    url: "/",
    siteName: "CriKula",
    images: [
      {
        url: "/LogoC.jpeg",
        width: 1200,
        height: 1200,
        alt: "CriKula Logo",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CriKula - El Uber del Reciclaje",
    description: "Conectamos usuarios, recolectores y centros de reciclaje para transformar residuos en oportunidades mediante blockchain",
    images: ["/LogoC.jpeg"],
  },
  icons: {
    icon: [
      { url: "/LogoC.jpeg", sizes: "any" },
    ],
    apple: [
      { url: "/LogoC.jpeg", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
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
          <Navbar />
        {children}
        </WagmiProvider>
        <Analytics />
      </body>
    </html>
  )
}
