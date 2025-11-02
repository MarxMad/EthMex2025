# Parámetros de Despliegue - Quick Reference

## 🚀 Valores Recomendados para Deploy

### Arbitrum One (Mainnet) - PRODUCCIÓN

```solidity
constructor(
    0xaf88d065e77c8cC2239327C5EDb3A432268e5831,  // _usdcToken: USDC Arbitrum One ✅ OFICIAL
    0x59b07aB47481e1B95e15e96b06DfDA50b50F1053,   // _mxnbToken: MXNB Arbitrum One ⚠️ VERIFICAR
    0xTuDireccionMetaMask,                        // _commissionWallet: Tu wallet (usar multisig recomendado)
    100                                           // _commissionRate: 1% (100 basis points)
)
```

**Direcciones Oficiales Mainnet:**
- ✅ **USDC:** `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` (USDC Nativo - Oficial de Circle)
- ⚠️ **MXNB:** `0x59b07aB47481e1B95e15e96b06DfDA50b50F1053` (Verificar antes de usar)

**Características:**
- USDC tiene **6 decimals**
- MXNB tiene **18 decimals** (verificar en el contrato)
- Ambos son tokens reales con liquidez en mainnet

**📋 Ver:** `ARBITRUM_MAINNET_TOKENS.md` para detalles completos

---

### Arbitrum Sepolia (Testnet)

```solidity
constructor(
    0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1,  // _usdcToken: USDC Arbitrum Sepolia ✅
    0x7911e898d0F91Db0DF9604574878906a3aB3E61e,   // _mxnbToken: MXNB Arbitrum Sepolia ✅
    0xTuDireccionMetaMask,                        // _commissionWallet: Tu wallet
    100                                           // _commissionRate: 1% (100 basis points)
)
```

**Direcciones Confirmadas:**
- ✅ **USDC:** `0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1`
- ✅ **MXNB:** `0x7911e898d0F91Db0DF9604574878906a3aB3E61e`

**Pasos:**
1. ✅ USDC y MXNB ya tienen direcciones confirmadas
2. **Commission:** Ajusta según necesites (100 = 1%, 200 = 2%, etc.)
3. Reemplaza `0xTuDireccionMetaMask` con tu wallet address

---

### Scroll Sepolia

```solidity
constructor(
    address(0),                    // _usdcToken: Verificar en Scrollscan o usar 0x0
    0x0000000000000000000000000000000000000000,  // _mxnbToken: No existe, usar 0x0
    0xTuDireccionMetaMask,         // _commissionWallet: Misma wallet que Arbitrum
    100                            // _commissionRate: 1%
)
```

**Pasos:**
1. **Buscar USDC:** Ve a [Scrollscan Sepolia](https://sepolia.scrollscan.com) → Busca "USDC"
2. **Si encuentras:** Usa esa dirección, si no: usa `address(0)`
3. **MXNB:** Siempre usar `address(0)`

---

## 💰 Configuración de Precios (Post-Deploy)

### Para ETH (en wei):

```solidity
// Ejemplos (0.002 ETH = 2000000000000000 wei)
setMaterialPrice("plastico", 0, 2000000000000000)    // 0.002 ETH/kg
setMaterialPrice("papel", 0, 1500000000000000)       // 0.0015 ETH/kg
setMaterialPrice("vidrio", 0, 1000000000000000)      // 0.001 ETH/kg
setMaterialPrice("metal", 0, 5000000000000000)       // 0.005 ETH/kg
setMaterialPrice("aluminio", 0, 5000000000000000)    // 0.005 ETH/kg
setMaterialPrice("electronico", 0, 8000000000000000)  // 0.008 ETH/kg
```

### Para USDC (6 decimals):

```solidity
// Ejemplos (2 USDC = 2000000)
setMaterialPrice("plastico", 1, 2000000)    // 2 USDC/kg
setMaterialPrice("papel", 1, 1500000)       // 1.5 USDC/kg
setMaterialPrice("vidrio", 1, 1000000)      // 1 USDC/kg
setMaterialPrice("metal", 1, 5000000)      // 5 USDC/kg
setMaterialPrice("aluminio", 1, 5000000)    // 5 USDC/kg
setMaterialPrice("electronico", 1, 8000000)  // 8 USDC/kg
```

### Para MXNB (si tiene 18 decimals como ETH):

```solidity
// Ejemplos (2 MXNB = 2000000000000000000)
setMaterialPrice("plastico", 2, 2000000000000000000)    // 2 MXNB/kg
// ... similar a ETH
```

**Nota:** Solo configura precios para tokens que hayas configurado. Si usaste `address(0)`, primero configura con `setTokenAddress()`.

---

## 🔧 Configuración de Tokens (Si usaste address(0))

Después de obtener direcciones reales:

```solidity
// Para USDC
setTokenAddress(
    1,                          // PaymentToken.USDC
    0xUSDCAddressEnLaRed       // Dirección real
)

// Para MXNB (si está disponible)
setTokenAddress(
    2,                          // PaymentToken.MXNB
    0xMXNBAddressEnLaRed        // Dirección real
)
```

---

## 📋 Valores por Defecto Sugeridos

### Commission Rate:
- **100** = 1% (recomendado para empezar)
- **200** = 2%
- **500** = 5%
- **Máximo: 1000** = 10%

### Material Types (strings):
- `"plastico"` - Plástico
- `"papel"` - Papel/Cartón
- `"vidrio"` - Vidrio
- `"metal"` - Metal
- `"aluminio"` - Aluminio
- `"electronico"` - Electrónico

**Importante:** Los strings son case-sensitive. Usa siempre minúsculas para consistencia.

---

## 🎯 Ejemplo Completo de Deploy

### En Remix - Arbitrum Sepolia:

1. **Compilar** el contrato
2. **Seleccionar** "Injected Provider - MetaMask"
3. **Verificar** Chain ID: 421614 (Arbitrum Sepolia)
4. **Deploy** con:

```
0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1  // USDC Arbitrum Sepolia ✅
0x7911e898d0F91Db0DF9604574878906a3aB3E61e   // MXNB Arbitrum Sepolia ✅
0xTuDireccionMetaMask                       // Tu wallet (reemplazar)
100                                          // 1% commission
```

5. **Después de deploy:**
   - Configurar precios con `setMaterialPrice()`
   - Agregar centros con `addRecyclingCenter()`
   - ✅ Tokens ya configurados, no necesitas `setTokenAddress()`

---

## ⚠️ Notas Importantes

1. **En Testnet:** Los tokens pueden no estar disponibles. Usa `address(0)` y configura después.

2. **Verificación:** Siempre verifica direcciones en el block explorer antes de usar.

3. **Decimals:** 
   - ETH: 18 decimals
   - USDC: 6 decimals (en mayoría de redes)
   - MXNB: Verificar (probablemente 18)

4. **Commission Wallet:** Usa una wallet que controles. Puedes cambiarla después con `setCommissionWallet()`.

5. **Testing:** Empieza con precios bajos para testing (ej: 0.0001 ETH/kg) para ahorrar gas.

