# Estado de Integración del Contrato RecyclingEscrow

## 📊 Estado Actual

### ✅ Lo que ESTÁ integrado:

1. **Infraestructura Base:**
   - ✅ Configuración de wagmi para Scroll Sepolia
   - ✅ Provider de wagmi en `app/layout.tsx`
   - ✅ Componente `WalletConnect` en la página principal
   - ✅ Hooks personalizados creados en `lib/hooks/use-recycling-contract.ts`
   - ✅ ABI completo del contrato en `lib/contracts.ts`
   - ✅ Dirección del contrato configurada: `0x73f0bee86004fe4e2582c5b9995675b10f265187`

### ❌ Lo que NO está integrado:

**Ningún componente está usando las funciones del contrato todavía.** Todos los componentes usan datos mock/estáticos.

---

## 📋 Funciones del Contrato vs Uso en Componentes

### Funciones Disponibles del Contrato:

| Función del Contrato | Hook Disponible | ¿Dónde debería usarse? | Estado |
|---------------------|-----------------|------------------------|--------|
| `createDelivery` | `useCreateDelivery` | `app/usuario/solicitar/page.tsx`<br>`components/request-pickup-form.tsx` | ❌ No integrado |
| `validateDelivery` | `useValidateDelivery` | `app/centro/verificar/[id]/page.tsx` | ❌ No integrado |
| `rejectDelivery` | `useRejectDelivery` | `app/centro/verificar/[id]/page.tsx` | ❌ No integrado |
| `withdrawFunds` | - | `app/usuario/pagos/page.tsx` | ❌ Falta hook y uso |
| `getDelivery` | `useDelivery` | Múltiples lugares | ❌ No integrado |
| `getUserDeliveries` | `useMyDeliveries` | `app/usuario/dashboard/page.tsx`<br>`app/usuario/pagos/page.tsx` | ❌ No integrado |
| `getContractBalance` | - | Dashboard de centro | ❌ Falta hook y uso |
| `getTotalEscrowed` | - | Dashboard de centro | ❌ Falta hook y uso |
| `addRecyclingCenter` | - | Panel de administración | ❌ Falta hook y uso |
| `removeRecyclingCenter` | - | Panel de administración | ❌ Falta hook y uso |
| `recyclingCenters` | `useIsRecyclingCenter` | Validación de centros | ❌ No integrado |

---

## 🎯 Componentes que Necesitan Integración

### 1. **Usuario - Solicitar Recolección** 
**Archivos:**
- `app/usuario/solicitar/page.tsx`
- `components/request-pickup-form.tsx`

**Funciones a integrar:**
- ✅ `useCreateDelivery` - Crear entrega con pago en escrow
- ❌ Necesita: Selección del centro de reciclaje (debe estar autorizado)
- ❌ Necesita: Cálculo del pago en ETH
- ❌ Necesita: Conexión de wallet antes de crear entrega

**Cambios necesarios:**
```typescript
// Reemplazar el setTimeout mock con:
const { createDelivery, isPending, isSuccess, error } = useCreateDelivery()
const { address, isConnected } = useAccount()

// En handleSubmit:
await createDelivery(
  recyclingCenterAddress, // Debe ser autorizado
  materialType,
  BigInt(amount),
  paymentAmountEth // "0.001" ETH
)
```

---

### 2. **Centro - Verificar Material**
**Archivo:** `app/centro/verificar/[id]/page.tsx`

**Funciones a integrar:**
- ✅ `useDelivery` - Obtener información de la entrega por ID
- ✅ `useValidateDelivery` - Validar y liberar pago
- ✅ `useRejectDelivery` - Rechazar entrega con razón
- ❌ Necesita: Recibir `deliveryId` como parámetro de URL
- ❌ Necesita: Cargar datos reales del contrato en lugar de mock

**Cambios necesarios:**
```typescript
// Obtener deliveryId de la URL
const { id } = useParams()
const deliveryId = BigInt(id)

// Cargar datos del contrato
const { delivery, isLoading } = useDelivery(deliveryId)

// Botón Aprobar
const { validateDelivery } = useValidateDelivery()
await validateDelivery(deliveryId)

// Botón Rechazar
const { rejectDelivery } = useRejectDelivery()
await rejectDelivery(deliveryId, reason)
```

---

### 3. **Usuario - Dashboard**
**Archivo:** `app/usuario/dashboard/page.tsx`

**Funciones a integrar:**
- ✅ `useMyDeliveries` - Obtener todas las entregas del usuario
- ✅ `useDelivery` - Para cada ID de entrega, obtener detalles
- ❌ Necesita: Reemplazar datos mock con datos reales del contrato
- ❌ Necesita: Mostrar estados del contrato (Pending, Validated, Rejected, Completed)

**Cambios necesarios:**
```typescript
const { deliveryIds, isLoading } = useMyDeliveries()

// Mapear cada deliveryId a su información completa
{deliveryIds?.map((id) => {
  const { delivery } = useDelivery(id)
  return <DeliveryCard delivery={delivery} />
})}
```

---

### 4. **Usuario - Pagos**
**Archivo:** `app/usuario/pagos/page.tsx`

**Funciones a integrar:**
- ✅ `useMyDeliveries` + `useDelivery` - Obtener entregas y estados
- ❌ `withdrawFunds` - Falta crear hook para retirar fondos
- ❌ Necesita: Calcular totales desde datos del contrato
- ❌ Necesita: Mostrar pagos en ETH en lugar de USD

**Hook faltante:**
```typescript
export function useWithdrawFunds() {
  // Similar a useValidateDelivery
  // Llamar a withdrawFunds(deliveryId)
}
```

---

### 5. **Centro - Dashboard**
**Archivo:** `app/centro/dashboard/page.tsx`

**Funciones a integrar:**
- ❌ Función para obtener entregas pendientes del centro
- ❌ `getTotalEscrowed` - Total de fondos en escrow
- ❌ `getContractBalance` - Balance del contrato
- ❌ Necesita: Lista de entregas donde `recyclingCenter == address`

**Funciones faltantes:**
```typescript
// No hay función en el contrato para obtener entregas por centro
// Solución: Iterar deliveries o usar eventos
// O crear hook que filtre por dirección del centro
```

---

### 6. **Centro - Registro**
**Archivo:** `app/centro/registro/page.tsx`

**Funciones a integrar:**
- ❌ `addRecyclingCenter` - Solo owner puede agregar centros
- ❌ Necesita: Verificar si la wallet conectada es owner
- ❌ Necesita: Hook para agregar centro autorizado

**Hook faltante:**
```typescript
export function useAddRecyclingCenter() {
  // Solo owner puede llamar esta función
  // addRecyclingCenter(centerAddress)
}
```

---

## 🔧 Hooks Faltantes por Crear

### 1. `useWithdrawFunds`
```typescript
// Para que usuarios retiren fondos de entregas validadas
export function useWithdrawFunds() {
  // Similar a useValidateDelivery
}
```

### 2. `useAddRecyclingCenter` (Owner only)
```typescript
// Para agregar centros autorizados
export function useAddRecyclingCenter() {
  // Solo owner puede usar esto
}
```

### 3. `useRemoveRecyclingCenter` (Owner only)
```typescript
// Para remover centros autorizados
export function useRemoveRecyclingCenter() {
  // Solo owner puede usar esto
}
```

### 4. `useContractStats`
```typescript
// Para obtener estadísticas del contrato
export function useContractStats() {
  const { data: totalEscrowed } = useReadContract({
    functionName: 'getTotalEscrowed'
  })
  const { data: contractBalance } = useReadContract({
    functionName: 'getContractBalance'
  })
  // ...
}
```

### 5. `useCenterDeliveries`
```typescript
// Para obtener entregas de un centro específico
// Nota: No hay función directa en el contrato
// Requiere iterar o usar eventos
```

---

## 📝 Resumen por Prioridad

### Alta Prioridad (Funcionalidad Core):
1. ✅ Integrar `createDelivery` en formulario de solicitud
2. ✅ Integrar `useMyDeliveries` en dashboard de usuario
3. ✅ Integrar `validateDelivery` y `rejectDelivery` en verificación de centro
4. ✅ Crear hook `useWithdrawFunds`

### Media Prioridad:
5. ✅ Mostrar datos reales del contrato en lugar de mocks
6. ✅ Agregar manejo de estados de transacciones (loading, success, error)
7. ✅ Crear hooks para funciones de owner (agregar/remover centros)

### Baja Prioridad:
8. ✅ Estadísticas del contrato
9. ✅ Filtrado de entregas por centro
10. ✅ Eventos del contrato (para updates en tiempo real)

---

## 🚨 Consideraciones Importantes

1. **Centros Autorizados:** Antes de crear entregas, debe existir al menos un centro autorizado. El owner del contrato debe agregarlo con `addRecyclingCenter`.

2. **Conversión de Valores:**
   - Los montos deben estar en ETH (no USD)
   - Usar `parseEther()` para convertir string a wei
   - Usar `formatEther()` para mostrar montos

3. **Estados del Contrato:**
   - Los estados son: `Pending (0)`, `Validated (1)`, `Rejected (2)`, `Completed (3)`
   - Deben mapearse a labels en español

4. **Validaciones:**
   - Verificar que el usuario tenga wallet conectada
   - Verificar que esté en la red correcta (Scroll Sepolia)
   - Verificar que el centro esté autorizado antes de crear entrega

---

## 🎯 Próximos Pasos Recomendados

1. **Integrar creación de entregas** en `app/usuario/solicitar/page.tsx`
2. **Integrar validación/rechazo** en `app/centro/verificar/[id]/page.tsx`
3. **Mostrar entregas reales** en `app/usuario/dashboard/page.tsx`
4. **Crear hook `useWithdrawFunds`** para retirar fondos
5. **Agregar manejo de errores** y estados de loading en todos los componentes

