# ✅ Integración Completada - addRecyclingCenter y createDelivery

## 🎉 Funciones Integradas

### 1. ✅ `addRecyclingCenter` - Registro de Centros

**Ubicación:** `app/centro/registro/page.tsx`

**Funcionalidad:**
- El formulario ahora incluye un campo para la dirección de wallet del centro (paso 3)
- Solo el **owner** del contrato puede agregar centros autorizados
- Validación de dirección de wallet (formato 0x...)
- Verificación automática si el usuario conectado es owner
- Mensajes de error claros si no es owner o si falta wallet

**Flujo:**
1. Usuario completa formulario de registro (pasos 1-2)
2. En paso 3, ingresa la dirección de wallet del centro
3. Si es owner, puede hacer clic en "Agregar al Contrato"
4. Se ejecuta `addRecyclingCenter` en el contrato
5. Confirmación cuando el centro es agregado exitosamente

**Hooks utilizados:**
- `useIsOwner()` - Verifica si el usuario es owner
- `useAddRecyclingCenter()` - Agrega el centro al contrato

---

### 2. ✅ `createDelivery` - Solicitud de Recolección

**Ubicación:** `app/usuario/solicitar/page.tsx`

**Funcionalidad:**
- Selector de centro de reciclaje autorizado
- Verificación en tiempo real si el centro está autorizado
- Selección de método de pago (ETH activo, USDC/MXNB próximamente)
- Cálculo automático del precio según material y cantidad
- Validación de wallet conectada
- Validación de centro autorizado antes de crear entrega
- Creación de entrega en blockchain con metadata

**Componentes creados:**
- `components/recycling-center-selector.tsx` - Selector de centros con validación
- `components/ui/alert.tsx` - Componente Alert para mensajes
- `components/ui/select.tsx` - Componente Select para dropdowns

**Flujo:**
1. Usuario selecciona centro de reciclaje
2. Sistema verifica que el centro esté autorizado
3. Usuario completa formulario (material, cantidad, dirección, etc.)
4. Sistema calcula precio automáticamente según material y método de pago
5. Usuario confirma y se crea la entrega en blockchain
6. Redirección automática al dashboard después del éxito

**Hooks utilizados:**
- `useCreateDelivery()` - Crea la entrega en el contrato
- `useIsRecyclingCenter()` - Verifica si el centro está autorizado
- `useMaterialPrice()` - Obtiene el precio del material
- `useAccount()` - Obtiene información de la wallet conectada

---

## 📋 Archivos Modificados/Creados

### Nuevos Hooks:
- `useIsOwner()` - Verificar si es owner
- `useAddRecyclingCenter()` - Agregar centro
- `useMaterialPrice()` - Obtener precio de material

### Componentes Nuevos:
- `components/recycling-center-selector.tsx` - Selector de centros
- `components/ui/alert.tsx` - Componente de alertas
- `components/ui/select.tsx` - Componente de selección

### Archivos Modificados:
- `lib/hooks/use-recycling-contract.ts` - Hooks actualizados
- `app/centro/registro/page.tsx` - Integración de addRecyclingCenter
- `app/usuario/solicitar/page.tsx` - Integración de createDelivery

---

## ⚙️ Configuración Necesaria

### 1. Lista de Centros Autorizados

**Archivo:** `components/recycling-center-selector.tsx`

La lista de centros está hardcodeada inicialmente. Cuando agregues centros con `addRecyclingCenter`, actualiza esta lista:

```typescript
export const RECYCLING_CENTERS: Array<{ address: `0x${string}`, name: string }> = [
  { address: "0x...", name: "EcoCenter CDMX" },
  { address: "0x...", name: "ReciclaVerde Norte" },
  // Agregar más centros aquí
]
```

**Mejora Futura:** Implementar obtención automática desde eventos del contrato.

### 2. Precios de Materiales

Los precios deben configurarse en el contrato antes de que los usuarios puedan crear entregas. Usa `setMaterialPrice()` en el contrato:

```solidity
// Ejemplo en Remix o con el owner:
setMaterialPrice("plastico", 0, 2000000000000000)  // 0.002 ETH/kg
setMaterialPrice("papel", 0, 1500000000000000)     // 0.0015 ETH/kg
// etc.
```

---

## 🔄 Flujo Completo del Sistema

### Para Agregar un Centro:

1. **Owner** va a `/centro/registro`
2. Completa formulario de información
3. Ingresa dirección de wallet del centro en paso 3
4. Conecta su wallet (debe ser owner)
5. Hace clic en "Agregar al Contrato"
6. Transacción en blockchain → Centro autorizado ✅
7. **Actualizar lista en `recycling-center-selector.tsx`** (por ahora)

### Para Crear una Entrega:

1. **Usuario** va a `/usuario/solicitar`
2. Conecta su wallet
3. Selecciona centro autorizado del dropdown
4. Sistema verifica que el centro esté autorizado ✅
5. Selecciona material y cantidad
6. Sistema calcula precio automáticamente
7. Selecciona método de pago (ETH)
8. Completa dirección y notas
9. Confirma → Transacción en blockchain
10. Entrega creada con pago en escrow ✅

---

## 📝 Notas Importantes

1. **Lista de Centros:** Por ahora es hardcodeada. Idealmente debería obtenerse desde eventos del contrato o un servicio off-chain.

2. **Precios:** Deben configurarse en el contrato antes de usar. El frontend muestra "No configurado" si no hay precio.

3. **Metadata:** La información adicional (dirección, fecha, hora, notas) se guarda como JSON string en el campo `metadata` del contrato.

4. **Validaciones:** 
   - Wallet debe estar conectada
   - Centro debe estar autorizado
   - Precio debe estar configurado
   - Cantidad debe ser > 0

5. **USDC/MXNB:** Están en el código pero deshabilitados. Se pueden habilitar cuando se implementen los approvals de tokens ERC20.

---

## 🚀 Próximos Pasos

1. ✅ **Completado:** addRecyclingCenter integrado
2. ✅ **Completado:** createDelivery integrado
3. ⏳ **Pendiente:** Actualizar feeds/listas para mostrar centros nuevos
4. ⏳ **Pendiente:** Implementar obtención automática de centros desde contrato
5. ⏳ **Pendiente:** Integrar validateDelivery y rejectDelivery en centro
6. ⏳ **Pendiente:** Mostrar entregas reales en dashboard usuario

---

## 🧪 Testing

Para probar:

1. **Como Owner:**
   - Conectar wallet del owner
   - Ir a `/centro/registro`
   - Completar formulario
   - Agregar dirección de wallet del centro
   - Verificar que se agregue exitosamente

2. **Como Usuario:**
   - Conectar wallet
   - Ir a `/usuario/solicitar`
   - Seleccionar centro (si hay alguno en la lista)
   - Completar formulario
   - Verificar que se cree la entrega en blockchain

**Nota:** Necesitas tener precios configurados en el contrato para que funcione correctamente.

