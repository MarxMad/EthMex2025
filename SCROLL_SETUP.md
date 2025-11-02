# Configuración de Scroll Sepolia

## ✅ Estado Actual

Scroll Sepolia ya está configurado en el proyecto. Solo necesitas:

1. **Proporcionar la dirección del contrato desplegado en Scroll Sepolia**

## 📝 Pasos para Completar

### 1. Obtener la Dirección del Contrato

Una vez que hayas desplegado el contrato en Scroll Sepolia, copia la dirección del contrato.

### 2. Actualizar la Dirección

Edita el archivo `lib/contracts.ts` y actualiza la línea:

```typescript
export const RECYCLING_CONTRACT_ADDRESSES = {
  arbitrumSepolia: '0x9eac6fff8014b159bd930cb526c3059a1a65e298' as const,
  scrollSepolia: 'TU_DIRECCION_AQUI' as const, // ⬅️ Actualiza esto
} as const
```

### 3. Listo! 🎉

El sistema automáticamente:
- ✅ Detecta la chain activa (Arbitrum Sepolia o Scroll Sepolia)
- ✅ Usa la dirección correcta del contrato según la chain
- ✅ Permite cambiar entre chains usando el selector de RainbowKit

## 🔄 Cómo Cambiar de Chain

El usuario puede cambiar de chain usando:
- El selector de chain en el botón de conexión de RainbowKit (ConnectButton)
- O manualmente desde su wallet (MetaMask, etc.)

El sistema detecta automáticamente la chain activa y usa la dirección correcta del contrato.

## 🌐 Chain IDs

- **Arbitrum Sepolia**: `421614`
- **Scroll Sepolia**: `534351`

## 📍 Dónde se Usa

La función `getContractAddress(chainId)` se llama automáticamente en todos los hooks:
- `useCreateDelivery()`
- `useAcceptDelivery()`
- `useRecyclingCenters()`
- `useValidateDelivery()`
- `useRejectDelivery()`
- Y todos los demás hooks del contrato

No necesitas hacer nada más una vez que actualices la dirección en `contracts.ts`.

