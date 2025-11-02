"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Recycle,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  User,
  LogOut,
} from "lucide-react"

export default function UsuarioDashboard() {
  const [solicitudes] = useState([
    {
      id: 1,
      tipo: "Plástico PET",
      cantidad: "15 kg",
      fecha: "2025-01-15",
      estado: "completada",
      recolector: "Carlos Méndez",
      pago: "$120",
      direccion: "Av. Reforma 123, CDMX",
    },
    {
      id: 2,
      tipo: "Cartón",
      cantidad: "30 kg",
      fecha: "2025-01-18",
      estado: "en-proceso",
      recolector: "María López",
      direccion: "Calle Juárez 456, CDMX",
    },
    {
      id: 3,
      tipo: "Aluminio",
      cantidad: "8 kg",
      fecha: "2025-01-20",
      estado: "pendiente",
      direccion: "Av. Insurgentes 789, CDMX",
    },
  ])

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
              <p className="text-xs text-muted-foreground">Usuario</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/usuario/pagos">
                <DollarSign className="w-4 h-4 mr-2" />
                Pagos
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
        </div>
      </div>
    </div>
  )
}
