# Direcciones de Tokens - Arbitrum y Scroll

## 🌐 Arbitrum Sepolia (Testnet)

### USDC en Arbitrum Sepolia

**✅ Dirección Confirmada:**

```
USDC Arbitrum Sepolia: 0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1
```

**Verificar en:**
- [Arbiscan Sepolia](https://sepolia.arbiscan.io/address/0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1)

### MXNB en Arbitrum Sepolia

**✅ Dirección Confirmada:**

```
MXNB Arbitrum Sepolia: 0x7911e898d0F91Db0DF9604574878906a3aB3E61e
```

**Verificar en:**
- [Arbiscan Sepolia](https://sepolia.arbiscan.io/address/0x7911e898d0F91Db0DF9604574878906a3aB3E61e)

---

## 🌐 Arbitrum One (Mainnet) - Referencia

**Solo para referencia (NO usar en testnet):**

### USDC Native (Mainnet):
```
0xaf88d065e77c8cC2239327C5EDb3A432268e5831
```

### USDC.e (Bridged) (Mainnet):
```
0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
```

**⚠️ NO usar estas direcciones en Sepolia testnet**

---

## 📜 Scroll Sepolia (Testnet)

### USDC en Scroll Sepolia

**Buscar en Scrollscan:**
- Ve a [Scrollscan Sepolia](https://sepolia.scrollscan.com)
- Busca "USDC" en el explorador
- Verifica la dirección del contrato

### MXNB en Scroll Sepolia

**❌ Probablemente no existe**

---

## 🔍 Cómo Verificar Direcciones

### Método 1: Block Explorer

**Arbitrum Sepolia:**
1. Ve a [Arbiscan Sepolia](https://sepolia.arbiscan.io)
2. Busca "USDC" en la barra de búsqueda
3. Verifica que:
   - El contrato esté verificado
   - El nombre sea "USD Coin" o similar
   - El símbolo sea "USDC"
   - Tengan 6 decimals

**Scroll Sepolia:**
1. Ve a [Scrollscan Sepolia](https://sepolia.scrollscan.com)
2. Busca "USDC" 
3. Verifica la información del contrato

### Método 2: Verificar en Remix

Puedes verificar si una dirección es un token válido:

```solidity
// En Remix, después de deployar, usa el contrato IERC20
// address token = 0x...;
// IERC20(token).symbol(); // Debe retornar "USDC"
// IERC20(token).decimals(); // Debe retornar 6 para USDC
```

---

## 🎯 Recomendación para Despliegue

### Opción 1: Usar Address(0) Temporalmente

Si no encuentras los tokens en testnet:

```solidity
constructor(
    address(0),              // USDC - configurar después
    address(0),              // MXNB - configurar después
    0xTuWallet,             // Commission wallet
    100                      // 1% commission
)
```

Luego, cuando tengas las direcciones:
```
setTokenAddress(1, 0xUSDCAddress)  // 1 = USDC
setTokenAddress(2, 0xMXNBAddress)  // 2 = MXNB
```

### Opción 2: Desplegar Tokens de Prueba

Puedes crear tokens ERC20 simples para testing:

```solidity
// Contrato simple de token de prueba
contract TestUSDC {
    string public name = "Test USDC";
    string public symbol = "tUSDC";
    uint8 public decimals = 6;
    // ... implementación básica ERC20
}
```

Después despliega y usa esas direcciones.

### Opción 3: Buscar Faucets de Tokens

Algunos testnets tienen faucets que distribuyen tokens de prueba:
- Busca "Arbitrum Sepolia USDC faucet"
- Busca "Scroll Sepolia token faucet"

---

## 📝 Template para Despliegue

### Arbitrum Sepolia:
```
_usdcToken: 0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1  ✅
_mxnbToken: 0x7911e898d0F91Db0DF9604574878906a3aB3E61e   ✅
_commissionWallet: 0xTuWallet
_commissionRate: 100
```

### Scroll Sepolia:
```
_usdcToken: [Buscar en Scrollscan o usar 0x0]
_mxnbToken: 0x0000000000000000000000000000000000000000
_commissionWallet: 0xTuWallet
_commissionRate: 100
```

---

## ✅ Checklist de Verificación

Antes de desplegar:

- [ ] Verificar si USDC existe en la red de testnet
- [ ] Si existe, copiar dirección exacta
- [ ] Verificar que sea un contrato ERC20 válido
- [ ] Verificar decimals (USDC = 6)
- [ ] Para MXNB: Decidir si usar address(0) o token de prueba
- [ ] Tener plan B si tokens no están disponibles

Después de desplegar:

- [ ] Verificar contrato en block explorer
- [ ] Probar configuración de precios
- [ ] Probar creación de entrega (al menos con ETH)
- [ ] Si usaste address(0), configurar tokens después cuando estén disponibles

