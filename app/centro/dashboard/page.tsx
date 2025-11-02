"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAccount, useDisconnect } from "wagmi"
import { Logo } from "@/components/logo"
import { useCenterDeliveries, useIsRecyclingCenter } from "@/lib/hooks/use-recycling-contract"
import { hasCollector, getDeliveryCollector } from "@/lib/hooks/use-collector-acceptance"
import { DeliveryStatus, PaymentToken } from "@/lib/contracts"
import { formatEther } from "viem"
import {
  Package,
  DollarSign,
  TrendingUp,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Settings,
} from "lucide-react"

export default function CentroDashboard() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { isRecyclingCenter, isLoading: checkingCenter } = useIsRecyclingCenter(
    address ? (address as `0x${string}`) : undefined
  )
  const { deliveries, isLoading } = useCenterDeliveries(
    address ? (address as `0x${string}`) : undefined
  )

  // Mapeo de materiales para mostrar
  const materialNames: Record<string, string> = {
    plastico: "Plástico PET",
    carton: "Cartón",
    vidrio: "Vidrio",
    aluminio: "Aluminio",
    papel: "Papel",
    electronico: "Electrónico",
    electronicos: "Electrónicos",
  }

  // Función para parsear metadata
  const parseMetadata = (metadata: string) => {
    try {
      const parsed = JSON.parse(metadata)
      return {
        direccion: parsed.direccion || "",
        fecha: parsed.fecha || "",
        hora: parsed.hora || "",
        notas: parsed.notas || "",
      }
    } catch {
      return {
        direccion: "",
        fecha: "",
        hora: "",
        notas: "",
      }
    }
  }

  // Solo filtrar por recolector en el cliente después del mount para evitar problemas de hidratación
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Separar entregas por estado
  // Los centros solo ven entregas que tienen recolector asignado (aceptadas)
  const solicitudesPendientes = deliveries
    .filter(({ id, delivery }) => 
      delivery.status === DeliveryStatus.Pending && (mounted ? hasCollector(id) : true)
    )
    .map(({ id, delivery }) => {
      const metadata = parseMetadata(delivery.metadata)
      const fecha = delivery.createdAt ? new Date(Number(delivery.createdAt) * 1000).toLocaleString('es-MX') : ""
      const materialName = materialNames[delivery.materialType.toLowerCase()] || delivery.materialType
      
      const pagoAmount = delivery.paymentToken === PaymentToken.ETH
        ? formatEther(delivery.paymentAmount)
        : delivery.paymentAmount.toString()

      const pagoDisplay = delivery.paymentToken === PaymentToken.ETH
        ? `${pagoAmount} ETH`
        : delivery.paymentToken === PaymentToken.USDC
        ? `${Number(pagoAmount) / 1e6} USDC`
        : `${formatEther(delivery.paymentAmount)} MXNB`

      const collectorAddress = mounted ? getDeliveryCollector(id) : null
      const collectorDisplay = collectorAddress 
        ? `${collectorAddress.slice(0, 6)}...${collectorAddress.slice(-4)}`
        : "Sin asignar"

      return {
        id: Number(id),
        tipo: materialName,
        cantidad: `${delivery.amount.toString()} kg`,
        fecha: fecha,
        pago: pagoDisplay,
        deliveryId: id,
        delivery: delivery,
        userAddress: delivery.user,
        collectorAddress: collectorDisplay,
        collectorFullAddress: collectorAddress,
      }
    })

  const enVerificacion = deliveries
    .filter(({ delivery }) => delivery.status === DeliveryStatus.Pending && delivery.validatedAt === 0n)
    .map(({ id, delivery }) => {
      const metadata = parseMetadata(delivery.metadata)
      const fecha = delivery.createdAt ? new Date(Number(delivery.createdAt) * 1000).toLocaleString('es-MX') : ""
      const materialName = materialNames[delivery.materialType.toLowerCase()] || delivery.materialType
      
      const pagoAmount = delivery.paymentToken === PaymentToken.ETH
        ? formatEther(delivery.paymentAmount)
        : delivery.paymentAmount.toString()

      const pagoDisplay = delivery.paymentToken === PaymentToken.ETH
        ? `${pagoAmount} ETH`
        : delivery.paymentToken === PaymentToken.USDC
        ? `${Number(pagoAmount) / 1e6} USDC`
        : `${formatEther(delivery.paymentAmount)} MXNB`

      return {
        id: Number(id),
        tipo: materialName,
        cantidad: `${delivery.amount.toString()} kg`,
        fecha: fecha,
        pagoCalculado: pagoDisplay,
        deliveryId: id,
        delivery: delivery,
        userAddress: delivery.user,
      }
    })

  const completadas = deliveries
    .filter(({ delivery }) => delivery.status === DeliveryStatus.Validated)
    .map(({ id, delivery }) => {
      const metadata = parseMetadata(delivery.metadata)
      const fecha = delivery.validatedAt ? new Date(Number(delivery.validatedAt) * 1000).toLocaleString('es-MX') : ""
      const materialName = materialNames[delivery.materialType.toLowerCase()] || delivery.materialType
      
      const pagoAmount = delivery.paymentToken === PaymentToken.ETH
        ? formatEther(delivery.paymentAmount)
        : delivery.paymentAmount.toString()

      const pagoDisplay = delivery.paymentToken === PaymentToken.ETH
        ? `${pagoAmount} ETH`
        : delivery.paymentToken === PaymentToken.USDC
        ? `${Number(pagoAmount) / 1e6} USDC`
        : `${formatEther(delivery.paymentAmount)} MXNB`

      return {
        id: Number(id),
        tipo: materialName,
        pesoReal: `${delivery.amount.toString()} kg`,
        fecha: fecha,
        pago: pagoDisplay,
      estado: "pagado",
        deliveryId: id,
        delivery: delivery,
        userAddress: delivery.user,
      }
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={40} />
              <p className="text-xs text-muted-foreground">Centro de Reciclaje</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                disconnect()
                setTimeout(() => {
                  window.location.href = '/'
                }, 100)
              }}
              title="Desconectar wallet y salir"
            >
                <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurar Precios
                </h3>
                <p className="text-sm text-muted-foreground">
                  Establece precios por material y método de pago para tu centro
                </p>
              </div>
              <Button asChild variant="default">
                <Link href="/centro/configurar-precios">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Link>
              </Button>
            </div>
          </Card>
          
          <Card className="p-4 bg-accent/5 border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Gestionar Centros</h3>
                <p className="text-sm text-muted-foreground">
                  Registra un nuevo centro autorizado (solo owner)
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/centro/registro">
                  Registrar
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-xs text-muted-foreground">En Verificación</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">$45,280</p>
                <p className="text-xs text-muted-foreground">Procesado</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs de Solicitudes */}
        <Tabs defaultValue="pendientes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pendientes" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendientes ({solicitudesPendientes.length})
            </TabsTrigger>
            <TabsTrigger value="verificacion" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              En Verificación ({enVerificacion.length})
            </TabsTrigger>
            <TabsTrigger value="completadas" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completadas
            </TabsTrigger>
          </TabsList>

          {/* Solicitudes Pendientes */}
          <TabsContent value="pendientes" className="space-y-4">
            {isLoading || checkingCenter ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Cargando solicitudes...</p>
              </Card>
            ) : !address || !isRecyclingCenter ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {!address 
                    ? "Conecta tu wallet para ver las solicitudes de tu centro."
                    : "Tu wallet no está registrada como centro autorizado. Contacta al administrador."}
                </p>
              </Card>
            ) : solicitudesPendientes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No hay solicitudes pendientes con recolector asignado en este momento.
                  Las solicitudes aparecerán aquí una vez que un recolector las haya aceptado.
                </p>
              </Card>
            ) : (
              solicitudesPendientes.map((solicitud) => (
              <Card key={solicitud.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{solicitud.tipo}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{solicitud.cantidad}</p>
                      <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary">Usuario</Badge>
                          <span className="text-muted-foreground">{solicitud.userAddress.slice(0, 6)}...{solicitud.userAddress.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{solicitud.pago}</p>
                    <p className="text-xs text-muted-foreground">Pago estimado</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                  <span>{solicitud.fecha}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/centro/verificar/${solicitud.deliveryId.toString()}`}>Ver Detalles</Link>
                  </Button>
                  <Button size="sm" className="bg-accent text-accent-foreground" asChild>
                      <Link href={`/centro/verificar/${solicitud.deliveryId.toString()}`}>Aceptar y Verificar</Link>
                  </Button>
                </div>
              </Card>
              ))
            )}
          </TabsContent>

          {/* En Verificación */}
          <TabsContent value="verificacion" className="space-y-4">
            {enVerificacion.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hay solicitudes en verificación.</p>
              </Card>
            ) : (
              enVerificacion.map((solicitud) => (
              <Card key={solicitud.id} className="p-6 hover:shadow-md transition-shadow border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{solicitud.tipo}</h3>
                      <div className="flex items-center gap-3 text-sm mb-2">
                          <span className="text-muted-foreground">Cantidad: {solicitud.cantidad}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary">Usuario</Badge>
                          <span className="text-muted-foreground">{solicitud.userAddress.slice(0, 6)}...{solicitud.userAddress.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{solicitud.pagoCalculado}</p>
                    <p className="text-xs text-muted-foreground">Pago calculado</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                  <span>{solicitud.fecha}</span>
                </div>

                <Button size="sm" className="w-full" asChild>
                    <Link href={`/centro/verificar/${solicitud.deliveryId.toString()}`}>Continuar Verificación</Link>
                </Button>
              </Card>
              ))
            )}
          </TabsContent>

          {/* Completadas */}
          <TabsContent value="completadas" className="space-y-4">
            {completadas.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hay solicitudes completadas aún.</p>
              </Card>
            ) : (
              completadas.map((solicitud) => (
              <Card key={solicitud.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{solicitud.tipo}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{solicitud.pesoReal} procesados</p>
                      <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary">Usuario</Badge>
                          <span className="text-muted-foreground">{solicitud.userAddress.slice(0, 6)}...{solicitud.userAddress.slice(-4)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{solicitud.fecha}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{solicitud.pago}</p>
                    <Badge className="mt-2 bg-primary text-primary-foreground">Pagado</Badge>
                  </div>
                </div>
              </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Estadísticas del Mes */}
        <Card className="p-6 mt-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Estadísticas del Mes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Material Procesado</p>
              <p className="text-2xl font-bold text-foreground">1,245 kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recolecciones</p>
              <p className="text-2xl font-bold text-foreground">156</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pagos Procesados</p>
              <p className="text-2xl font-bold text-foreground">$45,280</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recolectores Activos</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
