"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAccount } from "wagmi"
import { useIsOwner, useSetGlobalMaterialPrice, useMaterialPrice } from "@/lib/hooks/use-recycling-contract"
import { PaymentToken } from "@/lib/contracts"
import { ArrowLeft, Settings, AlertCircle, CheckCircle2 } from "lucide-react"

const MATERIALES = [
  { id: "plastico", nombre: "Plástico PET" },
  { id: "papel", nombre: "Papel" },
  { id: "carton", nombre: "Cartón" },
  { id: "vidrio", nombre: "Vidrio" },
  { id: "metal", nombre: "Metal" },
  { id: "aluminio", nombre: "Aluminio" },
  { id: "electronico", nombre: "Electrónico" },
]

export default function ConfigurarPreciosPage() {
  const { address, isConnected } = useAccount()
  const { isOwner, isLoading: checkingOwner } = useIsOwner()
  const { setGlobalMaterialPrice, isPending, isSuccess, error, hash } = useSetGlobalMaterialPrice()
  
  const [materialType, setMaterialType] = useState("plastico")
  const [paymentToken, setPaymentToken] = useState<PaymentToken>(PaymentToken.ETH)
  const [price, setPrice] = useState("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Obtener precio actual para mostrar
  const { price: currentPrice } = useMaterialPrice(materialType, paymentToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!isConnected) {
      setErrorMessage("Debes conectar tu wallet primero")
      return
    }

    if (checkingOwner) {
      setErrorMessage("Verificando permisos de owner...")
      return
    }

    if (!isOwner) {
      setErrorMessage("Solo el owner del contrato puede configurar precios")
      return
    }

    if (!materialType || !price || parseFloat(price) <= 0) {
      setErrorMessage("Debes ingresar un precio válido mayor a 0")
      return
    }

    try {
      await setGlobalMaterialPrice(
        materialType,
        paymentToken,
        price,
        paymentToken === PaymentToken.ETH
      )
    } catch (err: any) {
      console.error("Error setting price:", err)
      if (err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
        setErrorMessage("Transacción cancelada")
      } else if (err?.message?.includes("Only owner") || err?.message?.includes("OwnableUnauthorizedAccount")) {
        setErrorMessage("Solo el owner puede configurar precios")
      } else {
        setErrorMessage(err?.message || "Error al configurar el precio")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Configurar Precios</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-6">
          {!isConnected && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Debes conectar tu wallet para configurar precios.
              </AlertDescription>
            </Alert>
          )}

          {isConnected && checkingOwner && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Verificando permisos de owner...
              </AlertDescription>
            </Alert>
          )}

          {isConnected && !checkingOwner && !isOwner && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Solo el owner del contrato puede configurar precios. Tu wallet no es el owner.
              </AlertDescription>
            </Alert>
          )}

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
              <Label htmlFor="material">Tipo de Material</Label>
              <select
                id="material"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                disabled={isPending}
              >
                {MATERIALES.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Token de Pago</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={paymentToken === PaymentToken.ETH ? "default" : "outline"}
                  onClick={() => setPaymentToken(PaymentToken.ETH)}
                  disabled={isPending}
                >
                  ETH
                </Button>
                <Button
                  type="button"
                  variant={paymentToken === PaymentToken.USDC ? "default" : "outline"}
                  onClick={() => setPaymentToken(PaymentToken.USDC)}
                  disabled={isPending}
                >
                  USDC
                </Button>
                <Button
                  type="button"
                  variant={paymentToken === PaymentToken.MXNB ? "default" : "outline"}
                  onClick={() => setPaymentToken(PaymentToken.MXNB)}
                  disabled={isPending}
                >
                  MXNB
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Precio por kg ({paymentToken === PaymentToken.ETH ? "ETH" : paymentToken === PaymentToken.USDC ? "USDC (6 decimals)" : "MXNB"})
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
              {currentPrice && currentPrice > 0n && (
                <p className="text-xs text-muted-foreground">
                  Precio actual: {currentPrice.toString()} (wei/tokens)
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
                checkingOwner ||
                !isOwner ||
                !price ||
                parseFloat(price) <= 0
              }
            >
              {isPending ? "Configurando precio..." : "Configurar Precio"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-semibold mb-2">📝 Nota:</p>
            <p className="text-xs text-muted-foreground mb-2">
              Estos son precios <strong>globales</strong> que se usarán como fallback cuando un centro no tenga su propio precio configurado. 
              Cada centro puede configurar sus propios precios desde su dashboard.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Plástico a 0.002 ETH/kg = <code className="bg-background px-1 rounded">2000000000000000</code> wei</li>
              <li>Plástico a 2 USDC/kg = <code className="bg-background px-1 rounded">2000000</code> (USDC tiene 6 decimals)</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

