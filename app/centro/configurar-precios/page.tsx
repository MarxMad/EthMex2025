"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAccount } from "wagmi"
import { useSetCenterMaterialPrice, useIsRecyclingCenter, useMaterialPrice } from "@/lib/hooks/use-recycling-contract"
import { PaymentToken } from "@/lib/contracts"
import { ArrowLeft, Settings, AlertCircle, CheckCircle2, DollarSign } from "lucide-react"
import { Logo } from "@/components/logo"

const MATERIALES = [
  { id: "plastico", nombre: "Plástico PET", display: "Plástico PET" },
  { id: "carton", nombre: "Cartón", display: "Cartón" },
  { id: "vidrio", nombre: "Vidrio", display: "Vidrio" },
  { id: "aluminio", nombre: "Aluminio", display: "Aluminio" },
  { id: "papel", nombre: "Papel", display: "Papel" },
  { id: "electronico", nombre: "Electrónico", display: "Electrónicos" },
]

export default function CentroConfigurarPreciosPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isRecyclingCenter, isLoading: checkingCenter } = useIsRecyclingCenter(
    address ? (address as `0x${string}`) : undefined
  )
  const { setCenterMaterialPrice, hash, isPending, isSuccess, error } = useSetCenterMaterialPrice()
  
  const [materialType, setMaterialType] = useState("plastico")
  const [paymentToken, setPaymentToken] = useState<PaymentToken>(PaymentToken.ETH)
  const [price, setPrice] = useState("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [configuredPrices, setConfiguredPrices] = useState<Set<string>>(new Set())

  // Obtener precio actual del centro para este material y token
  const { price: currentPrice, isLoading: loadingPrice } = useMaterialPrice(
    materialType,
    paymentToken,
    address ? (address as `0x${string}`) : undefined
  )

  // Actualizar precios configurados cuando una transacción es exitosa
  useEffect(() => {
    if (isSuccess && hash) {
      const key = `${materialType}-${paymentToken}`
      setConfiguredPrices(prev => new Set([...prev, key]))
      setPrice("") // Limpiar el input
      // Resetear isSuccess después de un momento
      setTimeout(() => {
        // El hook manejará el reset
      }, 3000)
    }
  }, [isSuccess, hash, materialType, paymentToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!isConnected) {
      setErrorMessage("Debes conectar tu wallet primero")
      return
    }

    if (checkingCenter) {
      setErrorMessage("Verificando si eres un centro autorizado...")
      return
    }

    if (!isRecyclingCenter) {
      setErrorMessage("Tu wallet no está autorizada como centro de reciclaje. Contacta al administrador para registrarte.")
      return
    }

    if (!address) {
      setErrorMessage("No se pudo obtener tu dirección de wallet")
      return
    }

    if (!materialType || !price || parseFloat(price) <= 0) {
      setErrorMessage("Debes ingresar un precio válido mayor a 0")
      return
    }

    try {
      await setCenterMaterialPrice(
        address as `0x${string}`,
        materialType,
        paymentToken,
        price
      )
    } catch (err: any) {
      console.error("Error setting price:", err)
      if (err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
        setErrorMessage("Transacción cancelada")
      } else if (err?.message?.includes("Center not authorized")) {
        setErrorMessage("Tu wallet no está autorizada como centro de reciclaje")
      } else {
        setErrorMessage(err?.message || "Error al configurar el precio")
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Debes conectar tu wallet para configurar precios.
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    )
  }

  if (checkingCenter) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Verificando si eres un centro autorizado...
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    )
  }

  if (!isRecyclingCenter) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Tu wallet no está autorizada como centro de reciclaje.</p>
                  <p className="text-sm">
                    Tu dirección: <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </p>
                  <p className="text-sm">
                    Contacta al administrador para registrarte como centro autorizado.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Configurar Precios del Centro
            </h1>
            <p className="text-muted-foreground">
              Configura los precios por kilogramo para cada material que acepta tu centro. 
              Estos precios son específicos de tu centro y tienen prioridad sobre los precios globales.
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="mb-6 border-green-500/20 bg-green-500/5">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">¡Precio configurado exitosamente!</p>
                  {hash && (
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href={`https://sepolia.arbiscan.io/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Ver transacción en Arbiscan
                      </a>
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="material">Tipo de Material *</Label>
              <select
                id="material"
                value={materialType}
                onChange={(e) => {
                  setMaterialType(e.target.value)
                  setPrice("") // Limpiar precio al cambiar material
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                disabled={isPending}
              >
                {MATERIALES.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.display}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Token de Pago *</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={paymentToken === PaymentToken.ETH ? "default" : "outline"}
                  onClick={() => {
                    setPaymentToken(PaymentToken.ETH)
                    setPrice("") // Limpiar precio al cambiar token
                  }}
                  disabled={isPending}
                >
                  ETH
                </Button>
                <Button
                  type="button"
                  variant={paymentToken === PaymentToken.USDC ? "default" : "outline"}
                  onClick={() => {
                    setPaymentToken(PaymentToken.USDC)
                    setPrice("") // Limpiar precio al cambiar token
                  }}
                  disabled={isPending}
                >
                  USDC
                </Button>
                <Button
                  type="button"
                  variant={paymentToken === PaymentToken.MXNB ? "default" : "outline"}
                  onClick={() => {
                    setPaymentToken(PaymentToken.MXNB)
                    setPrice("") // Limpiar precio al cambiar token
                  }}
                  disabled={isPending}
                >
                  MXNB
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Precio por kg ({paymentToken === PaymentToken.ETH ? "ETH" : paymentToken === PaymentToken.USDC ? "USDC (6 decimals)" : "MXNB"}) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.000001"
                placeholder={paymentToken === PaymentToken.ETH ? "0.002" : "2"}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isPending}
                required
              />
              {!loadingPrice && currentPrice && currentPrice > 0n && (
                <p className="text-xs text-muted-foreground">
                  Precio actual configurado: {currentPrice.toString()} (wei/tokens)
                </p>
              )}
              {!loadingPrice && (!currentPrice || currentPrice === 0n) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  ⚠️ No hay precio configurado para este material y token. Se usará el precio global como fallback.
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                isPending ||
                !isConnected ||
                checkingCenter ||
                !isRecyclingCenter ||
                !price ||
                parseFloat(price) <= 0
              }
            >
              {isPending ? "Configurando precio..." : "Configurar Precio"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-semibold mb-2">📝 Nota Importante:</p>
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Los precios del centro tienen prioridad sobre los precios globales.</strong> 
              Si no configuras un precio para un material específico, se usará el precio global configurado por el administrador.
            </p>
            <p className="text-xs text-muted-foreground">
              Para que los usuarios puedan crear solicitudes hacia tu centro, debes configurar al menos un precio 
              (ETH, USDC o MXNB) para cada material que aceptas.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

