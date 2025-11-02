# Direcciones Confirmadas - Arbitrum Sepolia

## ✅ Tokens Verificados

### USDC (USD Coin)
```
Dirección: 0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1
Red: Arbitrum Sepolia
Explorador: https://sepolia.arbiscan.io/address/0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1
Decimals: Probablemente 6 (verificar en el contrato)
```

### MXNB
```
Dirección: 0x7911e898d0F91Db0DF9604574878906a3aB3E61e
Red: Arbitrum Sepolia
Explorador: https://sepolia.arbiscan.io/address/0x7911e898d0F91Db0DF9604574878906a3aB3E61e
Decimals: Verificar en el contrato (probablemente 18)
```

---

## 🚀 Parámetros Listos para Deploy

### Constructor Completo:

```solidity
constructor(
    0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1,  // USDC
    0x7911e898d0F91Db0DF9604574878906a3aB3E61e,   // MXNB
    0xTuDireccionMetaMask,                        // Commission wallet (REEMPLAZAR)
    100                                           // Commission rate: 1%
)
```

### En Remix:

**Paso a paso:**
1. Ve a "Deploy & Run Transactions"
2. Selecciona `RecyclingEscrowV2`
3. Ingresa estos valores en el constructor:

```
_usdcToken: 0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1
_mxnbToken: 0x7911e898d0F91Db0DF9604574878906a3aB3E61e
_commissionWallet: [Tu dirección de MetaMask]
_commissionRate: 100
```

4. Click en **Deploy**
5. Confirma en MetaMask

---

## ⚙️ Post-Deploy: Configuración Inicial

### 1. Configurar Precios para ETH

```solidity
setMaterialPrice("plastico", 0, 2000000000000000)    // 0.002 ETH/kg
setMaterialPrice("papel", 0, 1500000000000000)       // 0.0015 ETH/kg
setMaterialPrice("vidrio", 0, 1000000000000000)      // 0.001 ETH/kg
setMaterialPrice("metal", 0, 5000000000000000)       // 0.005 ETH/kg
setMaterialPrice("aluminio", 0, 5000000000000000)   // 0.005 ETH/kg
setMaterialPrice("electronico", 0, 8000000000000000) // 0.008 ETH/kg
```

### 2. Configurar Precios para USDC

**⚠️ Importante:** Verificar decimals de USDC primero (probablemente 6)

```solidity
// Si USDC tiene 6 decimals:
setMaterialPrice("plastico", 1, 2000000)    // 2 USDC/kg
setMaterialPrice("papel", 1, 1500000)           // 1.5 USDC/kg
setMaterialPrice("vidrio", 1, 1000000)          // 1 USDC/kg
setMaterialPrice("metal", 1, 5000000)          // 5 USDC/kg
setMaterialPrice("aluminio", 1, 5000000)       // 5 USDC/kg
setMaterialPrice("electronico", 1, 8000000)    // 8 USDC/kg
```

**Para verificar decimals de USDC:**
```solidity
// En Remix, después de deployar tu contrato, puedes verificar:
// Ve a Arbiscan → Busca el contrato USDC → Lee la función decimals()
```

### 3. Configurar Precios para MXNB

**⚠️ Importante:** Verificar decimals de MXNB primero (probablemente 18)

```solidity
// Si MXNB tiene 18 decimals (como ETH):
setMaterialPrice("plastico", 2, 2000000000000000000)    // 2 MXNB/kg
setMaterialPrice("papel", 2, 1500000000000000000)       // 1.5 MXNB/kg
setMaterialPrice("vidrio", 2, 1000000000000000000)      // 1 MXNB/kg
setMaterialPrice("metal", 2, 5000000000000000000)       // 5 MXNB/kg
setMaterialPrice("aluminio", 2, 5000000000000000000)    // 5 MXNB/kg
setMaterialPrice("electronico", 2, 8000000000000000000) // 8 MXNB/kg
```

### 4. Agregar Centros Autorizados

```solidity
addRecyclingCenter(0xDireccionDelCentro1)
addRecyclingCenter(0xDireccionDelCentro2)
// ... agregar todos los centros necesarios
```

---

## 🔍 Verificar Decimals de Tokens

### Método 1: En Arbiscan

1. Ve a [Arbiscan Sepolia](https://sepolia.arbiscan.io)
2. Busca la dirección del token
3. En la sección "Contract" → "Read Contract"
4. Busca la función `decimals()` y ejecuta

### Método 2: En Remix

Puedes crear un contrato temporal para verificar:

```solidity
// Contrato temporal de verificación
contract CheckDecimals {
    function getDecimals(address token) external view returns (uint8) {
        return IERC20(token).decimals();
    }
}
```

O simplemente revisa en Arbiscan antes de configurar precios.

---

## 📋 Checklist de Despliegue

### Pre-Deploy:
- [x] ✅ Direcciones de USDC y MXNB confirmadas
- [ ] Wallet de comisiones preparada
- [ ] MetaMask conectado a Arbitrum Sepolia (Chain ID: 421614)
- [ ] ETH suficiente para gas
- [ ] OpenZeppelin contracts importados en Remix
- [ ] Contrato compilado sin errores

### Deploy:
- [ ] Constructor configurado con direcciones correctas
- [ ] Contrato desplegado exitosamente
- [ ] Dirección del contrato guardada

### Post-Deploy:
- [ ] Decimals de USDC verificados
- [ ] Decimals de MXNB verificados
- [ ] Precios configurados para ETH
- [ ] Precios configurados para USDC
- [ ] Precios configurados para MXNB (opcional)
- [ ] Al menos un centro agregado
- [ ] Contrato verificado en Arbiscan

---

## 💡 Notas Importantes

1. **Decimals:** Es CRÍTICO verificar los decimals de cada token antes de configurar precios
   - Si USDC tiene 6 decimals: `2 USDC = 2000000`
   - Si MXNB tiene 18 decimals: `2 MXNB = 2000000000000000000`
   - Error en decimals = precios incorrectos

2. **Commission Wallet:** Usa una wallet que controles. Puedes cambiarla después con `setCommissionWallet()`

3. **Testing:** Empieza con precios bajos para testing y ajusta después

4. **Verificación del Contrato:** Después del deploy, considera verificar el código en Arbiscan para que sea transparente

---

## 🎯 Próximos Pasos Después del Deploy

1. **Guardar dirección del contrato** → Actualizar en frontend
2. **Actualizar ABI** → Reemplazar en `lib/contracts.ts`
3. **Probar creación de entrega** → Con ETH primero
4. **Probar con USDC** → Verificar approvals funcionan
5. **Probar con MXNB** → Si planeas usarlo

