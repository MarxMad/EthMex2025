'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WalletConnect } from "@/components/web3/wallet-connect"
import { Recycle, Truck, Building2, ArrowRight, Leaf, Users, DollarSign } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/LogoC.jpeg" 
              alt="CriKula Logo" 
              width={40} 
              height={40} 
              className="rounded-full object-cover"
            />
            <span className="text-xl font-bold text-foreground">CriKula</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#como-funciona"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cómo funciona
            </Link>
            <Link href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Beneficios
            </Link>
            <WalletConnect />
            <Button variant="outline" size="sm" asChild>
              <Link href="/centro/registro">
                <Building2 className="w-4 h-4 mr-2" />
                Ser Centro de Reciclaje
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            El Uber del Reciclaje
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Conectamos el reciclaje con un solo tap
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
            Empoderamos a recolectores, conectamos centros de reciclaje y facilitamos que empresas y usuarios reciclen
            de manera simple y rentable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base" asChild>
              <Link href="/auth/registro">
                Solicitar Recolección
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
              <Link href="/auth/registro">Ser Recolector</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
              <Link href="/centro/registro">
                <Building2 className="w-5 h-5 mr-2" />
                Ser Centro de Reciclaje
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">Tres formas de participar</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Únete a la economía circular del reciclaje desde cualquier rol
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Usuario/Empresa */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Usuario / Empresa</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Agenda recolecciones de material reciclable y recibe pago por tus materiales.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Solicita recolección en minutos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Recibe pago por tus materiales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Contribuye al medio ambiente</span>
                </li>
              </ul>
            </Card>

            {/* Recolector */}
            <Card className="p-6 hover:shadow-lg transition-shadow border-primary/50">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Recolector</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Recibe solicitudes como viajes de Uber y gana dinero recolectando materiales.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Acepta solicitudes en tiempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Gana por cada recolección</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Trabaja con flexibilidad</span>
                </li>
              </ul>
            </Card>

            {/* Centro de Reciclaje */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Centro de Reciclaje</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Recibe materiales, verifica calidad y gestiona pagos de forma transparente.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>Gestiona solicitudes entrantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>Verifica peso y calidad</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>Procesa pagos automáticos</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">Cómo funciona</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Un proceso simple y transparente de principio a fin
          </p>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Solicita la recolección</h3>
                <p className="text-muted-foreground leading-relaxed">
                  El usuario o empresa agenda una recolección especificando tipo y cantidad de material reciclable.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Recolector acepta</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Los recolectores cercanos reciben la solicitud como un viaje de Uber y pueden aceptarla.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Entrega al centro</h3>
                <p className="text-muted-foreground leading-relaxed">
                  El recolector lleva el material al centro de reciclaje donde se pesa y valora.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Pago liberado</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Una vez verificado el material, el centro libera el pago al usuario o recolector automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Impacto real, ganancias reales</h2>
            <p className="text-primary-foreground/80 mb-12 text-lg leading-relaxed">
              Más que una app, somos un movimiento que transforma residuos en oportunidades
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <DollarSign className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Economía Circular</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Todos ganan: usuarios, recolectores y centros de reciclaje
                </p>
              </div>
              <div>
                <Leaf className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Impacto Ambiental</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Cada recolección reduce residuos y protege el planeta
                </p>
              </div>
              <div>
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Empoderamiento</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Dignificamos el trabajo de los recolectores
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-card to-muted/30">
            <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">Comienza hoy mismo</h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Únete a la revolución del reciclaje y forma parte del cambio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base" asChild>
                <Link href="/auth/registro">Registrarse como Usuario</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
                <Link href="/auth/registro">Registrarse como Recolector</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/LogoC.jpeg" 
                alt="CriKula Logo" 
                width={20} 
                height={20} 
                className="rounded-full object-cover"
              />
              <span className="font-semibold text-foreground">CriKula</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 CriKula. Transformando residuos en oportunidades.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
