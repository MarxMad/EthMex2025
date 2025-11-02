# 🔍 ¿Los Centros de Reciclaje se Eliminan Automáticamente?

## ❌ NO, los centros NO se eliminan automáticamente

Los centros de reciclaje **NO se eliminan** después de crear solicitudes. Solo pueden ser removidos manualmente por el **owner del contrato**.

## 📋 Cómo Funciona

### 1. **Los Centros Permanecen en el Contrato**

Una vez que un centro es agregado con `addRecyclingCenter()`:
- ✅ El centro queda registrado permanentemente en el contrato
- ✅ Puede recibir entregas indefinidamente
- ✅ Sus precios configurados se mantienen
- ✅ NO se elimina automáticamente al crear solicitudes

### 2. **Solo el Owner Puede Remover Centros**

```solidity
function removeRecyclingCenter(address _center) external onlyOwner {
    require(recyclingCenters[_center], "Center not authorized");
    recyclingCenters[_center] = false;  // Solo cambia el flag a false
    emit RecyclingCenterRemoved(_center);
}
```

**Solo el owner del contrato** puede remover centros llamando a esta función.

### 3. **Qué Pasa si un Centro es Removido**

Si un centro es removido:
- ❌ **NO puede recibir nuevas entregas** (createDelivery fallará)
- ⚠️ Las entregas **existentes** seguirán funcionando (el centro puede validar/rechazar)
- 📊 Los precios configurados **se mantienen** en el storage (pero no se pueden usar)

### 4. **Cómo se Carga la Lista en el Frontend**

El frontend carga los centros de dos formas:

1. **Eventos históricos**: Busca eventos `RecyclingCenterAdded` y `RecyclingCenterRemoved` desde el bloque 0
2. **Eventos en tiempo real**: Escucha nuevos eventos `RecyclingCenterAdded` y `RecyclingCenterRemoved`

```typescript
// Hook useRecyclingCenters() hace esto:
// 1. Busca eventos RecyclingCenterAdded
// 2. Busca eventos RecyclingCenterRemoved  
// 3. Crea un Set: added - removed = centros activos
// 4. Escucha eventos nuevos en tiempo real
```

## 🔍 Posibles Razones por las que Parecen "Desaparecer"

### Problema 1: Error en Carga de Eventos
Si hay un error al cargar eventos del contrato, los centros pueden no aparecer aunque existan.

**Solución**: Revisar la consola del navegador para errores de RPC.

### Problema 2: Centro Removido por Owner
Si el owner del contrato llamó a `removeRecyclingCenter()`, el centro será removido.

**Solución**: Verificar en Arbiscan si hay eventos `RecyclingCenterRemoved`.

### Problema 3: Problema con RPC
Si el RPC no puede leer eventos, los centros no se cargan.

**Solución**: Ya se cambió a PublicNode que tiene mejor soporte.

### Problema 4: Filtrado por Red
Los centros se filtran por `chainId` para evitar mostrar centros de otras redes.

**Solución**: Asegurarse de estar en la red correcta (Arbitrum Sepolia).

## ✅ Verificar si un Centro Existe en el Contrato

Puedes verificar directamente en Arbiscan:

1. Ve a: `https://sepolia.arbiscan.io/address/0x9eac6fff8014b159bd930cb526c3059a1a65e298`
2. Pestaña **"Read Contract"**
3. Busca `recyclingCenters`
4. Ingresa la dirección del centro
5. Si retorna `true`, el centro existe y está autorizado

## 📊 Estado Actual

- ✅ Centros **NO se eliminan automáticamente**
- ✅ Centros **permanecen** después de crear solicitudes
- ✅ Solo el **owner** puede removerlos manualmente
- ✅ El frontend carga centros desde **eventos del contrato**

Si los centros "desaparecen", es probablemente un problema de:
- Carga de eventos (error RPC)
- El owner los removió
- Problema de filtrado en el frontend

