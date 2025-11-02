"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  const [solicitudes] = useState([
    {
      id: 1,
      tipo: "Plástico PET",
      cantidad: "15 kg",
      distancia: "1.2 km",
      tiempo: "5 min",
      pago: "$120",
      direccion: "Av. Reforma 123, CDMX",
      usuario: "María González",
      urgente: false,
    },
    {
      id: 2,
      tipo: "Cartón",
      cantidad: "30 kg",
      distancia: "2.8 km",
      tiempo: "12 min",
      pago: "$240",
      direccion: "Calle Juárez 456, CDMX",
      usuario: "Empresa XYZ",
      urgente: true,
    },
    {
      id: 3,
      tipo: "Aluminio",
      cantidad: "8 kg",
      distancia: "0.8 km",
      tiempo: "3 min",
      pago: "$96",
      direccion: "Av. Insurgentes 789, CDMX",
      usuario: "Carlos Pérez",
      urgente: false,
    },
  ])

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
              <Badge variant="secondary" className="animate-pulse">
                {solicitudes.length} nuevas
              </Badge>
            </div>

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
                      <Link href={`/recolector/solicitud/${solicitud.id}`}>Ver Detalles</Link>
                    </Button>
                    <Button size="sm" className="bg-primary">
                      Aceptar Recolección
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
