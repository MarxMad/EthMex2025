# Cómo Funciona el Sistema de Escrow

## 💰 ¿Qué es el Escrow?

El escrow es un sistema donde el dinero se **bloquea en el contrato inteligente** hasta que se cumplen ciertas condiciones. En nuestro caso, el dinero se bloquea hasta que el centro valida la entrega.

## 🔄 Flujo Completo del Dinero

### 1. **Usuario Crea Solicitud (createDelivery)**

Cuando un usuario crea una solicitud de recolección:

```
Usuario → Firma transacción → Contrato recibe ETH/tokens → Dinero BLOQUEADO en escrow
```

**Lo que pasa:**
- El usuario firma la transacción en MetaMask
- La transacción incluye **DOS cosas**:
  1. **Gas fee** (para ejecutar la transacción) - ~0.0001 ETH
  2. **Payment amount** (el pago bloqueado) - por ejemplo, 0.001 ETH

**En el contrato:**
```solidity
// Línea 165-168 del contrato
if (_paymentToken == PaymentToken.ETH) {
    require(msg.value >= requiredPayment, "Insufficient ETH payment");
    totalEscrowedETH += requiredPayment;  // ✅ DINERO BLOQUEADO AQUÍ
}
```

**El dinero NO va al centro, NO va al usuario, va al CONTRATO** y queda bloqueado ahí.

### 2. **Recolector Acepta (off-chain)**

Cuando un recolector acepta:
- Solo se guarda en localStorage (off-chain)
- **NO se bloquea dinero adicional** porque ya está bloqueado
- El dinero sigue en el contrato esperando validación

### 3. **Centro Valida (validateDelivery)**

Cuando el centro valida la entrega:

```
Contrato → Transfiere dinero a:
  - Usuario (70-90% según comisión)
  - Wallet de comisiones (10% o menos)
```

**El dinero se libera del escrow y se paga al usuario.**

## 📊 Visualización en MetaMask

Cuando firmas la transacción de `createDelivery`, MetaMask muestra:

```
Send ETH:
├── To: [Dirección del contrato]
├── Amount: 0.001 ETH  ← ESTO ES EL PAGO BLOQUEADO
└── Gas: ~0.0001 ETH   ← ESTO ES PARA EJECUTAR LA TRANSACCIÓN
```

**Total que verás en MetaMask: ~0.0011 ETH** (pago + gas)

## 🔍 Cómo Verificar que el Dinero Está Bloqueado

### Opción 1: Ver en el Contrato

Puedes verificar el balance del contrato en Arbiscan:
1. Ve a: `https://sepolia.arbiscan.io/address/[DIRECCION_CONTRATO]`
2. Verás el balance del contrato (todo el ETH bloqueado en escrow)

### Opción 2: Ver en el Código

El contrato tiene una variable pública:
```solidity
uint256 public totalEscrowedETH;
```

Esta variable muestra cuánto ETH total está bloqueado en el contrato.

## ❓ ¿Por Qué Parece que "No se Paga Nada"?

Puede parecer que no se paga nada porque:

1. **El valor puede ser muy pequeño** (por ejemplo, 0.001 ETH = ~$3)
2. **MetaMask muestra todo junto** (pago + gas) y puede ser confuso
3. **El dinero va al contrato, no a una persona**, así que parece "desaparecer"

## ✅ Cómo Verificar que Funciona

1. **Antes de crear la entrega**: Anota tu balance de ETH
2. **Crea la entrega**: Firma la transacción
3. **Después de crear**: Verifica tu balance - debería haber disminuido por el monto del pago + gas
4. **Verifica el contrato**: El balance del contrato debería haber aumentado

## 🎯 Resumen

**SÍ se bloquea dinero** cuando creas la entrega. El dinero va al contrato y queda ahí hasta que:
- El centro valida → Dinero al usuario
- El centro rechaza → Dinero devuelto al usuario
- Pasado un tiempo → Puede haber mecanismos de timeout (si se implementan)

El sistema de escrow **SÍ funciona**, solo que el dinero está en el contrato inteligente, no en una cuenta visible.

