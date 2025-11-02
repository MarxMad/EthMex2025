# Guía de Despliegue del Contrato RecyclingEscrow

## Problema con Remix y Arbitrum Sepolia

Si Remix te dice que no tienes ETH cuando intentas desplegar, pero ves que tienes 3 ETH en Arbitrum Sepolia, el problema es que **Remix está intentando usar la red L1 (Ethereum Sepolia) en lugar de Arbitrum Sepolia**.

## Solución: Usar MetaMask Inyectado en Remix

### Paso 1: Configurar MetaMask para Arbitrum Sepolia

1. Abre MetaMask
2. Agrega la red Arbitrum Sepolia manualmente:
   - Nombre: Arbitrum Sepolia
   - RPC URL: `https://sepolia-rollup.arbitrum.io/rpc`
   - Chain ID: `421614`
   - Símbolo de moneda: `ETH`
   - Explorador de bloques: `https://sepolia-explorer.arbitrum.io`

### Paso 2: Obtener ETH en Arbitrum Sepolia

Puedes obtener ETH de prueba en:
- [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- O usando un puente desde Ethereum Sepolia

### Paso 3: Desplegar en Remix

1. Abre [Remix IDE](https://remix.ethereum.org)
2. Crea un nuevo archivo `RecyclingEscrow.sol` y pega el código del contrato
3. En el panel izquierdo, ve a **"Deploy & Run Transactions"**
4. En la parte superior, en **"ENVIRONMENT"**, selecciona **"Injected Provider - MetaMask"**
5. Asegúrate de que MetaMask esté conectado y en la red **Arbitrum Sepolia**
6. Verifica que MetaMask muestre que estás en Arbitrum Sepolia (Chain ID: 421614)
7. Compila el contrato (Ctrl+S o clic en "Compile RecyclingEscrow.sol")
8. Haz clic en **"Deploy"**
9. MetaMask te pedirá confirmación - verifica que:
   - La red sea Arbitrum Sepolia
   - Tengas suficiente ETH para gas
   - Confirma la transacción

### Paso 4: Obtener la Dirección del Contrato Desplegado

Después del despliegue exitoso:
1. Copia la dirección del contrato desde Remix
2. Actualiza `RECYCLING_CONTRACT_ADDRESS` en `/lib/contracts.ts` con la dirección real

## Alternativa: Usar Hardhat o Foundry

Si Remix sigue dando problemas, puedes usar Hardhat o Foundry:

### Con Hardhat:

```bash
# Instalar dependencias
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Crear hardhat.config.js
npx hardhat init

# Configurar para Arbitrum Sepolia
```

### Con Foundry:

```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Crear proyecto
forge init recycling-escrow
```

## Verificar el Despliegue

Después de desplegar:
1. Ve al [Explorador de Arbitrum Sepolia](https://sepolia-explorer.arbitrum.io)
2. Busca tu dirección del contrato
3. Verifica que el contrato esté desplegado correctamente
4. Copia la dirección y actualízala en el frontend

