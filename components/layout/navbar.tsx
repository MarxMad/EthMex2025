'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { WalletConnect } from '@/components/web3/wallet-connect'
import { Button } from '@/components/ui/button'
import { useAccount } from 'wagmi'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { Building2, Truck, User } from 'lucide-react'

export function Navbar() {
  const { isConnected } = useAccount()
  const { role } = useUserRole()

  const getDashboardLink = () => {
    if (!isConnected || !role) return null

    switch (role) {
      case 'centro':
        return { href: '/centro/dashboard', label: 'Dashboard Centro', icon: Building2 }
      case 'recolector':
        return { href: '/recolector/dashboard', label: 'Dashboard Recolector', icon: Truck }
      case 'usuario':
        return { href: '/usuario/dashboard', label: 'Dashboard Usuario', icon: User }
      default:
        return null
    }
  }

  const dashboardLink = getDashboardLink()

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo href="/" />
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#como-funciona"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cómo funciona
          </Link>
          <Link 
            href="#beneficios" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Beneficios
          </Link>
          <WalletConnect />
          {dashboardLink && (
            <Button variant="outline" size="sm" asChild>
              <Link href={dashboardLink.href}>
                <dashboardLink.icon className="w-4 h-4 mr-2" />
                {dashboardLink.label}
              </Link>
            </Button>
          )}
          {!isConnected && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/centro/registro">
                  <Building2 className="w-4 h-4 mr-2" />
                  Ser Centro de Reciclaje
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

