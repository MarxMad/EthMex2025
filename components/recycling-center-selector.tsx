"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsRecyclingCenter, useRecyclingCenters } from "@/lib/hooks/use-recycling-contract"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Building2 } from "lucide-react"

interface RecyclingCenterSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  required?: boolean
}

export function RecyclingCenterSelector({ 
  value, 
  onValueChange, 
  required = true 
}: RecyclingCenterSelectorProps) {
  const [selectedAddress, setSelectedAddress] = useState<string>(value || "")
  const { centers, isLoading: loadingCenters } = useRecyclingCenters()
  const { isRecyclingCenter, isLoading: checkingCenter } = useIsRecyclingCenter(
    selectedAddress ? (selectedAddress as `0x${string}`) : undefined
  )

  // Sincronizar el valor cuando cambia desde fuera
  useEffect(() => {
    if (value !== selectedAddress) {
      setSelectedAddress(value || "")
    }
  }, [value])

  const handleChange = (newValue: string) => {
    setSelectedAddress(newValue)
    onValueChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        Centro de Reciclaje {required && "*"}
      </Label>
      
      {loadingCenters ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando centros disponibles...
        </div>
      ) : centers.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay centros disponibles. Contacta al administrador para agregar centros autorizados.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Select value={selectedAddress} onValueChange={handleChange} required={required}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un centro de reciclaje" />
            </SelectTrigger>
            <SelectContent>
              {centers.map((center) => (
                <SelectItem key={center.address} value={center.address}>
                  {center.name} ({center.address.slice(0, 6)}...{center.address.slice(-4)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Verificación del centro */}
          {selectedAddress && (
            <div className="mt-2">
              {checkingCenter ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando centro...
                </div>
              ) : isRecyclingCenter ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Centro autorizado y listo para recibir entregas
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Este centro no está autorizado en el contrato. Solo puedes crear entregas a centros autorizados.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

