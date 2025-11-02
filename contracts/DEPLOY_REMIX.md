# 🚀 Guía Rápida: Desplegar V2 en Remix - Arbitrum y Scroll

## ⚡ Pasos Rápidos

### 1️⃣ Importar OpenZeppelin en Remix

**Método más fácil - GitHub Import:**

1. Abre [Remix IDE](https://remix.ethereum.org)
2. En el panel izquierdo, haz click en el ícono **"GitHub"**
3. Pega estas URLs una por una (Remix las descargará automáticamente):

```
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/Context.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/access/Ownable.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/IERC20.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/utils/SafeERC20.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/ReentrancyGuard.sol
```

4. Espera a que Remix descargue los archivos (verás una carpeta `@openzeppelin`)

### 2️⃣ Crear el Contrato

1. Crea un archivo `RecyclingEscrowV2.sol` en la carpeta `contracts`
2. Copia el código completo de `RecyclingEscrowV2_Remix.sol`
3. Guarda (Ctrl+S)

### 3️⃣ Compilar

1. Ve a **"Solidity Compiler"** (ícono de Solidity)
2. Compiler: **0.8.24** (o superior)
3. Click en **"Compile RecyclingEscrowV2.sol"**
4. Verifica que no haya errores (✅ verde)

---

## 🌐 Desplegar en ARBITRUM SEPOLIA

### Paso 1: Configurar MetaMask

1. Agrega red Arbitrum Sepolia:
   - Nombre: `Arbitrum Sepolia`
   - RPC: `https://sepolia-rollup.arbitrum.io/rpc`
   - Chain ID: `421614`
   - Símbolo: `ETH`
   - Explorer: `https://sepolia.arbiscan.io`

2. Conecta MetaMask a Arbitrum Sepolia
3. Obtén ETH: [Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

### Paso 2: Buscar Direcciones de Tokens

**En [Arbiscan Sepolia](https://sepolia.arbiscan.io):**
- Busca "USDC" - copia la dirección del contrato
- Si no existe MXNB, usa: `0x0000000000000000000000000000000000000000`

### Paso 3: Deploy en Remix

1. Ve a **"Deploy & Run Transactions"**
2. **ENVIRONMENT:** Selecciona **"Injected Provider - MetaMask"**
3. Verifica que MetaMask esté en **Arbitrum Sepolia** (Chain ID: 421614)

4. **CONTRACT:** Selecciona `RecyclingEscrowV2`

5. **DEPLOY** - Ingresa los parámetros:

```
_usdcToken: 0x... (dirección USDC en Arbitrum Sepolia)
           [O usa: 0x0000000000000000000000000000000000000000 si no existe]

_mxnbToken: 0x... (dirección MXNB)
           [O usa: 0x0000000000000000000000000000000000000000 si no existe]

_commissionWallet: 0xTuDireccionMetaMask (tu wallet que recibirá comisiones)

_commissionRate: 100 (1% = 100 basis points)
                [Ajusta según necesites: 100=1%, 200=2%, etc.]
```

**Ejemplo:**
```
0x75faf114eafb1BDbe2F0316DF893fd58CE51aa82  // USDC (VERIFICA)
0x0000000000000000000000000000000000000000  // MXNB (placeholder)
0xTuWalletAddress                           // Tu wallet
100                                          // 1%
```

6. Click en **"Deploy"**
7. Confirma en MetaMask
8. **COPIA LA DIRECCIÓN DEL CONTRATO** - la necesitarás después

---

## 📜 Desplegar en SCROLL SEPOLIA

### Paso 1: Configurar MetaMask

1. Agrega red Scroll Sepolia:
   - Nombre: `Scroll Sepolia`
   - RPC: `https://sepolia-rpc.scroll.io`
   - Chain ID: `534351`
   - Símbolo: `ETH`
   - Explorer: `https://sepolia.scrollscan.com`

2. Conecta MetaMask a Scroll Sepolia
3. Obtén ETH: [Faucet](https://sepolia.scrollscan.com)

### Paso 2: Buscar Direcciones de Tokens

**En [Scrollscan Sepolia](https://sepolia.scrollscan.com):**
- Busca "USDC" - copia la dirección
- Si no existe MXNB, usa: `0x0000000000000000000000000000000000000000`

### Paso 3: Deploy en Remix

1. **Cambia MetaMask a Scroll Sepolia**
2. En Remix, verifica que esté en Scroll Sepolia
3. Usa los mismos parámetros pero con direcciones de Scroll Sepolia:

```
_usdcToken: 0x... (USDC en Scroll Sepolia)
_mxnbToken: 0x... (MXNB o 0x0)
_commissionWallet: 0xTuWallet (misma que antes)
_commissionRate: 100
```

4. **Deploy** y guarda la dirección del contrato

---

## ⚙️ Configuración Post-Deploy (AMBAS REDES)

Después de desplegar en cada red, configura el contrato:

### 1. Configurar Precios

En Remix, expande el contrato desplegado y usa `setMaterialPrice`:

**Para ETH (0.002 ETH/kg = 2000000000000000 wei):**
```
setMaterialPrice(
    "plastico",    // _materialType
    0,             // _token (0=ETH, 1=USDC, 2=MXNB)
    2000000000000000  // _pricePerKg (0.002 ETH en wei)
)
```

**Para USDC (2 USDC/kg, asumiendo 6 decimals = 2000000):**
```
setMaterialPrice(
    "plastico",
    1,             // USDC
    2000000        // 2 USDC (2 * 10^6)
)
```

**Materiales a configurar:**
- `"plastico"` - 0.002 ETH o 2 USDC
- `"papel"` - 0.0015 ETH o 1.5 USDC
- `"vidrio"` - 0.001 ETH o 1 USDC
- `"metal"` - 0.005 ETH o 5 USDC
- `"aluminio"` - 0.005 ETH o 5 USDC
- `"electronico"` - 0.008 ETH o 8 USDC

### 2. Agregar Centros Autorizados

```
addRecyclingCenter(0xDireccionDelCentro)
```

Repite para cada centro que necesites autorizar.

### 3. Configurar Tokens (si usaste address(0))

Si inicialmente usaste `address(0)` para MXNB o USDC:

```
setTokenAddress(
    1,              // 1=USDC, 2=MXNB
    0xNuevaDireccion
)
```

---

## 📋 Checklist de Despliegue

### Arbitrum Sepolia:
- [ ] OpenZeppelin importado en Remix
- [ ] Contrato compilado sin errores
- [ ] MetaMask en Arbitrum Sepolia (Chain ID: 421614)
- [ ] ETH suficiente para gas
- [ ] Direcciones de tokens obtenidas
- [ ] Contrato desplegado
- [ ] Dirección del contrato guardada
- [ ] Precios configurados
- [ ] Centros agregados

### Scroll Sepolia:
- [ ] MetaMask en Scroll Sepolia (Chain ID: 534351)
- [ ] ETH suficiente para gas
- [ ] Direcciones de tokens obtenidas
- [ ] Contrato desplegado
- [ ] Dirección del contrato guardada
- [ ] Precios configurados
- [ ] Centros agregados

---

## 🔍 Verificar Despliegue

### Arbitrum:
- [Arbiscan Sepolia](https://sepolia.arbiscan.io) → Busca tu dirección del contrato

### Scroll:
- [Scrollscan Sepolia](https://sepolia.scrollscan.com) → Busca tu dirección del contrato

---

## 📝 Notas Importantes

1. **Si los tokens no existen:** Usa `address(0)` y configura después con `setTokenAddress()`

2. **Precios en wei/token units:**
   - ETH: 0.002 ETH = `2000000000000000` wei
   - USDC (6 decimals): 2 USDC = `2000000`
   - MXNB (verificar decimals): Probablemente 18 = `2000000000000000000`

3. **Comisión:** 
   - 100 = 1%
   - 200 = 2%
   - Máximo: 1000 = 10%

4. **Después del deploy:**
   - Actualiza `RECYCLING_CONTRACT_ADDRESS` en el frontend
   - Actualiza el ABI con el nuevo contrato
   - Configura precios y centros antes de usar

---

## 🆘 Solución de Problemas

**Error: "Cannot find imported contract"**
→ Importa OpenZeppelin desde GitHub en Remix

**Error: "Insufficient funds"**
→ Obtén más ETH en el faucet

**Error al compilar:**
→ Verifica versión Solidity 0.8.24
→ Verifica que todos los imports estén presentes

**Contrato no aparece después de deploy:**
→ Recarga Remix o verifica en el block explorer

