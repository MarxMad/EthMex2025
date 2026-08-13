# 🚀 Plan de Modernización CriKula 2026

## 📋 Resumen Ejecutivo

Tu proyecto tiene 10 meses y es momento perfecto para modernizarlo con las mejores herramientas del ecosistema en 2026:

### ✨ Mejoras Principales

1. **Foundry** - Reemplazo de Hardhat para desarrollo de contratos
2. **Privy** - Login social sin fricción (email, Google, Twitter, etc.)
3. **Paymaster (ERC-4337)** - Gas sponsorship para usuarios sin ETH

### 🎯 Beneficios

| Mejora | Antes | Después | Impacto |
|--------|-------|---------|---------|
| **Testing** | Hardhat (lento) | Foundry (4x más rápido) | ⚡ Desarrollo más ágil |
| **Onboarding** | Wallet obligatoria | Email/Social | 📈 90% más conversión |
| **UX** | Usuario paga gas | App patrocina gas | 🎉 Experiencia sin fricción |
| **Herramientas** | JavaScript tests | Solidity tests nativos | 🛠️ Mejor debugging |

---

## 🔥 Parte 1: Migración a Foundry

### ¿Por qué Foundry?

- ✅ **4x más rápido** que Hardhat en tests
- ✅ **Tests en Solidity** (no JavaScript)
- ✅ **Fuzzing nativo** para encontrar bugs
- ✅ **Sin Node.js** - binario standalone
- ✅ **Gas profiling** integrado
- ✅ **Mejor debugging** con `forge test -vvv`

### Paso 1.1: Instalar Foundry

```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash

# Cargar en terminal
source ~/.bashrc  # o ~/.zshrc

# Instalar versión estable
foundryup

# Verificar instalación
forge --version
cast --version
anvil --version
chisel --version
```

### Paso 1.2: Inicializar Foundry en el Proyecto

```bash
# Desde la raíz del proyecto
forge init --force

# Esto crea:
# - foundry.toml (configuración)
# - lib/ (dependencias)
# - script/ (scripts de deployment)
# - test/ (tests en Solidity)
```

### Paso 1.3: Configurar `foundry.toml`

```toml
[profile.default]
# Carpeta de contratos (mantener la actual)
src = "contracts"
out = "out"
libs = ["lib", "node_modules"]
test = "test/foundry"

# Configuración del compilador (coincidir con tu proyecto)
solc_version = "0.8.24"
evm_version = "cancun"  # Para Avalanche/Arbitrum
optimizer = true
optimizer_runs = 200
via_ir = false

# Remappings para importar desde node_modules
remappings = [
    "@openzeppelin/=node_modules/@openzeppelin/",
    "forge-std/=lib/forge-std/src/"
]

# Configuración de gas
gas_reports = ["*"]
gas_reports_ignore = ["test"]

# RPC endpoints
[rpc_endpoints]
arbitrum_sepolia = "https://sepolia-rollup.arbitrum.io/rpc"
avalanche_fuji = "https://api.avax-test.network/ext/bc/C/rpc"
avalanche = "https://api.avax.network/ext/bc/C/rpc"

# Configuración de Etherscan para verificación
[etherscan]
arbitrum_sepolia = { key = "${ARBISCAN_API_KEY}" }
avalanche = { key = "${SNOWTRACE_API_KEY}" }
```

### Paso 1.4: Instalar Dependencias de Foundry

```bash
# Forge-std (librería estándar para tests)
forge install foundry-rs/forge-std --no-commit

# OpenZeppelin (si no usas node_modules)
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Actualizar remappings
forge remappings > remappings.txt
```

### Paso 1.5: Crear Test de Ejemplo

Crear `test/foundry/RecyclingEscrowV3.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/RecyclingEscrowV3_PreciosPorCentro.sol";

contract RecyclingEscrowV3Test is Test {
    RecyclingEscrowV3 public escrow;
    
    address owner = address(this);
    address user = makeAddr("user");
    address collector = makeAddr("collector");
    address recyclingCenter = makeAddr("center");
    address commissionWallet = makeAddr("commission");
    
    address constant USDC = 0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1;
    address constant MXNB = 0x7911e898d0F91Db0DF9604574878906a3aB3E61e;
    
    function setUp() public {
        // Desplegar contrato
        escrow = new RecyclingEscrowV3(
            USDC,
            MXNB,
            commissionWallet,
            100  // 1% de comisión
        );
        
        // Agregar centro de reciclaje
        escrow.addRecyclingCenter(recyclingCenter);
        
        // Configurar precio global de material
        escrow.setGlobalMaterialPrice(
            "plastico",
            RecyclingEscrowV3.PaymentToken.ETH,
            0.002 ether  // 0.002 ETH por kg
        );
        
        // Dar ETH a usuarios de prueba
        vm.deal(user, 10 ether);
        vm.deal(collector, 10 ether);
    }
    
    function testCreateDelivery() public {
        vm.startPrank(user);
        
        string memory metadata = '{"address":"Calle 123","date":"2026-08-15"}';
        
        uint256 deliveryId = escrow.createDelivery(
            recyclingCenter,
            "plastico",
            10,  // 10 kg
            RecyclingEscrowV3.PaymentToken.ETH,
            metadata
        );
        
        vm.stopPrank();
        
        assertEq(deliveryId, 0, "Delivery ID should be 0");
        
        // Verificar que la entrega se creó correctamente
        (
            address deliveryUser,
            address deliveryCenter,
            ,
            string memory materialType,
            uint256 amount,
            uint256 paymentAmount,
            ,
            ,
            ,
            ,
            ,
        ) = escrow.deliveries(deliveryId);
        
        assertEq(deliveryUser, user, "User should match");
        assertEq(deliveryCenter, recyclingCenter, "Center should match");
        assertEq(materialType, "plastico", "Material should match");
        assertEq(amount, 10, "Amount should be 10 kg");
        assertEq(paymentAmount, 0.02 ether, "Payment should be 0.02 ETH");
    }
    
    function testAcceptDelivery() public {
        // Usuario crea entrega
        vm.prank(user);
        uint256 deliveryId = escrow.createDelivery(
            recyclingCenter,
            "plastico",
            10,
            RecyclingEscrowV3.PaymentToken.ETH,
            "{}"
        );
        
        // Recolector acepta y paga
        vm.prank(collector);
        escrow.acceptDelivery{value: 0.02 ether}(deliveryId);
        
        // Verificar que el recolector fue asignado
        (,,address assignedCollector,,,,,,,,) = escrow.deliveries(deliveryId);
        assertEq(assignedCollector, collector, "Collector should be assigned");
        
        // Verificar que el ETH está en escrow
        assertEq(escrow.totalEscrowedETH(), 0.02 ether, "ETH should be escrowed");
    }
    
    function testValidateDelivery() public {
        // Setup: crear y aceptar entrega
        vm.prank(user);
        uint256 deliveryId = escrow.createDelivery(
            recyclingCenter,
            "plastico",
            10,
            RecyclingEscrowV3.PaymentToken.ETH,
            "{}"
        );
        
        vm.prank(collector);
        escrow.acceptDelivery{value: 0.02 ether}(deliveryId);
        
        uint256 userBalanceBefore = user.balance;
        uint256 commissionBalanceBefore = commissionWallet.balance;
        
        // Centro valida la entrega
        vm.prank(recyclingCenter);
        escrow.validateDelivery(deliveryId);
        
        // Verificar que se liberaron los fondos
        uint256 expectedCommission = (0.02 ether * 100) / 10000;  // 1%
        uint256 expectedUserPayment = 0.02 ether - expectedCommission;
        
        assertEq(
            user.balance - userBalanceBefore,
            expectedUserPayment,
            "User should receive payment minus commission"
        );
        
        assertEq(
            commissionWallet.balance - commissionBalanceBefore,
            expectedCommission,
            "Commission wallet should receive commission"
        );
    }
    
    function testRejectDelivery() public {
        // Setup
        vm.prank(user);
        uint256 deliveryId = escrow.createDelivery(
            recyclingCenter,
            "plastico",
            10,
            RecyclingEscrowV3.PaymentToken.ETH,
            "{}"
        );
        
        vm.prank(collector);
        escrow.acceptDelivery{value: 0.02 ether}(deliveryId);
        
        uint256 collectorBalanceBefore = collector.balance;
        
        // Centro rechaza
        vm.prank(recyclingCenter);
        escrow.rejectDelivery(deliveryId, "Material de baja calidad");
        
        // Verificar que se devolvieron los fondos al recolector
        assertEq(
            collector.balance - collectorBalanceBefore,
            0.02 ether,
            "Collector should be refunded"
        );
    }
    
    function testFuzzCreateDeliveryWithDifferentAmounts(uint256 amount) public {
        // Limitar amount a rango razonable (1-1000 kg)
        vm.assume(amount > 0 && amount <= 1000);
        
        vm.prank(user);
        uint256 deliveryId = escrow.createDelivery(
            recyclingCenter,
            "plastico",
            amount,
            RecyclingEscrowV3.PaymentToken.ETH,
            "{}"
        );
        
        (,,,,uint256 storedAmount, uint256 paymentAmount,,,,,) = escrow.deliveries(deliveryId);
        
        assertEq(storedAmount, amount, "Amount should match");
        assertEq(paymentAmount, amount * 0.002 ether, "Payment should be amount * price");
    }
}
```

### Paso 1.6: Ejecutar Tests

```bash
# Compilar contratos
forge build

# Ejecutar todos los tests
forge test

# Con verbosidad para ver detalles
forge test -vv

# Ver traces completos (para debugging)
forge test -vvvv

# Ejecutar un test específico
forge test --match-test testCreateDelivery

# Ver gas report
forge test --gas-report

# Coverage
forge coverage
```

### Paso 1.7: Scripts de Deployment con Foundry

Crear `script/DeployRecyclingEscrow.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/RecyclingEscrowV3_PreciosPorCentro.sol";

contract DeployRecyclingEscrow is Script {
    function run() external {
        // Cargar configuración desde env
        address usdc = vm.envAddress("USDC_ADDRESS");
        address mxnb = vm.envAddress("MXNB_ADDRESS");
        address commissionWallet = vm.envAddress("COMMISSION_WALLET");
        uint256 commissionRate = vm.envUint("COMMISSION_RATE");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Desplegar contrato
        RecyclingEscrowV3 escrow = new RecyclingEscrowV3(
            usdc,
            mxnb,
            commissionWallet,
            commissionRate
        );
        
        console.log("RecyclingEscrowV3 deployed to:", address(escrow));
        
        // Configurar precios globales iniciales
        escrow.setGlobalMaterialPrice(
            "plastico",
            RecyclingEscrowV3.PaymentToken.ETH,
            0.002 ether
        );
        
        escrow.setGlobalMaterialPrice(
            "carton",
            RecyclingEscrowV3.PaymentToken.ETH,
            0.0015 ether
        );
        
        escrow.setGlobalMaterialPrice(
            "vidrio",
            RecyclingEscrowV3.PaymentToken.ETH,
            0.001 ether
        );
        
        console.log("Global prices configured");
        
        vm.stopBroadcast();
    }
}
```

**Uso:**

```bash
# Crear .env.foundry con variables
cat > .env.foundry << EOF
USDC_ADDRESS=0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1
MXNB_ADDRESS=0x7911e898d0F91Db0DF9604574878906a3aB3E61e
COMMISSION_WALLET=0xYourWalletHere
COMMISSION_RATE=100
PRIVATE_KEY=0xYourPrivateKeyHere
EOF

# Cargar variables
source .env.foundry

# Desplegar a testnet (simular primero)
forge script script/DeployRecyclingEscrow.s.sol:DeployRecyclingEscrow \
  --rpc-url arbitrum_sepolia \
  --broadcast \
  --verify \
  -vvvv

# Desplegar a mainnet
forge script script/DeployRecyclingEscrow.s.sol:DeployRecyclingEscrow \
  --rpc-url avalanche \
  --broadcast \
  --verify \
  -vvvv
```

---

## 🔐 Parte 2: Integración de Privy

### ¿Por qué Privy?

- ✅ **Login sin wallet**: Email, Google, Twitter, Discord, etc.
- ✅ **Embedded wallets**: Crea wallets automáticamente
- ✅ **UX sin fricción**: 90% más conversión
- ✅ **Non-custodial**: Usuario controla sus claves
- ✅ **Multi-chain**: Avalanche, Arbitrum, etc.

### Paso 2.1: Crear Cuenta en Privy

1. Ir a [dashboard.privy.io](https://dashboard.privy.io)
2. Crear cuenta (gratis hasta 10,000 MAUs)
3. Crear nueva app "CriKula"
4. Copiar el **App ID**
5. Configurar:
   - Login methods: Email, Google, Twitter, Farcaster
   - Chains: Arbitrum Sepolia, Avalanche Fuji
   - Embedded wallets: Habilitadas

### Paso 2.2: Instalar Privy SDK

```bash
npm install @privy-io/react-auth
```

### Paso 2.3: Configurar Privy Provider

Crear `components/providers/privy-provider.tsx`:

```typescript
'use client'

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth'
import { arbitrumSepolia, avalancheFuji } from 'viem/chains'
import { ReactNode } from 'react'

export function PrivyProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // Métodos de login habilitados
        loginMethods: ['email', 'google', 'twitter', 'farcaster', 'wallet'],
        
        // Crear wallets automáticamente para usuarios sin wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        
        // Chains soportadas
        defaultChain: avalancheFuji,
        supportedChains: [arbitrumSepolia, avalancheFuji],
        
        // Apariencia
        appearance: {
          theme: 'light',
          accentColor: '#10b981', // Verde CriKula
          logo: '/LogoC.jpeg',
        },
        
        // Configuración adicional
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  )
}
```

### Paso 2.4: Actualizar Root Layout

Modificar `app/layout.tsx`:

```typescript
import { PrivyProvider } from '@/components/providers/privy-provider'
import { WagmiProvider } from '@/components/providers/wagmi-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <PrivyProvider>
          <WagmiProvider>
            {children}
          </WagmiProvider>
        </PrivyProvider>
      </body>
    </html>
  )
}
```

### Paso 2.5: Crear Componente de Login con Privy

Crear `components/privy-login-button.tsx`:

```typescript
'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PrivyLoginButton() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()

  if (!ready) {
    return <Button disabled>Cargando...</Button>
  }

  if (!authenticated) {
    return (
      <Button onClick={login} className="bg-green-600 hover:bg-green-700">
        🌱 Iniciar Sesión
      </Button>
    )
  }

  // Usuario autenticado
  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy')
  const externalWallet = wallets.find((w) => w.walletClientType !== 'privy')
  const activeWallet = embeddedWallet || externalWallet

  const userEmail = user.email?.address
  const userTwitter = user.twitter?.username
  const userGoogle = user.google?.email
  const displayName = userEmail || userTwitter || userGoogle || 'Usuario'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userEmail && (
          <DropdownMenuItem>
            📧 {userEmail}
          </DropdownMenuItem>
        )}
        
        {activeWallet && (
          <DropdownMenuItem>
            💼 {activeWallet.address.slice(0, 6)}...
            {activeWallet.address.slice(-4)}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => {
          /* Navegar a dashboard según rol */
        }}>
          🏠 Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={logout} className="text-red-600">
          🚪 Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Paso 2.6: Hooks Personalizados para Privy

Crear `lib/hooks/use-privy-wallet.ts`:

```typescript
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { arbitrumSepolia, avalancheFuji } from 'viem/chains'

export function usePrivyWallet() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  useEffect(() => {
    if (!authenticated || !ready) {
      setWalletClient(null)
      return
    }

    const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy')
    const activeWallet = embeddedWallet || wallets[0]

    if (!activeWallet) return

    const provider = activeWallet.getEthereumProvider?.()
    if (!provider) return

    const client = createWalletClient({
      chain: avalancheFuji,
      transport: custom(provider),
    })

    setWalletClient(client)
  }, [authenticated, ready, wallets])

  return {
    address: walletClient?.account?.address,
    walletClient,
    isEmbedded: wallets[0]?.walletClientType === 'privy',
    user,
  }
}
```

---

## 💰 Parte 3: Paymaster para Gas Sponsorship

### ¿Por qué Paymaster?

- ✅ **Usuarios sin ETH**: Pueden usar la app sin comprar crypto
- ✅ **UX perfecta**: No piensan en gas fees
- ✅ **Conversión alta**: Sin fricciones de pago
- ✅ **Control de costos**: Defines límites de sponsorship

### Opciones de Paymaster

| Proveedor | Precio | Chains | Características |
|-----------|--------|--------|-----------------|
| **Pimlico** | Gratis primeros $100 | 40+ chains | ERC-4337, fácil integración |
| **Alchemy** | Gratis hasta 100k ops | 15+ chains | Gas Manager, analytics |
| **Gelato** | Variable | 100+ chains | Relay network |
| **OpenZeppelin Defender** | $99/mes | Ethereum, L2s | Enterprise-grade |

**Recomendación**: Pimlico (mejor para empezar)

### Paso 3.1: Crear Cuenta en Pimlico

1. Ir a [dashboard.pimlico.io](https://dashboard.pimlico.io)
2. Crear cuenta (gratis)
3. Crear API Key
4. Agregar chains: Arbitrum Sepolia, Avalanche Fuji
5. Configurar política de sponsorship:
   - Whitelist de direcciones (contratos)
   - Límite de gas por operación
   - Límite diario

### Paso 3.2: Instalar Dependencias Paymaster

```bash
npm install permissionless viem @pimlico/client
```

### Paso 3.3: Configurar Pimlico Client

Crear `lib/paymaster-config.ts`:

```typescript
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico"
import { http } from "viem"
import { avalancheFuji, arbitrumSepolia } from "viem/chains"

export const paymasterClient = createPimlicoPaymasterClient({
  transport: http(`https://api.pimlico.io/v2/${avalancheFuji.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`),
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // EntryPoint v0.6
})

export const getPimlicoClient = (chainId: number) => {
  const url = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
  
  return createPimlicoPaymasterClient({
    transport: http(url),
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  })
}
```

### Paso 3.4: Hook para Transacciones Sponsoreadas

Crear `lib/hooks/use-sponsored-transaction.ts`:

```typescript
import { useState } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { getPimlicoClient } from '@/lib/paymaster-config'
import { encodeFunctionData, type Address } from 'viem'
import { RECYCLING_CONTRACT_ABI, RECYCLING_CONTRACT_ADDRESS } from '@/lib/contracts'

export function useSponsoredTransaction() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const sendSponsoredTx = async ({
    functionName,
    args,
    onSuccess,
  }: {
    functionName: string
    args: any[]
    onSuccess?: (hash: string) => void
  }) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      const chainId = await walletClient.getChainId()
      const paymasterClient = getPimlicoClient(chainId)

      // 1. Encodear la llamada al contrato
      const callData = encodeFunctionData({
        abi: RECYCLING_CONTRACT_ABI,
        functionName,
        args,
      })

      // 2. Crear UserOperation
      const userOperation = {
        sender: walletClient.account.address,
        nonce: 0n, // Se calcula automáticamente
        initCode: '0x' as `0x${string}`,
        callData,
        callGasLimit: 200000n,
        verificationGasLimit: 500000n,
        preVerificationGas: 50000n,
        maxFeePerGas: 1000000000n,
        maxPriorityFeePerGas: 1000000000n,
        paymasterAndData: '0x' as `0x${string}`,
        signature: '0x' as `0x${string}`,
      }

      // 3. Obtener datos del Paymaster
      const sponsorResult = await paymasterClient.sponsorUserOperation({
        userOperation,
      })

      // 4. Actualizar UserOp con datos del sponsor
      const sponsoredUserOp = {
        ...userOperation,
        paymasterAndData: sponsorResult.paymasterAndData,
        callGasLimit: sponsorResult.callGasLimit,
        verificationGasLimit: sponsorResult.verificationGasLimit,
        preVerificationGas: sponsorResult.preVerificationGas,
      }

      // 5. Firmar UserOperation
      const signature = await walletClient.signMessage({
        message: { raw: sponsoredUserOp as any },
      })

      const signedUserOp = {
        ...sponsoredUserOp,
        signature,
      }

      // 6. Enviar a bundler
      const userOpHash = await paymasterClient.sendUserOperation({
        userOperation: signedUserOp,
      })

      // 7. Esperar confirmación
      const receipt = await paymasterClient.waitForUserOperationReceipt({
        hash: userOpHash,
      })

      const txHash = receipt.receipt.transactionHash

      setIsLoading(false)
      onSuccess?.(txHash)

      return { hash: txHash, receipt }
    } catch (err: any) {
      console.error('Sponsored transaction error:', err)
      setError(err)
      setIsLoading(false)
      throw err
    }
  }

  return {
    sendSponsoredTx,
    isLoading,
    error,
  }
}
```

### Paso 3.5: Actualizar Hook de Contrato para Usar Paymaster

Modificar `lib/hooks/use-recycling-contract.ts`:

```typescript
import { useSponsoredTransaction } from './use-sponsored-transaction'

export function useCreateDelivery() {
  const { sendSponsoredTx, isLoading, error } = useSponsoredTransaction()

  const createDelivery = async ({
    recyclingCenter,
    materialType,
    amount,
    paymentToken,
    metadata,
    useGasSponsorship = true, // ⭐ Nueva opción
  }: {
    recyclingCenter: Address
    materialType: string
    amount: bigint
    paymentToken: number
    metadata: string
    useGasSponsorship?: boolean
  }) => {
    const args = [recyclingCenter, materialType, amount, paymentToken, metadata]

    if (useGasSponsorship) {
      // Usar Paymaster (sin pagar gas)
      return sendSponsoredTx({
        functionName: 'createDelivery',
        args,
        onSuccess: (hash) => {
          console.log('✅ Delivery created (gas sponsored):', hash)
        },
      })
    } else {
      // Transacción normal (usuario paga gas)
      // Código existente...
    }
  }

  return { createDelivery, isLoading, error }
}
```

### Paso 3.6: UI para Mostrar Gas Sponsorship

Actualizar `app/usuario/solicitar/page.tsx`:

```typescript
export default function SolicitarRecoleccionPage() {
  const [gasSponsored, setGasSponsored] = useState(true)
  const { createDelivery, isLoading } = useCreateDelivery()

  const handleSubmit = async () => {
    await createDelivery({
      // ...datos
      useGasSponsorship: gasSponsored,
    })
  }

  return (
    <div>
      {/* Formulario existente */}
      
      <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
        <input
          type="checkbox"
          checked={gasSponsored}
          onChange={(e) => setGasSponsored(e.target.checked)}
          id="gas-sponsored"
        />
        <label htmlFor="gas-sponsored" className="text-sm">
          {gasSponsored ? (
            <span className="text-green-600">
              ✨ <strong>Gas gratis</strong> - CriKula paga por ti
            </span>
          ) : (
            <span>Pagar gas yo mismo (~$0.25)</span>
          )}
        </label>
      </div>

      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Creando...' : 'Crear Solicitud'}
      </Button>
    </div>
  )
}
```

---

## 📦 Paso 4: Variables de Entorno

Crear `.env.local`:

```bash
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Pimlico Paymaster
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key_here

# WalletConnect (ya existente)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# RPC Providers (opcional)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here

# Foundry deployment
PRIVATE_KEY=0xyour_private_key_here
USDC_ADDRESS=0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1
MXNB_ADDRESS=0x7911e898d0F91Db0DF9604574878906a3aB3E61e
COMMISSION_WALLET=0xyour_commission_wallet_here
COMMISSION_RATE=100

# Etherscan API Keys (para verificación)
ARBISCAN_API_KEY=your_arbiscan_key
SNOWTRACE_API_KEY=your_snowtrace_key
```

---

## 🚀 Paso 5: Testing Completo

### 5.1 Tests de Foundry

```bash
# Ejecutar todos los tests
forge test -vv

# Con gas report
forge test --gas-report

# Coverage
forge coverage --report summary
```

### 5.2 Tests de Frontend

```bash
# Si tienes tests de Next.js
npm test

# Lint
npm run lint
```

### 5.3 Test de Integración Completa

1. **Login con Privy**: Probar email/Google/Twitter
2. **Crear delivery**: Debe usar gas sponsorship
3. **Verificar en explorador**: Ver que Paymaster pagó el gas
4. **Aceptar delivery**: Recolector acepta
5. **Validar delivery**: Centro valida

---

## 📊 Comparativa Antes vs Después

| Aspecto | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Testing** | Hardhat JS (lento) | Foundry Solidity (rápido) | 4x más rápido |
| **Onboarding** | Requiere wallet + ETH | Email → listo | 90% más conversión |
| **Gas fees** | Usuario paga ~$0.25 | App patrocina | $0 para usuario |
| **UX** | 5+ pasos (wallet, ETH, aprobar) | 1 paso (email) | Fricción mínima |
| **Debugging** | console.log en JS | forge test -vvvv | Mejor debugging |
| **Gas optimization** | Manual | forge snapshot | Automático |
| **Multi-chain** | Manual switch | Privy auto-detecta | Sin fricción |

---

## 💰 Costos Estimados

### Privy
- **Gratis**: Hasta 10,000 usuarios activos mensuales (MAU)
- **$0.02/MAU**: Más de 10,000 usuarios
- **Estimado**: $0 primeros meses, $20-50/mes con 1,000 usuarios

### Pimlico Paymaster
- **Gratis**: Primeros $100 en gas sponsoreado
- **Pay-as-you-go**: Después
- **Estimado por transacción**: $0.10 en Avalanche/Arbitrum
- **Estimado**: $0 primeros meses, $50-200/mes con 500-2000 transacciones/mes

### Foundry
- **Gratis**: Open source, sin costos

### Total Mensual
- **0-100 usuarios**: $0
- **100-1000 usuarios**: $20-50/mes
- **1000-5000 usuarios**: $100-300/mes

---

## 📋 Checklist de Implementación

### Foundry
- [ ] Instalar Foundry con `foundryup`
- [ ] Crear `foundry.toml`
- [ ] Instalar forge-std
- [ ] Escribir 5+ tests básicos
- [ ] Migrar scripts de deployment
- [ ] Ejecutar `forge test` con éxito
- [ ] Configurar CI/CD con Foundry

### Privy
- [ ] Crear cuenta en Privy Dashboard
- [ ] Obtener App ID
- [ ] Instalar `@privy-io/react-auth`
- [ ] Configurar PrivyProvider
- [ ] Crear componente de login
- [ ] Probar login con email
- [ ] Probar login con Google/Twitter
- [ ] Integrar embedded wallets

### Paymaster
- [ ] Crear cuenta en Pimlico
- [ ] Obtener API Key
- [ ] Instalar dependencias (permissionless, viem)
- [ ] Configurar Pimlico client
- [ ] Crear hook de transacciones sponsoreadas
- [ ] Actualizar flujo de createDelivery
- [ ] Probar en testnet
- [ ] Configurar límites y políticas

### Testing
- [ ] Tests de Foundry pasan
- [ ] Login con Privy funciona
- [ ] Transacciones sponsoreadas funcionan
- [ ] UX completa de principio a fin
- [ ] Documentación actualizada

---

## 🎯 Siguientes Pasos

### Semana 1: Foundry
- Día 1-2: Instalación y configuración
- Día 3-4: Migrar tests
- Día 5-7: Scripts de deployment

### Semana 2: Privy
- Día 8-9: Setup de Privy
- Día 10-11: Componentes de login
- Día 12-14: Testing e integración

### Semana 3: Paymaster
- Día 15-16: Setup de Pimlico
- Día 17-19: Integración de sponsorship
- Día 20-21: Testing y optimización

---

## 📚 Recursos Adicionales

### Foundry
- [Foundry Book](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
- [Foundry Templates](https://github.com/foundry-rs/forge-template)

### Privy
- [Privy Docs](https://docs.privy.io/)
- [Privy Dashboard](https://dashboard.privy.io/)
- [Privy Examples](https://github.com/privy-io/privy-examples)

### Pimlico/Paymaster
- [Pimlico Docs](https://docs.pimlico.io/)
- [ERC-4337 Docs](https://docs.erc4337.io/)
- [Permissionless.js](https://docs.pimlico.io/permissionless)

---

## 🎉 Conclusión

Esta modernización llevará tu proyecto de **10 meses atrás** a **2026 state-of-the-art**:

1. ⚡ **Foundry**: Desarrollo 4x más rápido
2. 🔐 **Privy**: Onboarding sin fricción
3. 💰 **Paymaster**: UX perfecta sin gas fees

**Resultado**: Una aplicación de reciclaje que cualquiera puede usar, sin necesidad de saber qué es crypto, wallets o gas fees.

¡Tu proyecto estará listo para escalar a miles de usuarios! 🚀🌱
