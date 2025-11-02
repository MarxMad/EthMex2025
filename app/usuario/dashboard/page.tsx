"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUserDeliveries } from "@/lib/hooks/use-recycling-contract"
import { DeliveryStatus, PaymentToken } from "@/lib/contracts"
import { formatEther } from "viem"
import { ActivateCollectorRole } from "@/components/activate-collector-role"
import { RoleGuard } from "@/components/role-guard"
import {
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Recycle,
} from "lucide-react"

export default function UsuarioDashboard() {
  const { deliveries, isLoading } = useUserDeliveries()

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

  // Función para parsear metadata y obtener dirección, fecha, hora
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

  // Convertir entregas del contrato a formato para mostrar
  const solicitudes = deliveries.map(({ id, delivery }) => {
    const metadata = parseMetadata(delivery.metadata)
    const fecha = delivery.createdAt ? new Date(Number(delivery.createdAt) * 1000).toLocaleDateString('es-MX') : ""
    const materialName = materialNames[delivery.materialType.toLowerCase()] || delivery.materialType
    
    let estado = "pendiente"
    if (delivery.status === DeliveryStatus.Validated) {
      estado = "completada"
    } else if (delivery.status === DeliveryStatus.Pending) {
      estado = "pendiente"
    } else if (delivery.status === DeliveryStatus.Rejected) {
      estado = "rechazada"
    }

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
      fecha: fecha || metadata.fecha || "",
      estado,
      pago: pagoDisplay,
      direccion: metadata.direccion || "",
      deliveryId: id,
      delivery: delivery,
    }
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completada":
        return <Badge className="bg-primary text-primary-foreground">Completada</Badge>
      case "en-proceso":
        return <Badge variant="secondary">En Proceso</Badge>
      case "pendiente":
        return <Badge variant="outline">Pendiente</Badge>
      default:
        return null
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "completada":
        return <CheckCircle2 className="w-5 h-5 text-primary" />
      case "en-proceso":
        return <Truck className="w-5 h-5 text-accent" />
      case "pendiente":
        return <Clock className="w-5 h-5 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <RoleGuard allowedRoles={['usuario']}>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Opción para activar como recolector */}
        <ActivateCollectorRole />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
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
                <p className="text-2xl font-bold text-foreground">$1,450</p>
                <p className="text-xs text-muted-foreground">Ganado</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-xs text-muted-foreground">kg Reciclados</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Button */}
        <Button asChild size="lg" className="w-full mb-6">
          <Link href="/usuario/solicitar">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Solicitud de Recolección
          </Link>
        </Button>

        {/* Solicitudes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Mis Solicitudes</h2>

          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Cargando solicitudes...</p>
            </Card>
          ) : solicitudes.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tienes solicitudes aún. ¡Crea tu primera solicitud de recolección!</p>
            </Card>
          ) : (
            <>
              {solicitudes.map((solicitud) => (
                <Card key={solicitud.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getEstadoIcon(solicitud.estado)}
                      <div>
                        <h3 className="font-semibold text-foreground">{solicitud.tipo}</h3>
                        <p className="text-sm text-muted-foreground">{solicitud.cantidad}</p>
                      </div>
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{solicitud.direccion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{solicitud.fecha}</span>
                    </div>
                    {solicitud.recolector && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="w-4 h-4" />
                        <span>Recolector: {solicitud.recolector}</span>
                      </div>
                    )}
                    {solicitud.pago && (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{solicitud.pago}</span>
                      </div>
                    )}
                  </div>

                  {solicitud.estado === "en-proceso" && (
                    <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
                      <Link href={`/usuario/mapa/${solicitud.id}`}>Ver en Mapa</Link>
                    </Button>
                  )}
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
