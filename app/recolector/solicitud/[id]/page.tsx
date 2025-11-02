"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { ArrowLeft, MapPin, Package, User, Clock, Navigation } from "lucide-react"

export default function SolicitudDetallePage() {
  const router = useRouter()
  const [aceptando, setAceptando] = useState(false)

  const solicitud = {
    id: 1,
    tipo: "Plástico PET",
    cantidad: "15 kg",
    distancia: "1.2 km",
    tiempo: "5 min",
    pago: "$120",
    direccion: "Av. Reforma 123, Col. Centro, CDMX",
    usuario: "María González",
    telefono: "+52 55 1234 5678",
    notas: "Material en bolsas verdes, acceso por puerta principal",
    fecha: "Hoy, 2:30 PM",
    urgente: false,
  }

  const handleAceptar = () => {
    setAceptando(true)
    setTimeout(() => {
      router.push("/recolector/en-ruta")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recolector/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Recycle className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Detalle de Solicitud</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Pago Destacado */}
        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Ganarás</p>
            <p className="text-5xl font-bold text-primary mb-2">{solicitud.pago}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                <span>{solicitud.distancia}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{solicitud.tiempo}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Información del Material */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Material a Recolectar
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium text-foreground">{solicitud.tipo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cantidad estimada</span>
              <span className="font-medium text-foreground">{solicitud.cantidad}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha de recolección</span>
              <span className="font-medium text-foreground">{solicitud.fecha}</span>
            </div>
          </div>
        </Card>

        {/* Información del Usuario */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Información del Usuario
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium text-foreground">{solicitud.usuario}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Teléfono</span>
              <Button variant="link" className="h-auto p-0 font-medium" asChild>
                <a href={`tel:${solicitud.telefono}`}>{solicitud.telefono}</a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Ubicación */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Ubicación de Recolección
          </h3>
          <p className="text-foreground mb-4">{solicitud.direccion}</p>
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Mapa de ubicación</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 bg-transparent">
            Abrir en Google Maps
          </Button>
        </Card>

        {/* Notas Adicionales */}
        {solicitud.notas && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">Notas del Usuario</h3>
            <p className="text-muted-foreground leading-relaxed">{solicitud.notas}</p>
          </Card>
        )}

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" size="lg" asChild>
            <Link href="/recolector/dashboard">Rechazar</Link>
          </Button>
          <Button size="lg" onClick={handleAceptar} disabled={aceptando}>
            {aceptando ? "Aceptando..." : "Aceptar Recolección"}
          </Button>
        </div>
      </div>
    </div>
  )
}
