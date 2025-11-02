# 🚧 Lo que Falta para Completar el Flujo

## 📋 Análisis del Dashboard del Recolector

Actualmente el dashboard del recolector **solo muestra**:
- ✅ Solicitudes disponibles (sin recolector asignado)
- ✅ Botón para aceptar entregas
- ❌ Historial estático (datos hardcodeados)

## ❌ Lo que FALTA Implementar

### 1. **Sección: "Mis Recolecciones Aceptadas"**
**Estado**: Entregas que el recolector aceptó pero aún están pendientes

**Qué necesitas:**
- Hook: `useCollectorAcceptedDeliveries()` que filtre entregas donde:
  - `delivery.collector === address` (recolector conectado)
  - `delivery.status === DeliveryStatus.Pending`
- Mostrar:
  - Material, cantidad, usuario
  - Dirección y fecha/hora
  - Botón "Ver Detalles" o "Ir a recoger"
  - Estado: "Esperando validación del centro"

### 2. **Sección: "Completadas/Validadas"**
**Estado**: Entregas validadas por el centro (usuario recibió pago)

**Qué necesitas:**
- Hook: `useCollectorValidatedDeliveries()` que filtre:
  - `delivery.collector === address`
  - `delivery.status === DeliveryStatus.Validated`
- Mostrar:
  - Material, cantidad, usuario
  - Fecha de validación
  - Pago (ya fue liberado al usuario)
  - Badge "Completada"

### 3. **Sección: "Rechazadas"**
**Estado**: Entregas rechazadas por el centro (recolector recibe reembolso)

**Qué necesitas:**
- Hook: `useCollectorRejectedDeliveries()` que filtre:
  - `delivery.collector === address`
  - `delivery.status === DeliveryStatus.Rejected`
- Mostrar:
  - Material, cantidad, usuario
  - Razón de rechazo (`delivery.rejectionReason`)
  - Reembolso recibido (o pendiente)
  - Badge "Rechazada"

### 4. **Historial Real desde el Contrato**
**Estado actual**: Datos hardcodeados en `useState`

**Qué necesitas:**
- Reemplazar el `historial` estático por datos del contrato
- Combinar entregas validadas y rechazadas
- Mostrar ordenadas por fecha (más recientes primero)

### 5. **Hooks Faltantes**

Necesitas crear en `/lib/hooks/use-recycling-contract.ts`:

```typescript
// Entregas aceptadas por este recolector (pendientes de validación)
export function useCollectorAcceptedDeliveries() {
  const { address } = useAccount()
  // Filtrar entregas donde collector === address y status === Pending
}

// Entregas validadas por este recolector
export function useCollectorValidatedDeliveries() {
  const { address } = useAccount()
  // Filtrar entregas donde collector === address y status === Validated
}

// Entregas rechazadas por este recolector
export function useCollectorRejectedDeliveries() {
  const { address } = useAccount()
  // Filtrar entregas donde collector === address y status === Rejected
}

// Todas las entregas del recolector (combinadas)
export function useCollectorAllDeliveries() {
  // Combinar todas las entregas del recolector
}
```

### 6. **Integración con Páginas Existentes**

Tienes estas páginas pero no están conectadas al contrato:
- `/recolector/en-ruta/page.tsx` - Debería mostrar entregas aceptadas
- `/recolector/completar/page.tsx` - Debería permitir marcar como completada (pero esto es off-chain, el centro valida)
- `/recolector/pagos/page.tsx` - Debería mostrar entregas validadas y rechazadas

## 🎯 Estructura Recomendada del Dashboard

```typescript
// Dashboard del Recolector debería tener:

1. Stats Cards (ya existe pero con datos estáticos)
   - Recolecciones totales → useCollectorAllDeliveries().length
   - Ganado → Sumar paymentAmount de entregas validadas
   - En proceso → useCollectorAcceptedDeliveries().length
   - Completadas → useCollectorValidatedDeliveries().length

2. Tab 1: "Solicitudes Disponibles" (ya existe)
   - Entregas sin recolector asignado

3. Tab 2: "Mis Recolecciones" (NUEVO)
   - Entregas aceptadas y pendientes de validación

4. Tab 3: "Completadas" (NUEVO)
   - Entregas validadas por el centro

5. Tab 4: "Rechazadas" (NUEVO)
   - Entregas rechazadas (con reembolso al recolector)

6. Historial (actualizar con datos reales)
   - Combinar completadas + rechazadas
```

## 🔄 Flujo Completo Esperado

1. **Usuario crea solicitud** ✅
2. **Recolector acepta** ✅ → Aparece en "Mis Recolecciones"
3. **Recolector recoge material** (off-chain, no hay función en contrato)
4. **Recolector entrega al centro** (off-chain)
5. **Centro valida** ✅ → Entregas aparecen en "Completadas"
6. **Centro rechaza** ✅ → Entregas aparecen en "Rechazadas", recolector recibe reembolso

## ⚠️ Nota Importante

El contrato NO tiene una función para que el recolector "marque como completada". Solo el centro puede:
- `validateDelivery()` → Libera dinero al usuario
- `rejectDelivery()` → Devuelve dinero al recolector

Por lo tanto, el estado "en ruta" o "completada" es solo informativo en el frontend, el estado real viene del contrato.

