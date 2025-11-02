# Mejoras del Contrato RecyclingEscrowV2

## 📊 Resumen de Cambios

El nuevo contrato `RecyclingEscrowV2` incluye mejoras significativas sobre la versión original:

---

## ✨ Nuevas Funcionalidades

### 1. **Soporte para Múltiples Tokens de Pago**

**Tokens Soportados:**
- ✅ **ETH** - Ether nativo
- ✅ **USDC** - USD Coin (ERC20)
- ✅ **MXNB** - MXNB Token (ERC20)

**Cambios en el código:**
```solidity
enum PaymentToken {
    ETH,
    USDC,
    MXNB
}

struct Delivery {
    // ... campos existentes
    PaymentToken paymentToken;  // Nuevo campo
    uint256 paymentAmount;      // Monto en el token especificado
}
```

**Beneficios:**
- Flexibilidad de pago para usuarios
- Soporte para stablecoins
- Transacciones más baratas con tokens ERC20 en algunas redes

---

### 2. **Sistema de Comisiones Configurable**

**Nuevas características:**
- Tasa de comisión configurable (en basis points, max 10%)
- Wallet dedicada para recibir comisiones
- Comisión se deduce automáticamente al validar

**Uso:**
```solidity
uint256 commission = (paymentAmount * commissionRate) / 10000;
uint256 userPayment = paymentAmount - commission;
```

**Beneficios:**
- Modelo de negocio sostenible
- Ingresos para la plataforma
- Configurable por el owner

---

### 3. **Precios Configurables por Material y Token**

**Nueva funcionalidad:**
```solidity
mapping(string => mapping(PaymentToken => uint256)) public materialPrices;
```

**Funciones:**
- `setMaterialPrice()` - Configurar precio individual
- `setMaterialPrices()` - Configurar múltiples precios a la vez
- `getMaterialPrice()` - Obtener precio actual

**Ejemplo:**
```solidity
// Plástico a $2/kg = 0.002 ETH/kg o 2 USDC/kg
setMaterialPrice("plastico", PaymentToken.ETH, 0.002 ether);
setMaterialPrice("plastico", PaymentToken.USDC, 2 * 10**6); // USDC tiene 6 decimals
```

**Beneficios:**
- Precios flexibles
- Actualización sin redeploy
- Diferentes precios según método de pago

---

### 4. **Tracking de Entregas por Centro**

**Nueva funcionalidad:**
```solidity
mapping(address => uint256[]) public centerDeliveries;

function getCenterDeliveries(address _center) external view returns (uint256[] memory);
```

**Beneficios:**
- Centros pueden ver sus entregas pendientes
- Mejor UX para dashboards
- Facilita filtrado y búsqueda

---

### 5. **Mejoras de Seguridad**

**OpenZeppelin Contracts:**
- ✅ `ReentrancyGuard` - Protección contra reentrancy attacks
- ✅ `SafeERC20` - Transferencias seguras de tokens ERC20
- ✅ `Ownable` - Manejo mejorado de ownership

**Protecciones:**
```solidity
modifier nonReentrant  // Previene reentrancy
using SafeERC20 for IERC20  // Transferencias seguras
```

**Beneficios:**
- Mayor seguridad
- Mejores prácticas de Solidity
- Protección contra ataques comunes

---

### 6. **Metadata Adicional**

**Nuevo campo:**
```solidity
struct Delivery {
    // ...
    string metadata;  // IPFS hash, JSON, etc.
}
```

**Uso:**
- Almacenar IPFS hash de documentos
- Información adicional sobre la entrega
- Links a fotos o documentos

**Beneficios:**
- Más información por entrega
- Soporte para documentos off-chain
- Extensibilidad futura

---

### 7. **Funciones de Emergencia**

**Nueva función:**
```solidity
function emergencyWithdraw(
    PaymentToken _token,
    address _to,
    uint256 _amount
) external onlyOwner;
```

**Uso:**
- Solo para emergencias
- Permite retirar fondos si hay problemas
- Control total por el owner

---

### 8. **Mejores Funciones de Consulta**

**Nuevas funciones:**
- `getContractBalanceToken()` - Balance por tipo de token
- `getTotalEscrowedByToken()` - Escrow por tipo de token
- `getCenterDeliveries()` - Entregas de un centro

**Beneficios:**
- Mejor visibilidad de fondos
- Estadísticas más detalladas
- Dashboard más completo

---

## 🔄 Comparación: V1 vs V2

| Característica | V1 | V2 |
|---------------|----|----|
| Métodos de pago | Solo ETH | ETH, USDC, MXNB |
| Comisiones | ❌ No | ✅ Configurable |
| Precios configurables | ❌ No | ✅ Por material y token |
| Entregas por centro | ❌ No | ✅ Sí |
| ReentrancyGuard | ❌ No | ✅ Sí |
| SafeERC20 | ❌ No | ✅ Sí |
| Metadata | ❌ No | ✅ Sí |
| Funciones de emergencia | ❌ No | ✅ Sí |
| Mejores consultas | ❌ Limitadas | ✅ Completas |

---

## 📝 Dependencias Requeridas

El contrato V2 requiere OpenZeppelin Contracts:

```bash
npm install @openzeppelin/contracts
# o
forge install OpenZeppelin/openzeppelin-contracts
```

**Versión requerida:** OpenZeppelin Contracts v5.x (compatible con Solidity 0.8.24)

---

## 🚀 Pasos para Usar el Contrato V2

### 1. Instalar Dependencias

```bash
npm install @openzeppelin/contracts
```

O si usas Foundry:
```toml
# En foundry.toml o remix, importar directamente:
# https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/...
```

### 2. Configurar Direcciones de Tokens

Antes de desplegar, necesitas las direcciones de:
- **USDC en Scroll Sepolia**: `0x...` (consulta en Scrollscan)
- **MXNB en Scroll Sepolia**: `0x...` (o deplégalo si no existe)

### 3. Deploy del Contrato

```solidity
// En el constructor necesitas:
constructor(
    address _usdcToken,           // Dirección USDC
    address _mxnbToken,           // Dirección MXNB
    address _commissionWallet,    // Wallet para comisiones
    uint256 _commissionRate       // Ej: 100 = 1%
)
```

**Ejemplo:**
```javascript
// En Remix o script de deploy
new RecyclingEscrowV2(
    "0x...USDC...",     // USDC address
    "0x...MXNB...",     // MXNB address
    "0x...owner...",    // Commission wallet
    100                 // 1% commission
)
```

### 4. Configurar Precios

```solidity
// Después del deploy, como owner:

// Precios en ETH
setMaterialPrice("plastico", PaymentToken.ETH, 0.002 ether);  // 0.002 ETH/kg
setMaterialPrice("papel", PaymentToken.ETH, 0.0015 ether);

// Precios en USDC (6 decimals)
setMaterialPrice("plastico", PaymentToken.USDC, 2 * 10**6);  // 2 USDC/kg
setMaterialPrice("papel", PaymentToken.USDC, 1.5 * 10**6);

// Precios en MXNB (18 decimals como ETH)
setMaterialPrice("plastico", PaymentToken.MXNB, 2 * 10**18);  // 2 MXNB/kg
```

### 5. Agregar Centros Autorizados

```solidity
addRecyclingCenter("0x...centro1...");
addRecyclingCenter("0x...centro2...");
```

---

## 🔧 Mejoras Adicionales Recomendadas (Futuro)

### 1. **Sistema de Ratings/Calificaciones**
```solidity
struct Rating {
    uint256 score;  // 1-5
    string comment;
}

mapping(uint256 => Rating) public deliveryRatings;
```

### 2. **Límites de Tiempo para Validación**
```solidity
uint256 public validationTimeout = 7 days;

modifier withinValidationTime(uint256 _deliveryId) {
    require(
        block.timestamp <= deliveries[_deliveryId].createdAt + validationTimeout,
        "Validation timeout"
    );
    _;
}
```

### 3. **Sistema de Penalizaciones**
```solidity
mapping(address => uint256) public userPenaltyCount;
mapping(address => bool) public bannedUsers;
```

### 4. **Multisig para Owner**
```solidity
// Usar OpenZeppelin's TimelockController o Gnosis Safe
```

### 5. **Pausa de Emergencia**
```solidity
bool public paused;

modifier whenNotPaused() {
    require(!paused, "Contract is paused");
    _;
}
```

### 6. **Upgradeability (opcional)**
```solidity
// Usar UUPS o Transparent Proxy pattern
```

### 7. **Descuentos por Volumen**
```solidity
mapping(address => uint256) public userDeliveryCount;

function getDiscountRate(address _user) public view returns (uint256) {
    uint256 count = userDeliveryCount[_user];
    if (count > 50) return 5; // 5% discount
    if (count > 20) return 2; // 2% discount
    return 0;
}
```

### 8. **Sistema de Refunds Parciales**
```solidity
function partialRefund(
    uint256 _deliveryId,
    uint256 _refundAmount,
    string memory _reason
) external onlyRecyclingCenter;
```

### 9. **Escalamiento de Disputas**
```solidity
enum DisputeStatus { None, Open, Resolved }
mapping(uint256 => Dispute) public disputes;
```

### 10. **Gas Optimization**
- Pack structs más eficientemente
- Usar `uint128` donde sea posible
- Batch operations

---

## 📋 Checklist de Migración

Si ya tienes el contrato V1 desplegado:

- [ ] Decidir si migrar o usar V2 en paralelo
- [ ] Verificar direcciones de USDC y MXNB en Scroll Sepolia
- [ ] Deploy del contrato V2
- [ ] Configurar precios iniciales
- [ ] Agregar centros autorizados
- [ ] Configurar comisión
- [ ] Actualizar frontend con nuevo ABI
- [ ] Probar transacciones con cada token
- [ ] Documentar direcciones y configuración

---

## 🎯 Recomendaciones Finales

1. **Para Scroll Sepolia:**
   - Verifica si USDC y MXNB existen en la red
   - Si no existen, considera desplegar tokens de prueba
   - O usa direcciones de otros tokens ERC20 como alternativa

2. **Para Producción:**
   - Auditoría de seguridad recomendada
   - Testing exhaustivo con todos los tokens
   - Considerar upgradeability si planeas mejoras futuras
   - Multisig para funciones críticas

3. **Para el Frontend:**
   - Actualizar ABI del contrato
   - Agregar selector de método de pago
   - Manejar approvals para tokens ERC20
   - Mostrar precios en cada token
   - Actualizar hooks para soportar múltiples tokens

---

## 📄 Archivos del Contrato

El contrato mejorado está en:
- `contracts/RecyclingEscrowV2.sol`

**Próximos pasos:**
1. Revisar y ajustar el contrato según tus necesidades
2. Instalar OpenZeppelin Contracts
3. Desplegar y configurar
4. Actualizar frontend para soportar múltiples tokens

