# ⚡ Despliegue Rápido - Remix

## 🎯 Pasos Super Rápidos

### 1. Remix Setup (5 minutos)

```
1. Abre: https://remix.ethereum.org
2. Click en "GitHub" → Pega estas URLs:
   https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/Context.sol
   https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/access/Ownable.sol
   https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/IERC20.sol
   https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/utils/SafeERC20.sol
   https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/ReentrancyGuard.sol

3. Crea: contracts/RecyclingEscrowV2.sol
4. Copia código de RecyclingEscrowV2_Remix.sol
5. Compila (Solc 0.8.24)
```

### 2. Deploy Arbitrum Sepolia

```
ENVIRONMENT: Injected Provider - MetaMask
CONTRACT: RecyclingEscrowV2

Parámetros:
_usdcToken: [Buscar en Arbiscan Sepolia o usar 0x0]
_mxnbToken: 0x0000000000000000000000000000000000000000
_commissionWallet: 0xTuWallet
_commissionRate: 100

→ Deploy → Copiar dirección
```

### 3. Deploy Scroll Sepolia

```
Cambiar MetaMask a Scroll Sepolia (Chain ID: 534351)
Mismo proceso pero con direcciones de Scroll Sepolia
```

### 4. Configurar (Después de Deploy)

```
// Precios en ETH
setMaterialPrice("plastico", 0, 2000000000000000)  // 0.002 ETH
setMaterialPrice("papel", 0, 1500000000000000)     // 0.0015 ETH

// Precios en USDC (si está disponible)
setMaterialPrice("plastico", 1, 2000000)           // 2 USDC

// Agregar centros
addRecyclingCenter(0xCentroAddress)
```

---

## 📍 Direcciones para Guardar

Después de deploy, guarda estas direcciones:

**Arbitrum Sepolia:**
```
Contrato: 0x...
USDC: 0x...
```

**Scroll Sepolia:**
```
Contrato: 0x...
USDC: 0x...
```

**Usar en frontend:** Actualiza `lib/contracts.ts` con las nuevas direcciones.

