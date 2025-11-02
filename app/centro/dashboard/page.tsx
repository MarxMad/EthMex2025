"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Recycle,
  Package,
  DollarSign,
  TrendingUp,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react"

export default function CentroDashboard() {
  const [solicitudesPendientes] = useState([
    {
      id: 1,
      tipo: "Plástico PET",
      cantidad: "15 kg",
      recolector: "Carlos Méndez",
      origen: "Usuario",
      nombreOrigen: "María González",
      fecha: "Hoy, 2:30 PM",
      pago: "$120",
    },
    {
      id: 2,
      tipo: "Cartón",
      cantidad: "30 kg",
      recolector: "Ana Rodríguez",
      origen: "Empresa",
      nombreOrigen: "Empresa XYZ",
      fecha: "Hoy, 3:15 PM",
      pago: "$240",
    },
  ])

  const [enVerificacion] = useState([
    {
      id: 3,
      tipo: "Aluminio",
      cantidad: "8 kg",
      pesoReal: "7.5 kg",
      recolector: "Luis Torres",
      origen: "Usuario",
      nombreOrigen: "Carlos Pérez",
      fecha: "Hoy, 1:00 PM",
      pagoCalculado: "$60",
    },
  ])

  const [completadas] = useState([
    {
      id: 4,
      tipo: "Vidrio",
      cantidad: "20 kg",
      pesoReal: "19 kg",
      recolector: "María López",
      origen: "Usuario",
      nombreOrigen: "Juan Martínez",
      fecha: "Ayer, 4:30 PM",
      pago: "$152",
      estado: "pagado",
    },
    {
      id: 5,
      tipo: "Papel",
      cantidad: "25 kg",
      pesoReal: "25 kg",
      recolector: "Pedro Sánchez",
      origen: "Empresa",
      nombreOrigen: "Oficinas ABC",
      fecha: "Ayer, 2:15 PM",
      pago: "$200",
      estado: "pagado",
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Recycle className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">CriKula</span>
              <p className="text-xs text-muted-foreground">Centro de Reciclaje</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <LogOut className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Botón para Registrar Nuevo Centro */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Gestionar Centros</h3>
              <p className="text-sm text-muted-foreground">
                Registra un nuevo centro de reciclaje autorizado en el contrato
              </p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/centro/registro">
                Registrar Nuevo Centro
              </Link>
            </Button>
          </div>
        </Card>

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
            {solicitudesPendientes.map((solicitud) => (
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
                        <Badge variant="secondary">{solicitud.origen}</Badge>
                        <span className="text-muted-foreground">{solicitud.nombreOrigen}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{solicitud.pago}</p>
                    <p className="text-xs text-muted-foreground">Pago estimado</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Truck className="w-4 h-4" />
                  <span>Recolector: {solicitud.recolector}</span>
                  <span className="mx-2">•</span>
                  <span>{solicitud.fecha}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                  <Button size="sm" className="bg-accent text-accent-foreground" asChild>
                    <Link href={`/centro/verificar/${solicitud.id}`}>Aceptar y Verificar</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* En Verificación */}
          <TabsContent value="verificacion" className="space-y-4">
            {enVerificacion.map((solicitud) => (
              <Card key={solicitud.id} className="p-6 hover:shadow-md transition-shadow border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{solicitud.tipo}</h3>
                      <div className="flex items-center gap-3 text-sm mb-2">
                        <span className="text-muted-foreground">Estimado: {solicitud.cantidad}</span>
                        <span className="text-primary font-medium">Real: {solicitud.pesoReal}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">{solicitud.origen}</Badge>
                        <span className="text-muted-foreground">{solicitud.nombreOrigen}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{solicitud.pagoCalculado}</p>
                    <p className="text-xs text-muted-foreground">Pago calculado</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Truck className="w-4 h-4" />
                  <span>Recolector: {solicitud.recolector}</span>
                  <span className="mx-2">•</span>
                  <span>{solicitud.fecha}</span>
                </div>

                <Button size="sm" className="w-full" asChild>
                  <Link href={`/centro/verificar/${solicitud.id}`}>Continuar Verificación</Link>
                </Button>
              </Card>
            ))}
          </TabsContent>

          {/* Completadas */}
          <TabsContent value="completadas" className="space-y-4">
            {completadas.map((solicitud) => (
              <Card key={solicitud.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{solicitud.tipo}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{solicitud.pesoReal} procesados</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">{solicitud.origen}</Badge>
                        <span className="text-muted-foreground">{solicitud.nombreOrigen}</span>
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
            ))}
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
