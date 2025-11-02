'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, Truck, Building2, AlertCircle, Loader2 } from 'lucide-react'
import { RoleSelector } from './role-selector'
import Link from 'next/link'

interface RoleGuardProps {
  allowedRoles: ('usuario' | 'recolector' | 'centro')[]
  children: React.ReactNode
}

/**
 * Componente que protege rutas según el rol del usuario
 * Si el usuario no tiene el rol correcto, muestra mensaje o redirige
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected, address } = useAccount()
  const { role, isLoading } = useUserRole()

  // Si no está conectado, no proteger (dejar que la página muestre el mensaje)
  if (!isConnected || !address) {
    return <>{children}</>
  }

  // Si está cargando el rol, mostrar loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando permisos...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no tiene rol seleccionado, mostrar selector
  if (!role || role === null) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debes seleccionar un rol antes de acceder a esta página.
          </AlertDescription>
        </Alert>
        <RoleSelector />
        <Card className="max-w-md mx-auto mt-4">
          <CardContent className="pt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si tiene rol pero no está permitido, mostrar mensaje
  if (!allowedRoles.includes(role)) {
    const getRoleInfo = (role: string) => {
      switch (role) {
        case 'usuario':
          return { icon: Package, label: 'Usuario', link: '/usuario/dashboard' }
        case 'recolector':
          return { icon: Truck, label: 'Recolector', link: '/recolector/dashboard' }
        case 'centro':
          return { icon: Building2, label: 'Centro de Reciclaje', link: '/centro/dashboard' }
        default:
          return { icon: Package, label: 'Usuario', link: '/usuario/dashboard' }
      }
    }

    const currentRoleInfo = getRoleInfo(role)
    const RoleIcon = currentRoleInfo.icon

    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Acceso Denegado
            </CardTitle>
            <CardDescription>
              Esta página solo está disponible para ciertos roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <RoleIcon className="h-4 w-4" />
              <AlertDescription>
                Tu rol actual es: <strong>{currentRoleInfo.label}</strong>
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Esta página requiere uno de los siguientes roles:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {allowedRoles.map((r) => (
                  <li key={r}>
                    {r === 'usuario' ? 'Usuario' : r === 'recolector' ? 'Recolector' : 'Centro de Reciclaje'}
                  </li>
                ))}
              </ul>
            </div>
            <Button className="w-full" asChild>
              <Link href={currentRoleInfo.link}>
                <RoleIcon className="w-4 h-4 mr-2" />
                Ir a mi Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si tiene el rol correcto, mostrar el contenido
  return <>{children}</>
}

