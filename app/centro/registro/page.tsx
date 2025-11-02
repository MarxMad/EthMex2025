"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAccount } from "wagmi"
import { useIsOwner, useAddRecyclingCenter, useSetCenterMaterialPrice } from "@/lib/hooks/use-recycling-contract"
import { PaymentToken } from "@/lib/contracts"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  Recycle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle2,
  Upload,
} from "lucide-react"

export default function RegistroCentroPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isOwner, isLoading: checkingOwner } = useIsOwner()
  const { addRecyclingCenter, hash, isPending, isSuccess, error } = useAddRecyclingCenter()
  const { setCenterMaterialPrice, hash: priceHash, isPending: isSettingPrice, isSuccess: priceSetSuccess } = useSetCenterMaterialPrice()
  const [paso, setPaso] = useState(1)
  const [configuringPrices, setConfiguringPrices] = useState(false)
  const [priceConfigStatus, setPriceConfigStatus] = useState<Record<string, boolean>>({})
  const [priceInputs, setPriceInputs] = useState<Record<string, { eth: string, usdc: string, mxnb: string }>>({})
  // Rastrear precios configurados exitosamente: "material-token" => true
  const [configuredPrices, setConfiguredPrices] = useState<Record<string, boolean>>({})
  const [lastConfiguredPrice, setLastConfiguredPrice] = useState<{ material: string, token: string } | null>(null)
  const [centerWallet, setCenterWallet] = useState("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [formData, setFormData] = useState({
    nombreCentro: "",
    razonSocial: "",
    rfc: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    descripcion: "",
    materialesAceptados: [] as string[],
    capacidadDiaria: "",
    horarioApertura: "",
    horarioCierre: "",
    precioPlastico: "",
    precioCarton: "",
    precioVidrio: "",
    precioAluminio: "",
    precioElectronicos: "",
  })

  const materialesDisponibles = [
    "Plástico PET",
    "Cartón",
    "Vidrio",
    "Aluminio",
    "Papel",
    "Electrónicos",
    "Metales",
    "Textiles",
  ]

  const handleMaterialToggle = (material: string) => {
    setFormData((prev) => ({
      ...prev,
      materialesAceptados: prev.materialesAceptados.includes(material)
        ? prev.materialesAceptados.filter((m) => m !== material)
        : [...prev.materialesAceptados, material],
    }))
  }

  // Mapeo de materiales del formulario a nombres del contrato
  const materialMapping: Record<string, string> = {
    "Plástico PET": "plastico",
    "Cartón": "carton",
    "Vidrio": "vidrio",
    "Aluminio": "aluminio",
    "Papel": "papel",
    "Electrónicos": "electronicos",
    "Metales": "metales",
    "Textiles": "textiles",
  }

  // Efecto para manejar éxito de la transacción de agregar centro
  useEffect(() => {
    if (isSuccess && !configuringPrices) {
      // Ir al paso de configuración de precios
    setPaso(4)
      setConfiguringPrices(true)
    }
  }, [isSuccess, configuringPrices])

  // Función para configurar precio de un material
  const handleSetPrice = async (material: string, token: PaymentToken, price: string) => {
    if (!price || parseFloat(price) <= 0) {
      setErrorMessage(`Debes ingresar un precio válido para ${material}`)
      return
    }

    try {
      setErrorMessage("")
      const materialContractName = materialMapping[material] || material.toLowerCase()
      const tokenName = token === PaymentToken.ETH ? "ETH" : token === PaymentToken.USDC ? "USDC" : "MXNB"
      
      // Guardar qué precio estamos configurando para mostrar confirmación después
      setLastConfiguredPrice({ material, token: tokenName })
      
      await setCenterMaterialPrice(
        centerWallet as `0x${string}`,
        materialContractName,
        token,
        price
      )
      
      // Esperar a que la transacción sea exitosa
      // El estado priceSetSuccess se actualizará automáticamente
    } catch (err: any) {
      console.error("Error setting price:", err)
      setLastConfiguredPrice(null)
      if (err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
        setErrorMessage("Transacción cancelada. No se configuró el precio.")
      } else {
        setErrorMessage(err?.message || "Error al configurar el precio.")
      }
    }
  }

  // Efecto para actualizar estado cuando un precio se configura exitosamente
  useEffect(() => {
    if (priceSetSuccess && priceHash && lastConfiguredPrice) {
      // Marcar como configurado usando "material-token" como clave
      const key = `${lastConfiguredPrice.material}-${lastConfiguredPrice.token}`
      setConfiguredPrices(prev => ({ ...prev, [key]: true }))
      
      // Mostrar mensaje de éxito y limpiar después de 3 segundos
      setTimeout(() => {
        setLastConfiguredPrice(null)
      }, 3000)
    }
  }, [priceSetSuccess, priceHash, lastConfiguredPrice])

  const handleSubmit = async () => {
    if (!isConnected) {
      setErrorMessage("Debes conectar tu wallet primero")
      return
    }

    if (checkingOwner) {
      setErrorMessage("Verificando permisos de owner... Por favor espera.")
      return
    }

    // VALIDAR QUE SEA OWNER ANTES de intentar la transacción
    // Esto evita que MetaMask intente estimar gas para una transacción que fallará
    if (!isOwner) {
      setErrorMessage("Solo el owner del contrato puede agregar centros autorizados. Tu wallet conectada no es el owner del contrato. Si eres el owner, asegúrate de estar usando la wallet correcta.")
      return
    }

    if (!centerWallet || !centerWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      setErrorMessage("Debes ingresar una dirección de wallet válida (0x...)")
      return
    }

    try {
      setErrorMessage("")
      // Llamar a la función del contrato - esto abrirá MetaMask para firmar
      await addRecyclingCenter(centerWallet as `0x${string}`)
      // El useEffect manejará el cambio de paso cuando isSuccess sea true
    } catch (err: any) {
      console.error("Error adding recycling center:", err)
      
      // Manejar diferentes tipos de errores
      if (err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
        setErrorMessage("Transacción cancelada. No se agregó el centro.")
      } else if (err?.message?.includes("Only owner") || err?.message?.includes("OwnableUnauthorizedAccount")) {
        setErrorMessage("Error: Solo el owner del contrato puede agregar centros. Verifica que estés usando la wallet correcta.")
      } else if (err?.message?.includes("Center already authorized") || err?.message?.includes("already authorized")) {
        setErrorMessage("Este centro ya está autorizado en el contrato.")
      } else {
        setErrorMessage(err?.message || "Error al agregar el centro. Verifica que la dirección sea válida y que tengas permisos.")
      }
    }
  }

  // No bloquear completamente la página, solo mostrar advertencia si está verificado y no es owner

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Recycle className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Registrar Centro de Reciclaje</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Advertencia si no es owner pero está conectado y verificado */}
        {isConnected && !checkingOwner && !isOwner && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Solo el owner del contrato puede agregar centros autorizados.</p>
                <p className="text-sm">
                  Tu wallet conectada: <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </p>
                <p className="text-sm">
                  Si eres el owner del contrato, asegúrate de estar usando la wallet correcta. 
                  Si no eres el owner, contacta al administrador para agregar tu centro.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Indicador de progreso */}
        {paso < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      paso >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {paso > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                  </div>
                  {num < 3 && <div className={`flex-1 h-1 mx-2 ${paso > num ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Información Básica</span>
              <span>Materiales y Precios</span>
              <span>Documentación</span>
            </div>
          </div>
        )}

        {/* Paso 1: Información Básica */}
        {paso === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Información del Centro</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombreCentro">Nombre del Centro *</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nombreCentro"
                    placeholder="Ej: CriKula Centro Norte"
                    value={formData.nombreCentro}
                    onChange={(e) => setFormData({ ...formData, nombreCentro: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="razonSocial">Razón Social *</Label>
                <Input
                  id="razonSocial"
                  placeholder="Nombre legal de la empresa"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rfc">RFC *</Label>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="rfc"
                    placeholder="ABC123456XYZ"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@centro.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="telefono"
                      placeholder="+52 55 1234 5678"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección Completa *</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="direccion"
                    placeholder="Calle, número, colonia"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Input
                    id="ciudad"
                    placeholder="CDMX"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    placeholder="Ciudad de México"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="codigoPostal">Código Postal *</Label>
                  <Input
                    id="codigoPostal"
                    placeholder="01000"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción del Centro</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe tu centro de reciclaje, servicios adicionales, etc."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="mt-1 min-h-24"
                />
              </div>
            </div>

            <Button onClick={() => setPaso(2)} className="w-full mt-6">
              Continuar
            </Button>
          </Card>
        )}

        {/* Paso 2: Materiales y Precios */}
        {paso === 2 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Materiales y Precios</h2>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Materiales que Acepta *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {materialesDisponibles.map((material) => (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={material}
                        checked={formData.materialesAceptados.includes(material)}
                        onCheckedChange={() => handleMaterialToggle(material)}
                      />
                      <label
                        htmlFor={material}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacidadDiaria">Capacidad Diaria (kg) *</Label>
                  <Input
                    id="capacidadDiaria"
                    type="number"
                    placeholder="1000"
                    value={formData.capacidadDiaria}
                    onChange={(e) => setFormData({ ...formData, capacidadDiaria: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="horarioApertura">Apertura *</Label>
                    <Input
                      id="horarioApertura"
                      type="time"
                      value={formData.horarioApertura}
                      onChange={(e) => setFormData({ ...formData, horarioApertura: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="horarioCierre">Cierre *</Label>
                    <Input
                      id="horarioCierre"
                      type="time"
                      value={formData.horarioCierre}
                      onChange={(e) => setFormData({ ...formData, horarioCierre: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Precios por Kilogramo (MXN) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precioPlastico" className="text-sm text-muted-foreground">
                      Plástico PET
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="precioPlastico"
                        type="number"
                        step="0.01"
                        placeholder="8.00"
                        value={formData.precioPlastico}
                        onChange={(e) => setFormData({ ...formData, precioPlastico: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="precioCarton" className="text-sm text-muted-foreground">
                      Cartón
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="precioCarton"
                        type="number"
                        step="0.01"
                        placeholder="3.50"
                        value={formData.precioCarton}
                        onChange={(e) => setFormData({ ...formData, precioCarton: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="precioVidrio" className="text-sm text-muted-foreground">
                      Vidrio
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="precioVidrio"
                        type="number"
                        step="0.01"
                        placeholder="2.00"
                        value={formData.precioVidrio}
                        onChange={(e) => setFormData({ ...formData, precioVidrio: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="precioAluminio" className="text-sm text-muted-foreground">
                      Aluminio
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="precioAluminio"
                        type="number"
                        step="0.01"
                        placeholder="15.00"
                        value={formData.precioAluminio}
                        onChange={(e) => setFormData({ ...formData, precioAluminio: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="precioElectronicos" className="text-sm text-muted-foreground">
                      Electrónicos
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="precioElectronicos"
                        type="number"
                        step="0.01"
                        placeholder="20.00"
                        value={formData.precioElectronicos}
                        onChange={(e) => setFormData({ ...formData, precioElectronicos: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setPaso(1)} className="flex-1">
                Atrás
              </Button>
              <Button onClick={() => setPaso(3)} className="flex-1">
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Paso 3: Documentación y Wallet Address */}
        {paso === 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Documentación y Wallet Address</h2>
            
            {/* Wallet Address del Centro - Requerido para agregar al contrato */}
            <div className="mb-6">
              <Label htmlFor="centerWallet" className="text-base font-semibold">
                Dirección de Wallet del Centro * (Para autorización en blockchain)
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Esta es la dirección de wallet que se autorizará en el contrato inteligente para que el centro pueda recibir entregas.
              </p>
              <Input
                id="centerWallet"
                placeholder="0x..."
                value={centerWallet}
                onChange={(e) => {
                  setCenterWallet(e.target.value)
                  setErrorMessage("")
                }}
                className="mt-1 font-mono"
                required
              />
              {centerWallet && !centerWallet.match(/^0x[a-fA-F0-9]{40}$/) && (
                <p className="text-sm text-destructive mt-1">Formato inválido. Debe ser una dirección Ethereum válida (0x seguido de 40 caracteres hexadecimales)</p>
              )}
            </div>

            {/* Mensajes de error */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Mensaje de éxito - transacción enviada */}
            {isPending && (
              <Alert className="mb-4 border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Transacción enviada</p>
                    <p className="text-sm text-muted-foreground">
                      Esperando confirmación en la blockchain... Por favor confirma la transacción en MetaMask.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Estado de conexión */}
            {!isConnected && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Debes conectar tu wallet para agregar el centro al contrato. Solo el owner del contrato puede realizar esta acción.
                </AlertDescription>
              </Alert>
            )}

            {/* Advertencia si está verificando */}
            {isConnected && checkingOwner && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Verificando permisos del owner... Por favor espera.
                </AlertDescription>
              </Alert>
            )}

            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Documentación Requerida</h3>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Acta Constitutiva</p>
                <p className="text-sm text-muted-foreground mb-3">PDF o imagen (máx. 5MB)</p>
                <Button variant="outline" size="sm">
                  Seleccionar Archivo
                </Button>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Comprobante de Domicilio</p>
                <p className="text-sm text-muted-foreground mb-3">PDF o imagen (máx. 5MB)</p>
                <Button variant="outline" size="sm">
                  Seleccionar Archivo
                </Button>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Licencia de Funcionamiento</p>
                <p className="text-sm text-muted-foreground mb-3">PDF o imagen (máx. 5MB)</p>
                <Button variant="outline" size="sm">
                  Seleccionar Archivo
                </Button>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Identificación Oficial del Representante</p>
                <p className="text-sm text-muted-foreground mb-3">PDF o imagen (máx. 5MB)</p>
                <Button variant="outline" size="sm">
                  Seleccionar Archivo
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mt-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Nota:</strong> Todos los documentos serán revisados por nuestro
                equipo. El proceso de verificación puede tomar de 2 a 5 días hábiles.
              </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setPaso(2)} className="flex-1" disabled={isPending}>
                Atrás
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1" 
                disabled={
                  isPending || 
                  !isConnected || 
                  checkingOwner || 
                  !isOwner ||  // BLOQUEAR si no es owner
                  !centerWallet || 
                  !centerWallet.match(/^0x[a-fA-F0-9]{40}$/)
                }
              >
                {isPending 
                  ? "Firmando transacción..." 
                  : isSuccess 
                  ? "¡Agregado!" 
                  : !isOwner && !checkingOwner
                  ? "Solo el Owner puede agregar"
                  : "Agregar al Contrato"}
              </Button>
            </div>
            
            {/* Información sobre el proceso */}
            {isPending && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Por favor, confirma la transacción en MetaMask. Este proceso puede tardar unos segundos.
              </p>
            )}
          </Card>
        )}

        {/* Paso 4: Configuración de Precios */}
        {paso === 4 && isSuccess && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Configurar Precios del Centro</h2>
            <p className="text-muted-foreground mb-6">
              Ahora configura los precios por kilogramo para cada material que acepta tu centro. 
              Puedes configurar precios para diferentes métodos de pago (ETH, USDC, MXNB).
            </p>

            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {formData.materialesAceptados.length > 0 ? (
                formData.materialesAceptados.map((material) => (
                  <Card key={material} className="p-4 border">
                    <h3 className="font-semibold text-foreground mb-4">{material}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Precio ETH */}
                      <div>
                        <Label className="text-sm mb-2 block">Precio en ETH (por kg)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.000001"
                            placeholder="0.002"
                            value={priceInputs[material]?.eth || ""}
                            onChange={(e) => setPriceInputs(prev => ({
                              ...prev,
                              [material]: { ...prev[material], eth: e.target.value }
                            }))}
                            className="flex-1"
                            disabled={isSettingPrice}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const price = priceInputs[material]?.eth
                              if (price) {
                                handleSetPrice(material, PaymentToken.ETH, price)
                              }
                            }}
                            disabled={isSettingPrice || !priceInputs[material]?.eth}
                          >
                            Configurar
                          </Button>
                        </div>
                      </div>

                      {/* Precio USDC */}
                      <div>
                        <Label className="text-sm mb-2 block">Precio en USDC (por kg)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="2.00"
                            value={priceInputs[material]?.usdc || ""}
                            onChange={(e) => setPriceInputs(prev => ({
                              ...prev,
                              [material]: { ...prev[material], usdc: e.target.value }
                            }))}
                            className="flex-1"
                            disabled={isSettingPrice}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const price = priceInputs[material]?.usdc
                              if (price) {
                                handleSetPrice(material, PaymentToken.USDC, price)
                              }
                            }}
                            disabled={isSettingPrice || !priceInputs[material]?.usdc}
                          >
                            Configurar
                          </Button>
                        </div>
                      </div>

                      {/* Precio MXNB */}
                      <div>
                        <Label className="text-sm mb-2 block">Precio en MXNB (por kg)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.000001"
                            placeholder="0.002"
                            value={priceInputs[material]?.mxnb || ""}
                            onChange={(e) => setPriceInputs(prev => ({
                              ...prev,
                              [material]: { ...prev[material], mxnb: e.target.value }
                            }))}
                            className="flex-1"
                            disabled={isSettingPrice}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const price = priceInputs[material]?.mxnb
                              if (price) {
                                handleSetPrice(material, PaymentToken.MXNB, price)
                              }
                            }}
                            disabled={isSettingPrice || !priceInputs[material]?.mxnb}
                          >
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No has seleccionado materiales aceptados. Puedes continuar y configurar los precios más tarde.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {isSettingPrice && lastConfiguredPrice && (
              <Alert className="mt-4">
                <AlertDescription>
                  Configurando precio de {lastConfiguredPrice.material} en {lastConfiguredPrice.token} en el contrato... Por favor espera.
                </AlertDescription>
              </Alert>
            )}

            {priceSetSuccess && lastConfiguredPrice && (
              <Alert className="mt-4 border-green-500/20 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  ✓ Precio de {lastConfiguredPrice.material} en {lastConfiguredPrice.token} configurado exitosamente en el contrato.
                  {priceHash && (
                    <a 
                      href={`https://sepolia.arbiscan.io/tx/${priceHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-green-600 underline hover:text-green-700"
                    >
                      Ver transacción
                    </a>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setPaso(5)} 
                className="flex-1"
                disabled={isSettingPrice}
              >
                {formData.materialesAceptados.length === 0 ? "Finalizar" : "Continuar"}
              </Button>
            </div>
          </Card>
        )}

        {/* Paso 5: Confirmación Final */}
        {paso === 5 && (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              ¡Centro Registrado Exitosamente!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              El centro de reciclaje con dirección <strong>{centerWallet.slice(0, 8)}...{centerWallet.slice(-6)}</strong> ha sido autorizado exitosamente en el contrato inteligente.
              {formData.materialesAceptados.length > 0 && " Los precios han sido configurados y el centro ya puede recibir entregas."}
            </p>
            {isSuccess && (
              <div className="space-y-4 mb-6">
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm text-foreground mb-2">
                    <strong>Centro Autorizado:</strong> {centerWallet}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Este centro ahora puede recibir entregas a través del contrato inteligente.
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
            )}
            {!isSuccess && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground mb-2">
                <strong>Número de Solicitud:</strong> #RC-2025-{Math.floor(Math.random() * 10000)}
              </p>
              <p className="text-sm text-muted-foreground">
                Recibirás un correo electrónico a <strong>{formData.email}</strong> con los siguientes pasos.
              </p>
            </div>
            )}
            <Button asChild className="w-full">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
