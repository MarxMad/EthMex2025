'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { RoleBasedRedirect } from "@/components/layout/role-based-redirect"
import { Truck, Building2, ArrowRight, Leaf, Users, DollarSign, Sparkles, TrendingUp, CheckCircle2, Zap, Shield, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <RoleBasedRedirect />
      <Navbar />

      {/* Hero Section - Mejorado */}
      <section className="relative overflow-hidden bg-background">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo Grande con animación */}
            <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Image 
                  src="/LogoC.jpeg" 
                  alt="CriKula Logo" 
                  width={300} 
                  height={300} 
                  className="rounded-full object-cover w-[200px] h-[200px] md:w-[300px] md:h-[300px] shadow-2xl border-4 border-primary/30 relative z-10 group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>
            
            {/* Badge animado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 border border-primary/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
              El Uber del Reciclaje
            </div>

            {/* Título principal */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <span className="text-primary">
                Conectamos el reciclaje
              </span>
              <br />
              <span className="text-foreground">con un solo tap</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 text-pretty leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              Empoderamos a recolectores, conectamos centros de reciclaje y facilitamos que empresas y usuarios reciclen
              de manera simple y rentable usando blockchain.
            </p>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">1000+</div>
                <div className="text-sm text-muted-foreground">Recolecciones</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Usuarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Centros</div>
              </div>
            </div>

            {/* CTAs mejorados */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000">
              <Button size="lg" className="text-base group" asChild>
                <Link href="/auth/registro">
                  Solicitar Recolección
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent backdrop-blur-sm border-2" asChild>
                <Link href="/auth/registro">Ser Recolector</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent backdrop-blur-sm border-2" asChild>
                <Link href="/centro/registro">
                  <Building2 className="w-5 h-5 mr-2" />
                  Ser Centro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section - Mejorado */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">¿Cómo participar?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tres formas de participar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Únete a la economía circular del reciclaje desde cualquier rol y transforma residuos en oportunidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Usuario/Empresa */}
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 group">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-3">Usuario / Empresa</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Agenda recolecciones de material reciclable y recibe pago instantáneo por tus materiales.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Solicita recolección en minutos desde tu móvil</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Recibe pago automático por blockchain</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Contribuye al medio ambiente y gana dinero</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/usuario/dashboard">Empezar como Usuario</Link>
              </Button>
            </Card>

            {/* Recolector - Destacado */}
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-primary/50 bg-primary/5 group relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground">Más Popular</Badge>
              </div>
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Truck className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-3">Recolector</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Recibe solicitudes como viajes de Uber y gana dinero recolectando materiales en tu propia ruta.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Acepta solicitudes en tiempo real, cuando quieras</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Gana por cada recolección completada</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Trabaja con total flexibilidad horaria</span>
                </li>
              </ul>
              <Button className="w-full mt-6" asChild>
                <Link href="/recolector/dashboard">Empezar como Recolector</Link>
              </Button>
            </Card>

            {/* Centro de Reciclaje */}
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent/20 group">
              <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-3">Centro de Reciclaje</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Recibe materiales, verifica calidad y gestiona pagos de forma transparente y automatizada.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Gestiona solicitudes entrantes automáticamente</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Verifica peso y calidad con precisión</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Procesa pagos automáticos con blockchain</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/centro/registro">Registrar Centro</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - Nueva */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">¿Por qué CriKula?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tecnología que transforma
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Blockchain, transparencia y automatización para revolucionar el reciclaje
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Seguro y Transparente</h3>
              <p className="text-sm text-muted-foreground">
                Pagos en escrow con blockchain, todas las transacciones son verificables y seguras
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instantáneo</h3>
              <p className="text-sm text-muted-foreground">
                Pagos automáticos una vez verificado el material, sin esperas ni trámites
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Disponible</h3>
              <p className="text-sm text-muted-foreground">
                Solicita recolecciones en cualquier momento, el sistema nunca descansa
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works - Mejorado */}
      <section id="como-funciona" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Proceso Simple</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Cómo funciona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un proceso simple y transparente de principio a fin en solo 4 pasos
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-6 items-start p-6 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Solicita la recolección</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    El usuario o empresa agenda una recolección especificando tipo y cantidad de material reciclable desde la app.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start p-6 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Recolector acepta</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Los recolectores cercanos reciben la solicitud como un viaje de Uber y pueden aceptarla en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start p-6 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Entrega al centro</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    El recolector lleva el material al centro de reciclaje donde se pesa, valora y verifica la calidad.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start p-6 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Pago liberado</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Una vez verificado el material, el centro libera el pago al usuario o recolector automáticamente mediante smart contract.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Mejorado */}
      <section id="beneficios" className="relative py-20 md:py-28 bg-primary overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">Impacto Real</Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Impacto real, ganancias reales
            </h2>
            <p className="text-white/90 mb-16 text-xl leading-relaxed max-w-3xl mx-auto">
              Más que una app, somos un movimiento que transforma residuos en oportunidades para todos
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <DollarSign className="w-14 h-14 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-3">Economía Circular</h3>
                <p className="text-white/90 leading-relaxed">
                  Todos ganan: usuarios reciben dinero por reciclar, recolectores obtienen ingresos y centros optimizan operaciones
                </p>
              </Card>
              
              <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <Leaf className="w-14 h-14 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-3">Impacto Ambiental</h3>
                <p className="text-white/90 leading-relaxed">
                  Cada recolección reduce residuos, protege el planeta y crea un futuro más sostenible para las próximas generaciones
                </p>
              </Card>
              
              <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <Users className="w-14 h-14 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-3">Empoderamiento</h3>
                <p className="text-white/90 leading-relaxed">
                  Dignificamos el trabajo de los recolectores, dándoles herramientas modernas y oportunidades económicas justas
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mejorado */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-12 md:p-16 text-center bg-card border-2 border-primary/20 shadow-2xl relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
                Comienza hoy mismo
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                Únete a la revolución del reciclaje y forma parte del cambio. Miles ya están transformando residuos en oportunidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base group shadow-lg" asChild>
                  <Link href="/auth/registro">
                    Registrarse como Usuario
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base border-2 backdrop-blur-sm" asChild>
                  <Link href="/auth/registro">Registrarse como Recolector</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer - Mejorado */}
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image 
                src="/LogoC.jpeg" 
                alt="CriKula Logo" 
                width={40} 
                height={40} 
                className="rounded-full object-cover"
              />
              <div>
                <span className="font-bold text-foreground text-lg">CriKula</span>
                <p className="text-xs text-muted-foreground">El Uber del Reciclaje</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cómo funciona
              </Link>
              <Link href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Beneficios
              </Link>
              <Link href="/centro/registro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Ser Centro
              </Link>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2025 CriKula. Transformando residuos en oportunidades.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
