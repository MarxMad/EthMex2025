# Tokens Oficiales en Arbitrum One (Mainnet)

## 🎯 Direcciones Oficiales para Despliegue en Producción

### USDC (USD Coin) - Arbitrum One Mainnet

**✅ Dirección Oficial Nativa:**
```
0xaf88d065e77c8cC2239327C5EDb3A432268e5831
```

**Características:**
- **Tipo:** USDC Nativo (no bridged)
- **Emisor:** Circle
- **Decimals:** 6
- **Explorador:** [Arbiscan](https://arbiscan.io/address/0xaf88d065e77c8cC2239327C5EDb3A432268e5831)
- **Respaldo:** 1:1 con USD
- **Liquidez:** Alta (miles de millones en TVL)

**⚠️ Alternativa (USDC.e - Bridged):**
```
0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
```
*Nota: USDC nativo es preferido sobre USDC.e bridged*

---

### MXNB (Mexican Peso Stablecoin) - Arbitrum One Mainnet

**✅ Dirección Oficial:**
```
0x59b07aB47481e1B95e15e96b06DfDA50b50F1053
```

**Características:**
- **Tipo:** Stablecoin respaldada por Peso Mexicano
- **Emisor:** Juno (subsidiaria de Bitso)
- **Decimals:** 18 (verificar en el contrato)
- **Explorador:** [Arbiscan](https://arbiscan.io/address/0x59b07aB47481e1B95e15e96b06DfDA50b50F1053)
- **Respaldo:** 1:1 con MXN
- **Disponibilidad:** Nativa en Arbitrum

**⚠️ IMPORTANTE:** Verificar la dirección exacta antes de desplegar:
1. Ve a [Arbiscan Mainnet](https://arbiscan.io)
2. Busca "MXNB" o "Mexican Peso Stablecoin"
3. Verifica que sea el contrato oficial de Juno/Bitso

---

## 🚀 Parámetros de Constructor para Arbitrum One Mainnet

```solidity
constructor(
    0xaf88d065e77c8cC2239327C5EDb3A432268e5831,  // USDC Nativo
    0x59b07aB47481e1B95e15e96b06DfDA50b50F1053,   // MXNB (VERIFICAR ANTES)
    0xTuWalletAddress,                             // Commission Wallet
    100                                            // Commission Rate: 1% (100 basis points)
)
```

### En Remix o Script de Deploy:

```
_usdcToken: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
_mxnbToken: 0x59b07aB47481e1B95e15e96b06DfDA50b50F1053  // ⚠️ VERIFICAR
_commissionWallet: [Tu dirección]
_commissionRate: 100  // 1% = 100, 2% = 200, etc.
```

---

## 📋 Checklist ANTES de Desplegar en Mainnet

### Verificación de Tokens:

- [ ] **USDC:** Verificar que la dirección es `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- [ ] **USDC Decimals:** Confirmar que tiene 6 decimals (ejecutar `decimals()` en el contrato)
- [ ] **MXNB:** Verificar la dirección oficial en [Arbiscan](https://arbiscan.io) buscando "MXNB"
- [ ] **MXNB Decimals:** Verificar cuántos decimals tiene (probablemente 18)
- [ ] **MXNB Symbol:** Confirmar que retorna "MXNB" al llamar `symbol()`
- [ ] **MXNB Total Supply:** Verificar que tiene liquidez disponible

### Verificación de Seguridad:

- [ ] **Commission Wallet:** Usar una wallet multisig o wallet segura (NO una EOA personal)
- [ ] **Commission Rate:** Verificar que el rate es razonable (1-5% típico)
- [ ] **Ownership:** Confirmar que el owner del contrato es seguro
- [ ] **Testing:** Probar TODO en testnet primero (Arbitrum Sepolia)

---

## 💰 Configuración de Precios Post-Deploy

### Para ETH (18 decimals):
```solidity
// Ejemplo: 0.002 ETH/kg = 2000000000000000 wei
setGlobalMaterialPrice("plastico", 0, 2000000000000000)
setGlobalMaterialPrice("papel", 0, 1500000000000000)
setGlobalMaterialPrice("vidrio", 0, 1000000000000000)
setGlobalMaterialPrice("metal", 0, 5000000000000000)
setGlobalMaterialPrice("aluminio", 0, 5000000000000000)
setGlobalMaterialPrice("electronico", 0, 8000000000000000)
```

### Para USDC (6 decimals):
```solidity
// Ejemplo: 2 USDC/kg = 2000000 (6 decimals)
setGlobalMaterialPrice("plastico", 1, 2000000)    // 2.0 USDC/kg
setGlobalMaterialPrice("papel", 1, 1500000)       // 1.5 USDC/kg
setGlobalMaterialPrice("vidrio", 1, 1000000)      // 1.0 USDC/kg
setGlobalMaterialPrice("metal", 1, 5000000)        // 5.0 USDC/kg
setGlobalMaterialPrice("aluminio", 1, 5000000)    // 5.0 USDC/kg
setGlobalMaterialPrice("electronico", 1, 8000000)  // 8.0 USDC/kg
```

### Para MXNB (18 decimals - VERIFICAR):
```solidity
// Ejemplo: 40 MXNB/kg = 40000000000000000000 (18 decimals)
// 40 MXN ≈ 2 USD (aproximadamente)
setGlobalMaterialPrice("plastico", 2, 40000000000000000000)    // 40 MXNB/kg
setGlobalMaterialPrice("papel", 2, 30000000000000000000)       // 30 MXNB/kg
setGlobalMaterialPrice("vidrio", 2, 20000000000000000000)       // 20 MXNB/kg
setGlobalMaterialPrice("metal", 2, 100000000000000000000)      // 100 MXNB/kg
setGlobalMaterialPrice("aluminio", 2, 100000000000000000000)    // 100 MXNB/kg
setGlobalMaterialPrice("electronico", 2, 160000000000000000000) // 160 MXNB/kg
```

---

## 🔍 Cómo Verificar Direcciones Oficiales

### Método 1: Block Explorer (Recomendado)

**USDC:**
1. Ve a [Arbiscan Mainnet](https://arbiscan.io)
2. Busca "USDC" o pega la dirección: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
3. Verifica:
   - ✅ Nombre: "USD Coin" o "USD Coin (USDC)"
   - ✅ Símbolo: "USDC"
   - ✅ Decimals: 6
   - ✅ Verificado en el explorador
   - ✅ Total Supply: Alto (billones)

**MXNB:**
1. Ve a [Arbiscan Mainnet](https://arbiscan.io)
2. Busca "MXNB" o "Mexican Peso"
3. Verifica:
   - ✅ Nombre del contrato
   - ✅ Símbolo: "MXNB"
   - ✅ Emisor: Juno o Bitso
   - ✅ Contrato verificado

### Método 2: Verificar en Remix/Hardhat

```solidity
// Después de deployar, verifica los tokens:
IERC20 usdc = IERC20(0xaf88d065e77c8cC2239327C5EDb3A432268e5831);
string memory symbol = usdc.symbol();  // Debe ser "USDC"
uint8 decimals = usdc.decimals();       // Debe ser 6

IERC20 mxnb = IERC20(0x59b07aB47481e1B95e15e96b06DfDA50b50F1053);
string memory mxnbSymbol = mxnb.symbol();  // Debe ser "MXNB"
uint8 mxnbDecimals = mxnb.decimals();      // Verificar (probablemente 18)
```

---

## ⚠️ IMPORTANTE - Diferencia entre Testnet y Mainnet

### Arbitrum Sepolia (Testnet) - PARA DESARROLLO:
```
USDC: 0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1
MXNB: 0x7911e898d0F91Db0DF9604574878906a3aB3E61e
```

### Arbitrum One (Mainnet) - PARA PRODUCCIÓN:
```
USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
MXNB: 0x59b07aB47481e1B95e15e96b06DfDA50b50F1053  // ⚠️ VERIFICAR
```

**NO mezclar direcciones de testnet con mainnet.**

---

## 📝 Ejemplo Completo de Deploy en Mainnet

### Paso 1: Preparación
```solidity
// Verificar que tienes:
// - USDC address correcta
// - MXNB address verificada
// - Commission wallet segura (multisig recomendado)
// - Commission rate decidido
```

### Paso 2: Deploy (Remix)
```
1. Compilar RecyclingEscrowV3_PreciosPorCentro.sol
2. Seleccionar "Injected Provider - MetaMask"
3. Cambiar a Arbitrum One Mainnet (Chain ID: 42161)
4. Enviar transacción de deploy con:

_usdcToken: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
_mxnbToken: 0x59b07aB47481e1B95e15e96b06DfDA50b50F1053
_commissionWallet: 0xTuWalletMultisig
_commissionRate: 100

5. Confirmar en MetaMask (gas cost será en ETH)
```

### Paso 3: Verificación
```solidity
// Verificar en Arbiscan que el contrato se desplegó correctamente
// Luego verificar los tokens configurados:
contractInstance.usdcToken();     // Debe retornar 0xaf88...
contractInstance.mxnbToken();     // Debe retornar 0x59b0...
contractInstance.commissionRate(); // Debe retornar 100
```

### Paso 4: Configuración Inicial
```solidity
// 1. Agregar centros de reciclaje
contractInstance.addRecyclingCenter(0xCentro1);
contractInstance.addRecyclingCenter(0xCentro2);

// 2. Configurar precios globales (ETH)
contractInstance.setGlobalMaterialPrice("plastico", 0, 2000000000000000);

// 3. Configurar precios globales (USDC)
contractInstance.setGlobalMaterialPrice("plastico", 1, 2000000);

// 4. Configurar precios globales (MXNB) - después de verificar decimals
contractInstance.setGlobalMaterialPrice("plastico", 2, 40000000000000000000);
```

---

## 🎯 Resumen Rápido

**Para desplegar en Arbitrum One Mainnet con tokens reales:**

```solidity
constructor(
    0xaf88d065e77c8cC2239327C5EDb3A432268e5831,  // USDC ✅
    0x59b07aB47481e1B95e15e96b06DfDA50b50F1053,   // MXNB ⚠️ VERIFICAR
    [TuWalletMultisig],                           // Commission
    100                                           // 1%
)
```

**✅ Ventajas de usar tokens reales:**
- Liquidez real disponible
- Usuarios pueden usar USDC/MXNB que ya tienen
- Integración directa sin necesidad de puentes
- Stablecoins estables (no volatilidad de testnet tokens)

**⚠️ Precauciones:**
- Verificar TODAS las direcciones antes de deploy
- Usar multisig para commission wallet
- Probar TODO en testnet primero
- Verificar decimals de cada token antes de configurar precios

