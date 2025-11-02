# Resumen de Cambios del Contrato V2

## 🎯 Principales Mejoras Implementadas

### ✅ 1. Soporte Multi-Token
- **Antes:** Solo ETH
- **Ahora:** ETH, USDC, MXNB
- **Impacto:** Más opciones de pago para usuarios

### ✅ 2. Sistema de Comisiones
- **Antes:** Sin comisiones
- **Ahora:** Tasa configurable (max 10%)
- **Impacto:** Modelo de negocio sostenible

### ✅ 3. Precios Configurables
- **Antes:** Precios fijos
- **Ahora:** Precios por material y token, configurables on-chain
- **Impacto:** Flexibilidad y actualización sin redeploy

### ✅ 4. Seguridad Mejorada
- **Antes:** Sin protección específica
- **Ahora:** ReentrancyGuard, SafeERC20, Ownable
- **Impacto:** Mayor seguridad contra ataques comunes

### ✅ 5. Tracking de Entregas por Centro
- **Antes:** No había función directa
- **Ahora:** `getCenterDeliveries()` y mapping dedicado
- **Impacto:** Mejor UX para dashboards de centros

### ✅ 6. Metadata Adicional
- **Antes:** Sin campo para metadata
- **Ahora:** Campo `metadata` en Delivery struct
- **Impacto:** Soporte para IPFS, documentos, etc.

### ✅ 7. Funciones de Emergencia
- **Antes:** Sin funciones de emergencia
- **Ahora:** `emergencyWithdraw()` para owner
- **Impacto:** Control en situaciones excepcionales

---

## 🔍 Cambios Detallados en el Código

### Nuevos Enums
```solidity
enum PaymentToken {
    ETH,
    USDC,
    MXNB
}
```

### Estructura Delivery Ampliada
```solidity
struct Delivery {
    // Campos existentes...
    PaymentToken paymentToken;  // NUEVO
    string metadata;             // NUEVO
}
```

### Nuevos Mappings
```solidity
mapping(address => uint256[]) public centerDeliveries;  // NUEVO
mapping(string => mapping(PaymentToken => uint256)) public materialPrices;  // NUEVO
mapping(PaymentToken => uint256) public totalEscrowedTokens;  // NUEVO
```

### Nuevas Funciones
- `createDelivery()` - Ahora acepta `PaymentToken` y `metadata`
- `validateDelivery()` - Calcula y transfiere comisión
- `rejectDelivery()` - Soporta tokens ERC20
- `withdrawFunds()` - Incluye cálculo de comisión
- `getCenterDeliveries()` - NUEVA
- `setTokenAddress()` - NUEVA
- `setMaterialPrice()` - NUEVA
- `setMaterialPrices()` - NUEVA
- `getMaterialPrice()` - NUEVA
- `setCommissionRate()` - NUEVA
- `setCommissionWallet()` - NUEVA
- `getContractBalanceToken()` - NUEVA
- `getTotalEscrowedByToken()` - NUEVA
- `emergencyWithdraw()` - NUEVA

---

## ⚠️ Consideraciones Importantes

### 1. Dependencias
El contrato requiere OpenZeppelin Contracts:
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`
- `@openzeppelin/contracts/security/ReentrancyGuard.sol`
- `@openzeppelin/contracts/access/Ownable.sol`

### 2. Decimals de Tokens
- **ETH**: 18 decimals
- **USDC**: 6 decimals (en la mayoría de redes)
- **MXNB**: Verificar decimals del contrato

**Importante:** Al calcular precios, considerar los decimals de cada token.

### 3. Approvals ERC20
Los usuarios deben aprobar tokens antes de crear entregas:
```typescript
// En el frontend, antes de createDelivery
await tokenContract.approve(contractAddress, amount)
```

### 4. Configuración Inicial
Después del deploy, el owner debe:
1. Configurar direcciones de tokens (`setTokenAddress`)
2. Configurar precios (`setMaterialPrice`)
3. Agregar centros autorizados (`addRecyclingCenter`)
4. Configurar comisión (`setCommissionRate`, `setCommissionWallet`)

---

## 📊 Ejemplo de Uso

### Crear Entrega con ETH
```solidity
createDelivery(
    centerAddress,
    "plastico",
    15,                    // 15 kg
    PaymentToken.ETH,
    "ipfs://..."          // metadata
) { value: 0.03 ether }   // 15 kg * 0.002 ETH/kg
```

### Crear Entrega con USDC
```solidity
// Primero: approve
IERC20(usdcToken).approve(contractAddress, 30 * 10**6);

// Luego: createDelivery
createDelivery(
    centerAddress,
    "plastico",
    15,
    PaymentToken.USDC,
    ""
)
```

---

## 🔄 Migración desde V1

Si tienes el contrato V1 desplegado:

**Opción 1: Migración Paralela**
- Deploy V2 en nueva dirección
- Mantener V1 activo
- Migrar gradualmente

**Opción 2: Migración de Datos (si es necesario)**
- Crear función de migración
- Importar datos de V1 a V2
- Desactivar V1

**Opción 3: Nuevo Deploy**
- Deploy V2 desde cero
- Configurar desde el inicio

---

## 🎨 Impacto en el Frontend

### Nuevos Hooks Necesarios

1. **Hook para obtener balance de tokens**
```typescript
export function useTokenBalance(token: PaymentToken, address: string) {
  // Leer balance de ETH o ERC20
}
```

2. **Hook para approvals**
```typescript
export function useApproveToken(token: PaymentToken) {
  // Manejar approvals para USDC/MXNB
}
```

3. **Hook para crear entrega con token**
```typescript
export function useCreateDeliveryWithToken() {
  // Versión que maneja tokens ERC20
}
```

### Componentes a Actualizar

- Formulario de solicitud: Agregar selector de método de pago
- Página de pagos: Mostrar balance por token
- Dashboard: Mostrar estadísticas por token
- Verificación: Manejar reembolsos en tokens

---

## 📈 Mejoras Futuras Sugeridas

1. **Upgradeability**: Usar proxy pattern para updates sin pérdida de estado
2. **Batch Operations**: Crear múltiples entregas en una transacción
3. **Scheduling**: Programar entregas futuras
4. **Rewards**: Sistema de puntos/recompensas
5. **Insurance**: Seguro para entregas de alto valor
6. **Oracle Integration**: Precios dinámicos basados en mercado
7. **Multi-chain**: Soporte para múltiples blockchains

