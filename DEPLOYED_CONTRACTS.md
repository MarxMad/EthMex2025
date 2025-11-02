# Contratos Desplegados - RecyclingEscrowV2

## 🌐 Arbitrum Sepolia

**✅ Contrato Desplegado:**

```
Dirección: 0x83501eae542748590639649f2e951b653c509b1b
Red: Arbitrum Sepolia
Chain ID: 421614
Explorador: https://sepolia.arbiscan.io/address/0x83501eae542748590639649f2e951b653c509b1b
```

**Tokens Configurados:**
- USDC: `0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1`
- MXNB: `0x7911e898d0F91Db0DF9604574878906a3aB3E61e`

---

## 📜 Scroll Sepolia

**⏳ Pendiente de Despliegue**

```
Dirección: [Se actualizará cuando se despliegue]
Red: Scroll Sepolia
Chain ID: 534351
Explorador: https://sepolia.scrollscan.com/address/[address]
```

**Tokens:** [Por configurar]

---

## 📝 Configuración Actual

### Archivo: `lib/contracts.ts`

El archivo de contratos está configurado para usar **Arbitrum Sepolia** por defecto:

```typescript
export const RECYCLING_CONTRACT_ADDRESSES = {
  arbitrumSepolia: '0x83501eae542748590639649f2e951b653c509b1b',
  scrollSepolia: '', // Se actualizará cuando se despliegue
}

export const RECYCLING_CONTRACT_ADDRESS = RECYCLING_CONTRACT_ADDRESSES.arbitrumSepolia
```

### Para Cambiar de Red

Si quieres cambiar entre redes, actualiza `RECYCLING_CONTRACT_ADDRESS`:

```typescript
// Para usar Arbitrum Sepolia
export const RECYCLING_CONTRACT_ADDRESS = RECYCLING_CONTRACT_ADDRESSES.arbitrumSepolia

// Para usar Scroll Sepolia (después del deploy)
export const RECYCLING_CONTRACT_ADDRESS = RECYCLING_CONTRACT_ADDRESSES.scrollSepolia
```

---

## 🔄 Próximos Pasos

1. ✅ Arbitrum Sepolia desplegado
2. ⏳ Esperando deploy en Scroll Sepolia
3. ⏳ Actualizar dirección de Scroll cuando esté lista
4. ⏳ Actualizar configuración de wagmi si se necesita soporte multi-red

---

## 📋 Notas

- El ABI completo está actualizado en `lib/contracts.ts`
- Los tipos TypeScript incluyen `PaymentToken` y `metadata`
- La estructura `Delivery` ahora incluye todos los campos del V2

