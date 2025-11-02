# Plan de Implementación - Integración del Contrato RecyclingEscrow

## 🎯 Objetivo
Integrar todas las funciones importantes del contrato en los componentes de la aplicación, priorizando funcionalidades core y funciones de lectura.

---

## 📋 Fase 1: Funciones de Lectura (Prioridad ALTA)

### 1.1 Obtener Entregas del Usuario
**Objetivo:** Mostrar las entregas reales del usuario conectado

**Componentes a modificar:**
- `app/usuario/dashboard/page.tsx`
- `app/usuario/pagos/page.tsx`

**Hooks a usar:**
- ✅ `useMyDeliveries` - Obtener IDs de entregas
- ✅ `useDelivery` - Obtener detalles de cada entrega
- ✅ `useDeliveryStatus` - Obtener estado formateado

**Implementación:**
```typescript
// En dashboard
const { deliveryIds, isLoading } = useMyDeliveries()

// Mapear cada ID a sus detalles
{deliveryIds?.map((id) => {
  const { delivery, isLoading: loadingDelivery } = useDelivery(id)
  // Mostrar card con información
})}
```

**Entregables:**
- ✅ Lista de entregas desde el contrato
- ✅ Estados reales (Pending, Validated, Rejected, Completed)
- ✅ Montos en ETH
- ✅ Fechas desde timestamps del contrato

**Estimación:** 2-3 horas

---

### 1.2 Obtener Detalles de una Entrega
**Objetivo:** Mostrar información completa de una entrega específica

**Componentes a modificar:**
- `app/centro/verificar/[id]/page.tsx`
- `app/usuario/mapa/[id]/page.tsx`
- `app/recolector/solicitud/[id]/page.tsx`

**Hooks a usar:**
- ✅ `useDelivery` - Obtener datos completos
- ✅ `useDeliveryStatus` - Estado formateado

**Implementación:**
```typescript
// Obtener ID de URL params
const { id } = useParams()
const deliveryId = BigInt(id as string)

// Cargar datos
const { delivery, isLoading, error } = useDelivery(deliveryId)
const { statusLabel } = useDeliveryStatus(deliveryId)

// Mostrar información
{delivery && (
  <DeliveryDetails 
    materialType={delivery.materialType}
    amount={formatEther(delivery.amount)}
    paymentAmount={formatEther(delivery.paymentAmount)}
    status={statusLabel}
    createdAt={new Date(Number(delivery.createdAt) * 1000)}
  />
)}
```

**Entregables:**
- ✅ Vista detallada de entrega desde contrato
- ✅ Información de usuario y centro
- ✅ Historial de estados
- ✅ Razón de rechazo si aplica

**Estimación:** 2 horas

---

### 1.3 Verificar si una Dirección es Centro Autorizado
**Objetivo:** Validar permisos antes de crear entregas

**Componentes a modificar:**
- `app/usuario/solicitar/page.tsx`
- `components/request-pickup-form.tsx`

**Hooks a usar:**
- ✅ `useIsRecyclingCenter` - Verificar si dirección está autorizada

**Implementación:**
```typescript
const [selectedCenter, setSelectedCenter] = useState<string>("")
const { isRecyclingCenter, isLoading } = useIsRecyclingCenter(
  selectedCenter as `0x${string}` | undefined
)

// Mostrar warning si no está autorizado
{selectedCenter && !isRecyclingCenter && (
  <Alert variant="destructive">
    Este centro no está autorizado. Contacta al administrador.
  </Alert>
)}
```

**Entregables:**
- ✅ Validación de centros antes de crear entrega
- ✅ UI para seleccionar centro autorizado
- ✅ Lista de centros disponibles (requiere iterar o evento)

**Estimación:** 1-2 horas

---

### 1.4 Obtener Estadísticas del Contrato
**Objetivo:** Mostrar métricas en dashboards

**Componentes a modificar:**
- `app/centro/dashboard/page.tsx`
- `app/usuario/dashboard/page.tsx`

**Hooks a crear:**
- ❌ `useContractStats` - Nuevo hook

**Implementación del hook:**
```typescript
export function useContractStats() {
  const { data: totalEscrowed, isLoading: loadingEscrowed } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'getTotalEscrowed',
  })

  const { data: contractBalance, isLoading: loadingBalance } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'getContractBalance',
  })

  const { data: deliveryCounter, isLoading: loadingCounter } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'deliveryCounter',
  })

  return {
    totalEscrowed: totalEscrowed as bigint | undefined,
    contractBalance: contractBalance as bigint | undefined,
    totalDeliveries: deliveryCounter as bigint | undefined,
    isLoading: loadingEscrowed || loadingBalance || loadingCounter,
  }
}
```

**Uso en componentes:**
```typescript
const { totalEscrowed, totalDeliveries, isLoading } = useContractStats()

// Mostrar en cards
<StatCard 
  label="Total en Escrow"
  value={formatEther(totalEscrowed || 0n) + " ETH"}
/>
```

**Entregables:**
- ✅ Hook `useContractStats`
- ✅ Cards con estadísticas en dashboard
- ✅ Total de entregas
- ✅ Total en escrow

**Estimación:** 1-2 horas

---

## 📋 Fase 2: Funciones de Escritura Core (Prioridad ALTA)

### 2.1 Crear Entrega (createDelivery)
**Objetivo:** Permitir a usuarios crear entregas con pago en escrow

**Componentes a modificar:**
- `app/usuario/solicitar/page.tsx`
- `components/request-pickup-form.tsx`

**Hooks a usar:**
- ✅ `useCreateDelivery` - Ya existe
- ✅ `useIsRecyclingCenter` - Validar centro
- ✅ `useAccount` - Verificar wallet conectada

**Cambios necesarios:**

1. **Agregar selección de centro:**
```typescript
// Lista de centros (hardcodeada inicialmente o desde contrato)
const centers = [
  { address: "0x...", name: "EcoCenter CDMX" },
  // ...
]

const [selectedCenter, setSelectedCenter] = useState<string>("")
```

2. **Validar antes de crear:**
```typescript
const { address, isConnected } = useAccount()
const { isRecyclingCenter } = useIsRecyclingCenter(selectedCenter as `0x${string}`)
const { createDelivery, isPending, isSuccess, error } = useCreateDelivery()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!isConnected) {
    toast.error("Conecta tu wallet primero")
    return
  }
  
  if (!isRecyclingCenter) {
    toast.error("Centro no autorizado")
    return
  }
  
  try {
    const amountBigInt = BigInt(formData.cantidad)
    const paymentAmountEth = calculatePayment(formData.cantidad, formData.tipoMaterial)
    
    await createDelivery(
      selectedCenter as `0x${string}`,
      formData.tipoMaterial,
      amountBigInt,
      paymentAmountEth
    )
    
    toast.success("Entrega creada exitosamente")
    router.push("/usuario/dashboard")
  } catch (err) {
    toast.error("Error al crear entrega")
  }
}
```

3. **Calcular pago en ETH:**
```typescript
const pricePerKg: Record<string, number> = {
  plastico: 0.0001, // ETH por kg
  carton: 0.000075,
  aluminio: 0.0005,
  // ...
}

const calculatePayment = (kg: string, materialType: string): string => {
  const price = pricePerKg[materialType] || 0.0001
  const total = parseFloat(kg) * price
  return total.toFixed(6) // Retornar como string
}
```

**Entregables:**
- ✅ Formulario con selección de centro
- ✅ Validación de wallet y centro
- ✅ Cálculo de pago en ETH
- ✅ Creación de entrega en blockchain
- ✅ Manejo de estados (loading, success, error)
- ✅ Redirección después de éxito

**Estimación:** 3-4 horas

---

### 2.2 Validar Entrega (validateDelivery)
**Objetivo:** Centros pueden validar entregas y liberar pago

**Componentes a modificar:**
- `app/centro/verificar/[id]/page.tsx`

**Hooks a usar:**
- ✅ `useDelivery` - Cargar datos de entrega
- ✅ `useValidateDelivery` - Validar entrega
- ✅ `useAccount` - Verificar que sea el centro autorizado

**Cambios necesarios:**

```typescript
const { id } = useParams()
const deliveryId = BigInt(id as string)
const { address } = useAccount()

// Cargar datos
const { delivery, isLoading, refetch } = useDelivery(deliveryId)
const { validateDelivery, isPending: validating, isSuccess } = useValidateDelivery()

// Verificar que el centro actual sea el autorizado
const isAuthorized = delivery?.recyclingCenter.toLowerCase() === address?.toLowerCase()

const handleValidate = async () => {
  if (!isAuthorized) {
    toast.error("No estás autorizado para validar esta entrega")
    return
  }
  
  try {
    await validateDelivery(deliveryId)
    toast.success("Entrega validada. El pago se ha liberado.")
    refetch() // Actualizar datos
  } catch (err) {
    toast.error("Error al validar entrega")
  }
}

// Mostrar botón solo si está autorizado
{isAuthorized && delivery?.status === DeliveryStatus.Pending && (
  <Button onClick={handleValidate} disabled={validating}>
    {validating ? "Validando..." : "Aprobar y Pagar"}
  </Button>
)}
```

**Entregables:**
- ✅ Carga de datos desde contrato
- ✅ Validación de permisos
- ✅ Botón de validar funcional
- ✅ Actualización automática después de validar
- ✅ Mostrar estado actualizado

**Estimación:** 2-3 horas

---

### 2.3 Rechazar Entrega (rejectDelivery)
**Objetivo:** Centros pueden rechazar entregas con razón

**Componentes a modificar:**
- `app/centro/verificar/[id]/page.tsx`

**Hooks a usar:**
- ✅ `useRejectDelivery` - Rechazar entrega
- ✅ `useDelivery` - Cargar datos

**Implementación:**

```typescript
const { rejectDelivery, isPending: rejecting } = useRejectDelivery()
const [rejectionReason, setRejectionReason] = useState("")

const handleReject = async () => {
  if (!rejectionReason.trim()) {
    toast.error("Debes proporcionar una razón")
    return
  }
  
  try {
    await rejectDelivery(deliveryId, rejectionReason)
    toast.success("Entrega rechazada. El pago se ha reembolsado.")
    refetch()
  } catch (err) {
    toast.error("Error al rechazar entrega")
  }
}

// Modal o input para razón
<Dialog>
  <DialogContent>
    <Textarea 
      placeholder="Razón del rechazo..."
      value={rejectionReason}
      onChange={(e) => setRejectionReason(e.target.value)}
    />
    <Button onClick={handleReject} disabled={rejecting}>
      Rechazar Entrega
    </Button>
  </DialogContent>
</Dialog>
```

**Entregables:**
- ✅ Botón de rechazar
- ✅ Modal/dialog para razón
- ✅ Rechazo en blockchain
- ✅ Actualización de UI

**Estimación:** 1-2 horas

---

## 📋 Fase 3: Funciones de Escritura Secundarias (Prioridad MEDIA)

### 3.1 Retirar Fondos (withdrawFunds)
**Objetivo:** Usuarios pueden retirar fondos de entregas validadas

**Componentes a modificar:**
- `app/usuario/pagos/page.tsx`

**Hook a crear:**
- ❌ `useWithdrawFunds` - Nuevo hook

**Implementación del hook:**
```typescript
export function useWithdrawFunds() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const withdrawFunds = async (deliveryId: bigint) => {
    try {
      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'withdrawFunds',
        args: [deliveryId],
      })
    } catch (err) {
      console.error('Error withdrawing funds:', err)
      throw err
    }
  }

  return {
    withdrawFunds,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}
```

**Uso en componente:**
```typescript
const { withdrawFunds, isPending } = useWithdrawFunds()

// Para entregas validadas pero no completadas
{delivery.status === DeliveryStatus.Validated && (
  <Button onClick={() => withdrawFunds(deliveryId)} disabled={isPending}>
    Retirar Fondos
  </Button>
)}
```

**Entregables:**
- ✅ Hook `useWithdrawFunds`
- ✅ Botón de retirar en lista de pagos
- ✅ Solo mostrar para entregas validadas

**Estimación:** 1-2 horas

---

### 3.2 Agregar Centro de Reciclaje (addRecyclingCenter)
**Objetivo:** Owner puede agregar centros autorizados

**Componentes a modificar:**
- Crear nuevo: `app/admin/centros/page.tsx` o agregar a dashboard

**Hook a crear:**
- ❌ `useAddRecyclingCenter` - Nuevo hook
- ❌ `useIsOwner` - Verificar si es owner

**Implementación:**

```typescript
// Hook para verificar owner
export function useIsOwner() {
  const { address } = useAccount()
  const { data: owner, isLoading } = useReadContract({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    functionName: 'owner',
  })

  return {
    isOwner: address && owner && address.toLowerCase() === (owner as string).toLowerCase(),
    isLoading,
  }
}

// Hook para agregar centro
export function useAddRecyclingCenter() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addRecyclingCenter = async (centerAddress: `0x${string}`) => {
    try {
      await writeContract({
        address: RECYCLING_CONTRACT_ADDRESS,
        abi: RECYCLING_CONTRACT_ABI,
        functionName: 'addRecyclingCenter',
        args: [centerAddress],
      })
    } catch (err) {
      console.error('Error adding center:', err)
      throw err
    }
  }

  return {
    addRecyclingCenter,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}
```

**Uso:**
```typescript
const { isOwner } = useIsOwner()
const { addRecyclingCenter, isPending } = useAddRecyclingCenter()

{isOwner && (
  <form onSubmit={(e) => {
    e.preventDefault()
    addRecyclingCenter(centerAddress as `0x${string}`)
  }}>
    <Input placeholder="Dirección del centro (0x...)" />
    <Button type="submit" disabled={isPending}>
      Agregar Centro
    </Button>
  </form>
)}
```

**Entregables:**
- ✅ Hook `useIsOwner`
- ✅ Hook `useAddRecyclingCenter`
- ✅ UI para agregar centros (solo owner)
- ✅ Validación de permisos

**Estimación:** 2-3 horas

---

## 📋 Fase 4: Mejoras y Optimizaciones (Prioridad BAJA)

### 4.1 Obtener Entregas por Centro
**Objetivo:** Centros pueden ver sus entregas pendientes

**Problema:** El contrato no tiene función directa para esto.

**Solución 1: Usar eventos**
```typescript
// Hook para obtener entregas filtradas por centro
export function useCenterDeliveries(centerAddress: `0x${string}` | undefined) {
  // Leer deliveryCounter y iterar
  const { data: counter } = useReadContract({
    functionName: 'deliveryCounter'
  })
  
  // Crear array de IDs
  const deliveryIds = Array.from({ length: Number(counter || 0) }, (_, i) => BigInt(i))
  
  // Obtener cada entrega y filtrar
  const deliveries = deliveryIds.map(id => {
    const { delivery } = useDelivery(id)
    return delivery?.recyclingCenter.toLowerCase() === centerAddress?.toLowerCase() 
      ? delivery 
      : null
  }).filter(Boolean)
  
  return { deliveries }
}
```

**Solución 2: Eventos del contrato (más eficiente)**
```typescript
// Escuchar eventos DeliveryCreated y filtrar
// Requiere configuración de event listeners
```

**Estimación:** 3-4 horas

---

### 4.2 Manejo de Eventos del Contrato
**Objetivo:** Updates en tiempo real cuando cambian estados

**Implementación:**
```typescript
// Usar wagmi watchContractEvent
import { useWatchContractEvent } from 'wagmi'

export function useDeliveryEvents(deliveryId: bigint) {
  // Escuchar eventos de validación
  useWatchContractEvent({
    address: RECYCLING_CONTRACT_ADDRESS,
    abi: RECYCLING_CONTRACT_ABI,
    eventName: 'DeliveryValidated',
    onLogs(logs) {
      // Verificar si es nuestra entrega
      const log = logs.find(l => l.args.deliveryId === deliveryId)
      if (log) {
        // Refetch data
        refetch()
      }
    },
  })
}
```

**Estimación:** 2-3 horas

---

### 4.3 Conversión de Timestamps a Fechas
**Objetivo:** Mostrar fechas legibles

**Utilidad:**
```typescript
export function formatDeliveryDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Uso
{formatDeliveryDate(delivery.createdAt)}
```

**Estimación:** 30 minutos

---

## 📅 Cronograma de Implementación

### Semana 1: Funciones de Lectura
- **Día 1-2:** Fase 1.1 - Obtener entregas del usuario
- **Día 3:** Fase 1.2 - Detalles de entrega
- **Día 4:** Fase 1.3 - Verificar centros autorizados
- **Día 5:** Fase 1.4 - Estadísticas del contrato

### Semana 2: Funciones de Escritura Core
- **Día 1-2:** Fase 2.1 - Crear entrega
- **Día 3:** Fase 2.2 - Validar entrega
- **Día 4:** Fase 2.3 - Rechazar entrega
- **Día 5:** Testing y correcciones

### Semana 3: Funciones Secundarias
- **Día 1:** Fase 3.1 - Retirar fondos
- **Día 2-3:** Fase 3.2 - Agregar centros (admin)
- **Día 4-5:** Mejoras y optimizaciones

---

## ✅ Checklist de Implementación

### Preparación
- [ ] Verificar que el contrato esté desplegado
- [ ] Verificar dirección del contrato en `lib/contracts.ts`
- [ ] Configurar Scroll Sepolia en MetaMask
- [ ] Agregar al menos un centro autorizado al contrato (como owner)

### Fase 1: Lectura
- [ ] Implementar `useMyDeliveries` en dashboard usuario
- [ ] Implementar `useDelivery` en páginas de detalle
- [ ] Implementar `useIsRecyclingCenter` en formulario de solicitud
- [ ] Crear y usar `useContractStats`

### Fase 2: Escritura Core
- [ ] Integrar `createDelivery` en formulario de solicitud
- [ ] Integrar `validateDelivery` en verificación de centro
- [ ] Integrar `rejectDelivery` en verificación de centro
- [ ] Agregar validaciones de wallet y permisos

### Fase 3: Funciones Secundarias
- [ ] Crear hook `useWithdrawFunds`
- [ ] Integrar retirar fondos en página de pagos
- [ ] Crear hooks de administración (`useIsOwner`, `useAddRecyclingCenter`)
- [ ] Crear UI para administración de centros

### Fase 4: Mejoras
- [ ] Implementar obtención de entregas por centro
- [ ] Agregar event listeners para updates en tiempo real
- [ ] Mejorar formateo de fechas y montos
- [ ] Agregar loading states y manejo de errores en todos los componentes

---

## 🎯 Priorización Final

**Must Have (Crítico):**
1. ✅ Fase 1.1 - Obtener entregas del usuario
2. ✅ Fase 2.1 - Crear entrega
3. ✅ Fase 2.2 - Validar entrega
4. ✅ Fase 1.2 - Detalles de entrega

**Should Have (Importante):**
5. ✅ Fase 2.3 - Rechazar entrega
6. ✅ Fase 1.3 - Verificar centros
7. ✅ Fase 3.1 - Retirar fondos

**Nice to Have (Mejoras):**
8. ✅ Fase 1.4 - Estadísticas
9. ✅ Fase 3.2 - Admin de centros
10. ✅ Fase 4 - Optimizaciones

---

## 📝 Notas Técnicas

1. **Conversión de Valores:**
   - Siempre usar `parseEther()` para convertir string a wei
   - Siempre usar `formatEther()` para mostrar montos
   - Los timestamps están en segundos (Unix timestamp)

2. **Estados del Contrato:**
   ```typescript
   enum DeliveryStatus {
     Pending = 0,    // Pendiente de validación
     Validated = 1,  // Validado - pago liberado
     Rejected = 2,   // Rechazado - reembolsado
     Completed = 3   // Completado - fondos retirados
   }
   ```

3. **Validaciones Importantes:**
   - Verificar wallet conectada antes de transacciones
   - Verificar red correcta (Scroll Sepolia)
   - Verificar permisos (centro autorizado, owner, etc.)
   - Manejar errores de transacción

4. **Testing:**
   - Probar cada función con wallet de prueba
   - Verificar estados después de transacciones
   - Probar casos edge (centro no autorizado, entrega no encontrada, etc.)

