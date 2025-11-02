"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { usePendingDeliveries } from "@/lib/hooks/use-recycling-contract"
import { useAcceptDelivery, hasCollector } from "@/lib/hooks/use-collector-acceptance"
import { useAccount } from "wagmi"
import { PaymentToken } from "@/lib/contracts"
import { formatEther } from "viem"
import {
  Recycle,
  MapPin,
  Clock,
  Package,
  DollarSign,
  User,
  LogOut,
  Navigation,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

export default function RecolectorDashboard() {
  const [disponible, setDisponible] = useState(true)
  const { address } = useAccount()
  const { deliveries, isLoading } = usePendingDeliveries()
  const { acceptDelivery } = useAcceptDelivery()
  const [acceptedDeliveries, setAcceptedDeliveries] = useState<Set<string>>(new Set())

  // Cargar entregas ya aceptadas desde localStorage
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`collector_deliveries_${address.toLowerCase()}`)
      if (stored) {
        try {
          const deliveries: string[] = JSON.parse(stored)
          setAcceptedDeliveries(new Set(deliveries))
        } catch {
          // Ignorar errores de parsing
        }
      }
    }
  }, [address])

  // Filtrar solo entregas que NO tienen recolector asignado (no aceptadas)
  // Solo filtrar en el cliente después del mount para evitar problemas de hidratación
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const entregasDisponibles = mounted 
    ? deliveries.filter(({ id }) => !hasCollector(id))
    : deliveries // Durante SSR, mostrar todas temporalmente

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

  // Función para manejar la aceptación de una entrega
  const handleAcceptDelivery = (deliveryId: bigint) => {
    try {
      acceptDelivery(deliveryId)
      setAcceptedDeliveries(prev => new Set([...prev, deliveryId.toString()]))
      // Opcional: mostrar notificación de éxito
    } catch (err: any) {
      console.error('Error aceptando entrega:', err)
      alert('Error al aceptar la entrega. Por favor intenta nuevamente.')
    }
  }

  // Convertir entregas del contrato a formato para mostrar (solo las disponibles)
  const solicitudes = entregasDisponibles.map(({ id, delivery }) => {
    const metadata = parseMetadata(delivery.metadata)
    const materialName = materialNames[delivery.materialType.toLowerCase()] || delivery.materialType
    
    const pagoAmount = delivery.paymentToken === PaymentToken.ETH
      ? formatEther(delivery.paymentAmount)
      : delivery.paymentAmount.toString()

    const pagoDisplay = delivery.paymentToken === PaymentToken.ETH
      ? `${pagoAmount} ETH`
      : delivery.paymentToken === PaymentToken.USDC
      ? `${Number(pagoAmount) / 1e6} USDC`
      : `${formatEther(delivery.paymentAmount)} MXNB`

    // Formatear dirección del usuario (primeros 6 y últimos 4 caracteres)
    const userAddress = `${delivery.user.slice(0, 6)}...${delivery.user.slice(-4)}`

    return {
      id: Number(id),
      tipo: materialName,
      cantidad: `${delivery.amount.toString()} kg`,
      pago: pagoDisplay,
      direccion: metadata.direccion || "Dirección no especificada",
      usuario: userAddress,
      urgente: false, // Podrías calcular esto basado en fecha/hora
      deliveryId: id,
      delivery: delivery,
    }
  })

  const [historial] = useState([
    {
      id: 1,
      tipo: "Plástico PET",
      cantidad: "20 kg",
      pago: "$160",
      fecha: "Hoy, 10:30 AM",
      estado: "completada",
    },
    {
      id: 2,
      tipo: "Vidrio",
      cantidad: "12 kg",
      pago: "$84",
      fecha: "Ayer, 3:45 PM",
      estado: "completada",
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Recycle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">CriKula</span>
              <p className="text-xs text-muted-foreground">Recolector</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/recolector/pagos">
                <DollarSign className="w-4 h-4 mr-2" />
                Ganancias
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/perfil">
                <User className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <LogOut className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Estado de Disponibilidad */}
        <Card className={`p-4 mb-6 ${disponible ? "bg-primary/5 border-primary/20" : "bg-muted/50"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${disponible ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
              />
              <div>
                <p className="font-semibold text-foreground">
                  {disponible ? "Disponible para recolecciones" : "No disponible"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {disponible ? "Recibirás solicitudes en tiempo real" : "No recibirás nuevas solicitudes"}
                </p>
              </div>
            </div>
            <Switch checked={disponible} onCheckedChange={setDisponible} />
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-xs text-muted-foreground">Recolecciones</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">$2,840</p>
                <p className="text-xs text-muted-foreground">Ganado</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.9</p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Solicitudes Disponibles */}
        {disponible && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Solicitudes Disponibles</h2>
              {solicitudes.length > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                  {solicitudes.length} {solicitudes.length === 1 ? 'nueva' : 'nuevas'}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Estas son las solicitudes de usuarios que aún no tienen recolector asignado. Al aceptar una solicitud, se asignará a ti y el centro podrá verla.
            </p>

            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <Card key={solicitud.id} className="p-4 hover:shadow-lg transition-shadow border-primary/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{solicitud.tipo}</h3>
                          {solicitud.urgente && (
                            <Badge variant="destructive" className="text-xs">
                              Urgente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{solicitud.cantidad}</p>
                        <p className="text-xs text-muted-foreground mt-1">{solicitud.usuario}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{solicitud.pago}</p>
                      <p className="text-xs text-muted-foreground">Pago estimado</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{solicitud.direccion}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Navigation className="w-4 h-4" />
                        <span>{solicitud.distancia}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{solicitud.tiempo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/recolector/entrega/${solicitud.deliveryId.toString()}`}>Ver Detalles</Link>
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-primary"
                      onClick={() => handleAcceptDelivery(solicitud.deliveryId)}
                      disabled={acceptedDeliveries.has(solicitud.deliveryId.toString())}
                    >
                      {acceptedDeliveries.has(solicitud.deliveryId.toString()) 
                        ? "Ya Aceptada" 
                        : "Aceptar Recolección"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Historial Reciente */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Historial Reciente</h2>
          <div className="space-y-3">
            {historial.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{item.tipo}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cantidad} • {item.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{item.pago}</p>
                    <Badge variant="secondary" className="text-xs">
                      Pagado
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
