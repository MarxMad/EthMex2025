"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAccount } from "wagmi"
import { useCreateDelivery, useMaterialPrice, useIsRecyclingCenter } from "@/lib/hooks/use-recycling-contract"
import { PaymentToken } from "@/lib/contracts"
import { formatEther, parseEther } from "viem"
import { Recycle, ArrowLeft, ArrowRight, Package, Calendar, MapPin, ImageIcon, AlertCircle, Wallet, CheckCircle2 } from "lucide-react"
import { RecyclingCenterSelector } from "@/components/recycling-center-selector"

export default function SolicitarRecoleccionPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { createDelivery, isPending, isSuccess, error, hash } = useCreateDelivery()
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<string>("")
  const [paymentToken, setPaymentToken] = useState<PaymentToken>(PaymentToken.ETH)
  
  const [formData, setFormData] = useState({
    tipoMaterial: "plastico",
    cantidad: "",
    fecha: "",
    hora: "",
    direccion: "",
    notas: "",
  })

  // Obtener precio del material para el centro seleccionado
  // Nota: V2 usa precios globales. Cuando V3 esté desplegado, usará precios por centro
  const { price: materialPrice, isLoading: loadingPrice } = useMaterialPrice(
    formData.tipoMaterial || undefined,
    paymentToken,
    selectedCenter ? (selectedCenter as `0x${string}`) : undefined
  )
  const { isRecyclingCenter, isLoading: checkingCenter } = useIsRecyclingCenter(
    selectedCenter ? (selectedCenter as `0x${string}`) : undefined
  )

  // Calcular precio estimado: precio por kg * cantidad
  const estimatedPayment = materialPrice && formData.cantidad && parseFloat(formData.cantidad) > 0
    ? (materialPrice * BigInt(Math.floor(parseFloat(formData.cantidad))))
    : 0n

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      setShowConfirmation(true)
    }
  }, [isSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    // Validaciones
    if (!isConnected) {
      setErrorMessage("Debes conectar tu wallet primero")
      return
    }

    if (!selectedCenter) {
      setErrorMessage("Debes seleccionar un centro de reciclaje")
      return
    }

    // Esperar a que termine la verificación del centro
    if (checkingCenter) {
      setErrorMessage("Verificando centro de reciclaje...")
      return
    }

    if (!isRecyclingCenter) {
      setErrorMessage("El centro seleccionado no está autorizado en el contrato. Solo puedes crear entregas a centros autorizados.")
      return
    }

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      setErrorMessage("Debes ingresar una cantidad válida mayor a 0")
      return
    }

    // Advertencia si el precio no está configurado, pero permitir intentar la transacción
    // El contrato validará y rechazará con un mensaje claro si el precio no está configurado
    if (!materialPrice || materialPrice === 0n) {
      // Mostrar advertencia pero no bloquear
      console.warn("⚠️ Precio no configurado para este material. El contrato rechazará la transacción si el precio no está configurado.")
      // Continuar - el contrato validará
    }

    if (!formData.direccion || formData.direccion.trim() === "") {
      setErrorMessage("Debes ingresar la dirección de recolección")
      return
    }

    if (!formData.fecha || !formData.hora) {
      setErrorMessage("Debes seleccionar fecha y hora de recolección")
      return
    }

    try {
      setLoading(true)
      
      // Crear metadata con información adicional
      const metadata = JSON.stringify({
        direccion: formData.direccion,
        fecha: formData.fecha,
        hora: formData.hora,
        notas: formData.notas || "",
      })

      // Calcular el valor a enviar si es ETH
      const amount = BigInt(Math.floor(parseFloat(formData.cantidad)))
      const valueAmount = paymentToken === PaymentToken.ETH 
        ? formatEther(estimatedPayment)
        : undefined

      // Llamar a la función del contrato
      // Esto abrirá MetaMask para firmar la transacción
      await createDelivery(
        selectedCenter as `0x${string}`,
        formData.tipoMaterial,
        amount,
        paymentToken,
        metadata,
        valueAmount
      )
      
      // Si llegamos aquí, la transacción fue enviada
      // El useEffect manejará la redirección cuando isSuccess sea true
      
    } catch (err: any) {
      console.error("Error creating delivery:", err)
      
      // Manejar diferentes tipos de errores
      if (err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
        setErrorMessage("Transacción cancelada. No se creó la solicitud.")
      } else if (err?.message?.includes("insufficient funds")) {
        setErrorMessage("Fondos insuficientes. Verifica que tengas suficiente saldo para cubrir el pago estimado.")
      } else if (err?.message?.includes("Invalid recycling center")) {
        setErrorMessage("El centro seleccionado no está autorizado en el contrato.")
      } else if (err?.message?.includes("Price not set")) {
        setErrorMessage("El precio para este material y método de pago no está configurado.")
      } else {
        setErrorMessage(err?.message || "Error al crear la entrega. Verifica tu conexión y saldo, e intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/usuario/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Recycle className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Nueva Solicitud</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-6">
          {/* Wallet Connection Alert */}
          {mounted && !isConnected && (
            <Alert className="mb-6">
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Debes conectar tu wallet para crear una solicitud de recolección.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Messages */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Success Message - Transacción Enviada */}
          {hash && !isSuccess && (
            <Alert className="mb-6 border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Transacción enviada</p>
                  <p className="text-sm text-muted-foreground">
                    Esperando confirmación en la blockchain...
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Pantalla de Confirmación */}
          {showConfirmation && isSuccess ? (
            <div className="space-y-6">
            <Card className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                ¡Solicitud de Recolección Creada!
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Tu solicitud de recolección ha sido registrada exitosamente en el contrato inteligente. 
                El centro de reciclaje recibirá una notificación y podrás ver el estado en tu dashboard.
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm text-foreground mb-2">
                    <strong>Material:</strong> {formData.tipoMaterial}
                  </p>
                  <p className="text-sm text-foreground mb-2">
                    <strong>Cantidad:</strong> {formData.cantidad} kg
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Centro:</strong> {selectedCenter.slice(0, 8)}...{selectedCenter.slice(-6)}
                  </p>
                </div>
                
                {hash && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm font-semibold text-foreground mb-2">Transacción Confirmada</p>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-xs text-muted-foreground">Hash:</span>
                        <code className="text-xs font-mono bg-background px-2 py-1 rounded border break-all">
                          {hash}
                        </code>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto"
                        asChild
                      >
                        <a 
                          href={`https://sepolia.arbiscan.io/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          Ver en Arbiscan
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/usuario/dashboard")} className="flex-1">
                  Ver Mis Solicitudes
                </Button>
                <Button onClick={() => {
                  setShowConfirmation(false)
                  setFormData({
                    tipoMaterial: "plastico",
                    cantidad: "",
                    fecha: "",
                    hora: "",
                    direccion: "",
                    notas: "",
                  })
                  setSelectedCenter("")
                  router.push("/usuario/solicitar")
                }} className="flex-1">
                  Nueva Solicitud
                </Button>
              </div>
            </Card>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Centro de Reciclaje */}
            <RecyclingCenterSelector
              value={selectedCenter}
              onValueChange={setSelectedCenter}
              required
            />

            {/* Tipo de Material */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Tipo de Material
              </Label>
              <RadioGroup
                value={formData.tipoMaterial}
                onValueChange={(value) => setFormData({ ...formData, tipoMaterial: value })}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="plastico" id="plastico" />
                    <Label htmlFor="plastico" className="cursor-pointer flex-1">
                      Plástico PET
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="carton" id="carton" />
                    <Label htmlFor="carton" className="cursor-pointer flex-1">
                      Cartón
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="aluminio" id="aluminio" />
                    <Label htmlFor="aluminio" className="cursor-pointer flex-1">
                      Aluminio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="vidrio" id="vidrio" />
                    <Label htmlFor="vidrio" className="cursor-pointer flex-1">
                      Vidrio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="papel" id="papel" />
                    <Label htmlFor="papel" className="cursor-pointer flex-1">
                      Papel
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="electronico" id="electronico" />
                    <Label htmlFor="electronico" className="cursor-pointer flex-1">
                      Electrónico
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Cantidad Estimada */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad Estimada (kg)</Label>
              <Input
                id="cantidad"
                type="number"
                placeholder="15"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
              />
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="direccion" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Dirección de Recolección
              </Label>
              <Input
                id="direccion"
                placeholder="Av. Reforma 123, Col. Centro, CDMX"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                required
              />
            </div>

            {/* Foto del Material */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Foto del Material (Opcional)
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Toca para subir una foto</p>
              </div>
            </div>

            {/* Notas Adicionales */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas Adicionales (Opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Ej: Material en bolsas, acceso por puerta trasera..."
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={3}
              />
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <RadioGroup
                value={paymentToken.toString()}
                onValueChange={(value) => setPaymentToken(Number.parseInt(value) as PaymentToken)}
              >
                <div className="flex gap-3">
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value={PaymentToken.ETH.toString()} id="eth" />
                    <Label htmlFor="eth" className="cursor-pointer flex-1">
                      ETH
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer flex-1 opacity-50">
                    <RadioGroupItem value={PaymentToken.USDC.toString()} id="usdc" disabled />
                    <Label htmlFor="usdc" className="cursor-pointer flex-1 text-muted-foreground">
                      USDC (Próximamente)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer flex-1 opacity-50">
                    <RadioGroupItem value={PaymentToken.MXNB.toString()} id="mxnb" disabled />
                    <Label htmlFor="mxnb" className="cursor-pointer flex-1 text-muted-foreground">
                      MXNB (Próximamente)
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Precio Estimado */}
            <Card className={`p-4 border ${!materialPrice || materialPrice === 0n ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pago Estimado</p>
                  {loadingPrice ? (
                    <p className="text-2xl font-bold text-primary">Calculando...</p>
                  ) : estimatedPayment > 0n ? (
                    <p className="text-2xl font-bold text-primary">
                      {paymentToken === PaymentToken.ETH 
                        ? `${formatEther(estimatedPayment)} ETH`
                        : `${formatEther(estimatedPayment)} tokens`}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-muted-foreground">--</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Precio por kg</p>
                  {materialPrice && materialPrice > 0n ? (
                    <p className="text-sm font-medium text-foreground">
                      {paymentToken === PaymentToken.ETH 
                        ? `${formatEther(materialPrice)} ETH/kg`
                        : `${formatEther(materialPrice)} tokens/kg`}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">No configurado</p>
                  )}
                </div>
              </div>
              {(!materialPrice || materialPrice === 0n) && (
                <Alert className="mt-2 border-yellow-500/20 bg-yellow-500/5">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-300">
                    El precio para este material aún no está configurado en el contrato. Puedes intentar crear la entrega, pero el contrato la rechazará si el precio no está configurado. Contacta al administrador para configurar los precios.
                  </AlertDescription>
                </Alert>
              )}
            </Card>

            {/* Debug info - solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                <p>Debug: loading={loading.toString()}, isPending={isPending.toString()}, isConnected={isConnected?.toString()}</p>
                <p>selectedCenter={selectedCenter ? 'Sí' : 'No'}, checkingCenter={checkingCenter.toString()}, isRecyclingCenter={isRecyclingCenter?.toString()}</p>
                <p>isSuccess={isSuccess.toString()}, cantidad={formData.cantidad}, fecha={formData.fecha}, hora={formData.hora}, direccion={formData.direccion ? 'Sí' : 'No'}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full" 
              disabled={
                loading || 
                isPending || 
                !isConnected || 
                !selectedCenter || 
                checkingCenter ||
                (selectedCenter && !checkingCenter && !isRecyclingCenter) || // Solo bloquear si ya terminó la verificación y NO es centro autorizado
                isSuccess ||
                !formData.cantidad || 
                parseFloat(formData.cantidad || "0") <= 0 ||
                !formData.fecha ||
                !formData.hora ||
                !formData.direccion ||
                formData.direccion.trim().length === 0
              }
            >
              {loading || isPending 
                ? "Firmando transacción..." 
                : isSuccess 
                ? "¡Solicitud creada!" 
                : "Solicitar Recolección"}
            </Button>
            
            {/* Información adicional sobre el proceso */}
            {isPending && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Por favor, confirma la transacción en MetaMask. Este proceso puede tardar unos segundos.
              </p>
            )}
          </form>
          )}
        </Card>
      </div>
    </div>
  )
}
