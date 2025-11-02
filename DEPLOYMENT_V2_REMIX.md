# Guía de Despliegue V2 en Remix - Arbitrum y Scroll

## 📋 Pre-requisitos

### 1. Dependencias OpenZeppelin

El contrato V2 requiere OpenZeppelin Contracts. En Remix puedes importarlos directamente:

**Opción A: Usar GitHub Import en Remix**
1. En Remix, crea un nuevo archivo
2. Click en "GitHub" en el explorador de archivos
3. Importa: `https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/IERC20.sol`
4. Repite para:
   - `contracts/token/ERC20/utils/SafeERC20.sol`
   - `contracts/security/ReentrancyGuard.sol`
   - `contracts/access/Ownable.sol`
   - `contracts/utils/Context.sol` (requerido por Ownable)

**Opción B: Copiar código directamente**
Si prefieres, puedes crear los archivos necesarios directamente en Remix.

### 2. Direcciones de Tokens

Necesitas las direcciones de USDC y MXNB en cada red:

#### Arbitrum Sepolia:
- **USDC**: `0x...` (Verificar en [Arbiscan Sepolia](https://sepolia.arbiscan.io))
- **MXNB**: `0x...` (Si no existe, usa `address(0)` temporalmente)

#### Scroll Sepolia:
- **USDC**: `0x...` (Verificar en [Scrollscan Sepolia](https://sepolia.scrollscan.com))
- **MXNB**: `0x...` (Si no existe, usa `address(0)` temporalmente)

**Nota:** Si los tokens no existen en la red de prueba, puedes:
- Usar `address(0)` temporalmente
- Después configurar las direcciones con `setTokenAddress()` cuando estén disponibles
- O desplegar tokens de prueba primero

---

## 🚀 Paso 1: Preparar el Contrato en Remix

### 1.1 Abrir Remix
1. Ve a [Remix IDE](https://remix.ethereum.org)
2. Crea una nueva carpeta `contracts` si no existe

### 1.2 Importar OpenZeppelin Contracts

**Método Recomendado - GitHub Import:**

1. En el panel izquierdo, haz click en el ícono "GitHub"
2. En el input, pega estas URLs una por una:

```
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/Context.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/access/Ownable.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/IERC20.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/utils/SafeERC20.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/ReentrancyGuard.sol
```

3. Remix descargará automáticamente los archivos

### 1.3 Crear el Contrato

1. Crea un nuevo archivo `RecyclingEscrowV2.sol` en la carpeta `contracts`
2. Copia y pega el código completo del contrato
3. Guarda el archivo (Ctrl+S)

---

## 🔧 Paso 2: Compilar el Contrato

### 2.1 Configurar Compilador

1. Ve a la pestaña **"Solidity Compiler"** (ícono de Solidity)
2. Selecciona **Compiler**: `0.8.24` o superior
3. Selecciona **EVM Version**: `paris` o `default`

### 2.2 Compilar

1. Haz click en **"Compile RecyclingEscrowV2.sol"**
2. Espera a que compile (debe mostrar ✅ sin errores)

**Si hay errores:**
- Verifica que todos los imports de OpenZeppelin estén correctos
- Revisa la versión de Solidity (debe ser 0.8.24 o compatible)

---

## 🌐 Paso 3: Desplegar en Arbitrum Sepolia

### 3.1 Configurar MetaMask para Arbitrum Sepolia

1. Abre MetaMask
2. Agrega la red si no la tienes:
   - **Nombre**: Arbitrum Sepolia
   - **RPC URL**: `https://sepolia-rollup.arbitrum.io/rpc`
   - **Chain ID**: `421614`
   - **Símbolo**: `ETH`
   - **Explorador**: `https://sepolia.arbiscan.io`

3. Conecta MetaMask a Arbitrum Sepolia
4. Asegúrate de tener ETH para gas (obtén en [faucet](https://faucet.quicknode.com/arbitrum/sepolia))

### 3.2 Obtener Direcciones de Tokens

**Busca en Arbiscan Sepolia:**
- USDC: Busca "USDC" en [Arbiscan](https://sepolia.arbiscan.io)
- MXNB: Si no existe, usa `0x0000000000000000000000000000000000000000`

**Ejemplo de direcciones (VERIFICA antes de usar):**
```
USDC: 0x75faf114eafb1BDbe2F0316DF893fd58CE51aa82 (ejemplo - VERIFICA)
MXNB: 0x0000000000000000000000000000000000000000 (si no existe)
```

### 3.3 Desplegar en Remix

1. Ve a **"Deploy & Run Transactions"**
2. Selecciona **"Injected Provider - MetaMask"** en ENVIRONMENT
3. Verifica que MetaMask esté en **Arbitrum Sepolia** (Chain ID: 421614)

4. En **"CONTRACT"**, selecciona **"RecyclingEscrowV2"**

5. En **"DEPLOY"**, verás los parámetros del constructor. Ingresa:

```
_usdcToken: 0x... (dirección USDC en Arbitrum Sepolia)
_mxnbToken: 0x... (dirección MXNB o 0x0000...0000 si no existe)
_commissionWallet: 0x... (tu wallet address, recibirá comisiones)
_commissionRate: 100 (1% = 100 basis points, ajusta según necesites)
```

**Ejemplo:**
```
0x75faf114eafb1BDbe2F0316DF893fd58CE51aa82  // USDC (VERIFICA)
0x0000000000000000000000000000000000000000  // MXNB (placeholder)
0xTuDireccionMetaMask                       // Commission wallet
100                                          // 1% commission
```

6. Haz click en **"Deploy"**
7. Confirma la transacción en MetaMask
8. Espera a que se confirme

### 3.4 Guardar la Dirección del Contrato

Una vez desplegado:
1. Copia la dirección del contrato desde Remix
2. Guárdala para usarla en el frontend
3. Ejemplo: `0x1234...5678`

---

## 📜 Paso 4: Desplegar en Scroll Sepolia

### 4.1 Configurar MetaMask para Scroll Sepolia

1. Abre MetaMask
2. Agrega la red:
   - **Nombre**: Scroll Sepolia
   - **RPC URL**: `https://sepolia-rpc.scroll.io`
   - **Chain ID**: `534351`
   - **Símbolo**: `ETH`
   - **Explorador**: `https://sepolia.scrollscan.com`

3. Conecta MetaMask a Scroll Sepolia
4. Obtén ETH en [Scroll Sepolia Faucet](https://sepolia.scrollscan.com)

### 4.2 Obtener Direcciones de Tokens

Busca en Scrollscan Sepolia:
- USDC: Busca en [Scrollscan](https://sepolia.scrollscan.com)
- MXNB: Si no existe, usa `0x0000000000000000000000000000000000000000`

### 4.3 Desplegar

1. En Remix, cambia la red a Scroll Sepolia en MetaMask
2. En **"Deploy & Run Transactions"**, verifica que esté en Scroll Sepolia
3. Usa los mismos parámetros pero con direcciones de Scroll Sepolia:

```
_usdcToken: 0x... (USDC en Scroll Sepolia)
_mxnbToken: 0x... (MXNB en Scroll Sepolia o 0x0)
_commissionWallet: 0x... (misma wallet que antes)
_commissionRate: 100 (1%)
```

4. Haz click en **"Deploy"**
5. Confirma en MetaMask
6. Guarda la dirección del contrato

---

## ⚙️ Paso 5: Configuración Post-Deploy

Después de desplegar en cada red, necesitas configurar el contrato:

### 5.1 Configurar Precios de Materiales

**En Remix, usando la interfaz del contrato desplegado:**

1. Expande el contrato desplegado en Remix
2. Busca la función `setMaterialPrice`
3. Configura precios para cada material y token:

**Ejemplo para ETH:**
```
_materialType: "plastico"
_token: 0 (ETH)
_pricePerKg: 2000000000000000  // 0.002 ETH (en wei)
```

**Ejemplo para USDC (6 decimals):**
```
_materialType: "plastico"
_token: 1 (USDC)
_pricePerKg: 2000000  // 2 USDC (2 * 10^6)
```

**Materiales comunes:**
- `"plastico"` - Plástico
- `"papel"` - Papel/Cartón
- `"vidrio"` - Vidrio
- `"metal"` - Metal
- `"aluminio"` - Aluminio
- `"electronico"` - Electrónico

### 5.2 Agregar Centros Autorizados

1. Usa la función `addRecyclingCenter`
2. Ingresa la dirección del centro de reciclaje
3. Ejecuta como owner

**Ejemplo:**
```
addRecyclingCenter(
    0xCentroAddress...
)
```

### 5.3 Configurar Tokens (si usaste address(0))

Si usaste `address(0)` para MXNB o USDC inicialmente:

1. Una vez que tengas las direcciones reales
2. Usa `setTokenAddress`:
```
setTokenAddress(
    1,              // PaymentToken.USDC
    0xUSDCAddress   // Dirección real
)
```

---

## 📝 Parámetros del Constructor

### Valores Sugeridos:

```solidity
constructor(
    address _usdcToken,        // Dirección USDC en la red
    address _mxnbToken,        // Dirección MXNB o address(0)
    address _commissionWallet, // Tu wallet o multisig
    uint256 _commissionRate    // 100 = 1%, 200 = 2%, etc.
)
```

### Ejemplo Completo:

**Para Arbitrum Sepolia:**
```
_usdcToken: 0x75faf114eafb1BDbe2F0316DF893fd58CE51aa82
_mxnbToken: 0x0000000000000000000000000000000000000000
_commissionWallet: 0xTuWallet
_commissionRate: 100  // 1%
```

**Para Scroll Sepolia:**
```
_usdcToken: 0x... (buscar en Scrollscan)
_mxnbToken: 0x0000000000000000000000000000000000000000
_commissionWallet: 0xTuWallet
_commissionRate: 100
```

---

## 🔍 Verificar el Despliegue

### En Arbitrum Sepolia:
1. Ve a [Arbiscan Sepolia](https://sepolia.arbiscan.io)
2. Busca la dirección del contrato
3. Verifica que aparezca el código del contrato

### En Scroll Sepolia:
1. Ve a [Scrollscan Sepolia](https://sepolia.scrollscan.com)
2. Busca la dirección del contrato
3. Verifica el despliegue

---

## ⚠️ Troubleshooting

### Error: "Cannot find imported contract"
- **Solución:** Importa los archivos de OpenZeppelin manualmente desde GitHub

### Error: "Insufficient funds"
- **Solución:** Obtén más ETH en el faucet de la red correspondiente

### Error: "Invalid token address"
- **Solución:** Verifica que las direcciones de tokens sean correctas para esa red

### Error al compilar
- **Solución:** Verifica que la versión de Solidity sea 0.8.24 o compatible
- Verifica que todos los imports estén correctos

### El contrato no aparece en Remix después de deploy
- **Solución:** Recarga la página o verifica en el explorador de bloques

---

## 📋 Checklist de Despliegue

### Antes de Desplegar:
- [ ] OpenZeppelin Contracts importados en Remix
- [ ] Contrato compilado sin errores
- [ ] Direcciones de USDC y MXNB obtenidas para cada red
- [ ] MetaMask configurado para Arbitrum Sepolia
- [ ] MetaMask configurado para Scroll Sepolia
- [ ] ETH suficiente en ambas redes para gas

### Después de Desplegar Arbitrum:
- [ ] Contrato desplegado exitosamente
- [ ] Dirección del contrato guardada
- [ ] Precios configurados
- [ ] Al menos un centro agregado
- [ ] Tokens configurados (si es necesario)

### Después de Desplegar Scroll:
- [ ] Contrato desplegado exitosamente
- [ ] Dirección del contrato guardada
- [ ] Precios configurados
- [ ] Al menos un centro agregado
- [ ] Tokens configurados (si es necesario)

---

## 🎯 Próximos Pasos

1. **Actualizar Frontend:**
   - Actualizar `RECYCLING_CONTRACT_ADDRESS` en `lib/contracts.ts` con la nueva dirección
   - Actualizar ABI con el nuevo contrato
   - Actualizar hooks para soportar múltiples tokens

2. **Probar Funcionalidades:**
   - Crear entrega con ETH
   - Crear entrega con USDC (si está disponible)
   - Validar entrega
   - Verificar comisiones

3. **Configurar Producción:**
   - Configurar precios finales
   - Agregar todos los centros necesarios
   - Ajustar tasa de comisión según modelo de negocio

