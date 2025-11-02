# 💰 Precios por Centro de Reciclaje - V3

## 🎯 Problema con V2 Actual

El contrato `RecyclingEscrowV2` actual tiene precios **globales** por material:
- Todos los centros tienen el mismo precio para cada material
- No permite que cada centro tenga sus propios precios
- No es flexible para diferentes costos operativos de centros

## ✅ Solución: RecyclingEscrowV3

El nuevo contrato `RecyclingEscrowV3` soporta:
- **Precios por centro**: Cada centro puede configurar sus propios precios
- **Precios globales como fallback**: Si un centro no tiene precio configurado, usa el global
- **Flexibilidad**: Centros pueden configurar sus propios precios o usar los del owner

---

## 🔧 Cambios en el Contrato

### Nuevo Mapping de Precios

```solidity
// Precios por centro
mapping(address => mapping(string => mapping(PaymentToken => uint256))) 
    public centerMaterialPrices; // center => material => token => price

// Precios globales (fallback)
mapping(string => mapping(PaymentToken => uint256)) 
    public globalMaterialPrices; // material => token => price
```

### Nueva Función para Centros

```solidity
function setCenterMaterialPrice(
    address _center,
    string memory _materialType,
    PaymentToken _token,
    uint256 _pricePerKg
) external {
    require(recyclingCenters[_center], "Center not authorized");
    require(
        msg.sender == owner() || msg.sender == _center,
        "Only owner or center can set price"
    );
    
    centerMaterialPrices[_center][_materialType][_token] = _pricePerKg;
    emit CenterMaterialPriceSet(_center, _materialType, _token, _pricePerKg);
}
```

### Lógica Mejorada en createDelivery

```solidity
// Obtener precio: primero del centro, luego global
uint256 pricePerKg = centerMaterialPrices[_recyclingCenter][_materialType][_paymentToken];
if (pricePerKg == 0) {
    pricePerKg = globalMaterialPrices[_materialType][_paymentToken];
}
require(pricePerKg > 0, "Price not set for this material and token");
```

---

## 🚀 Migración desde V2

### Opción 1: Deploy Paralelo
1. Deploy V3 en nueva dirección
2. Mantener V2 activo durante transición
3. Migrar gradualmente centros y usuarios

### Opción 2: Configurar Precios en V2 (Temporal)
Mientras se despliega V3, el owner puede configurar precios globales en V2:
- Usar `/admin/configurar-precios` como owner
- O configurar en Remix con `setMaterialPrice()`

---

## 📋 Uso del Nuevo Sistema

### Para el Owner:
```solidity
// Configurar precio global (fallback para todos los centros)
setGlobalMaterialPrice("plastico", PaymentToken.ETH, 2000000000000000); // 0.002 ETH/kg

// O configurar precio específico para un centro
setCenterMaterialPrice(
    0xCentroAddress,
    "plastico",
    PaymentToken.ETH,
    2500000000000000  // Este centro cobra 0.0025 ETH/kg (más caro)
);
```

### Para un Centro:
```solidity
// El propio centro puede configurar sus precios
setCenterMaterialPrice(
    msg.sender,  // Su propia dirección
    "plastico",
    PaymentToken.ETH,
    1800000000000000  // 0.0018 ETH/kg (más barato para competir)
);
```

---

## 🔄 Próximos Pasos

1. **Revisar contrato V3**: `contracts/RecyclingEscrowV3_PreciosPorCentro.sol`
2. **Deploy V3**: En Remix con los mismos parámetros que V2
3. **Actualizar frontend**: 
   - Hook `useMaterialPrice` debe incluir el centro
   - Actualizar ABI y direcciones
   - Página para que centros configuren sus precios

---

## 📝 Notas Importantes

- **Compatibilidad hacia atrás**: V2 seguirá funcionando con precios globales
- **Migración suave**: Puedes tener ambos contratos activos
- **Flexibilidad**: Los centros pueden usar precios globales O configurar sus propios

