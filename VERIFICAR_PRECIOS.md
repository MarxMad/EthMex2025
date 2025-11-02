# 🔍 Cómo Verificar Precios Configurados

Si configuraste precios pero aparecen como "Sin precio" en la UI, sigue estos pasos para verificar:

## 1. Verificar en Arbiscan

1. Ve a [Arbiscan Sepolia](https://sepolia.arbiscan.io)
2. Busca tu contrato: `0x9eac6fff8014b159bd930cb526c3059a1a65e298`
3. Ve a la pestaña **"Read Contract"**
4. Busca la función `getMaterialPrice`
5. Ingresa:
   - `_center`: La dirección del centro (ej: `0xb761...9d0b`)
   - `_materialType`: El nombre del material (ej: `"plastico"`, `"carton"`, `"vidrio"`)
   - `_token`: El token de pago (0 = ETH, 1 = USDC, 2 = MXNB)
6. Haz clic en **"Query"**
7. Si retorna `0`, el precio no está configurado
8. Si retorna un número grande (ej: `2000000000000000`), ese es el precio en wei/tokens

## 2. Verificar Precios por Centro

También puedes verificar directamente los precios del centro:

1. En Arbiscan, busca `centerMaterialPrices`
2. Ingresa:
   - Índice 0: Dirección del centro
   - Índice 1: Nombre del material (string)
   - Índice 2: Token (0, 1, o 2)
3. Si retorna `0`, no tiene precio configurado por el centro
4. Entonces se usará el precio global

## 3. Verificar Precios Globales

Si el centro no tiene precio, verifica si hay precio global:

1. En Arbiscan, busca `globalMaterialPrices`
2. Ingresa:
   - Índice 0: Nombre del material (string)
   - Índice 1: Token (0, 1, o 2)

## 4. Nombres de Materiales Correctos

Los nombres de materiales deben ser exactamente:
- `"plastico"` (minúsculas, sin acentos)
- `"carton"` (minúsculas, sin acentos)
- `"vidrio"` (minúsculas)
- `"aluminio"` (minúsculas)
- `"papel"` (minúsculas)
- `"electronico"` (minúsculas, sin acentos)

**⚠️ IMPORTANTE:** Los strings son case-sensitive. Si configuraste "Plástico" en lugar de "plastico", no funcionará.

## 5. Debugging en la Consola del Navegador

Abre la consola del navegador (F12) y verás logs como:

```
[useMaterialPrice] Consultando precio: {
  materialType: "plastico",
  centerAddress: "0xb761...",
  token: "ETH",
  price: "0" o "2000000000000000",
  hasPrice: false o true,
  isLoading: false,
  error: undefined
}
```

Esto te ayudará a ver qué está pasando.

## 6. Solución Rápida

Si configuraste precios pero no aparecen:

1. **Espera unos segundos** - La UI refetch automáticamente cada 5 segundos si no hay precio
2. **Recarga la página** - Los precios se cargan cuando se selecciona el centro
3. **Verifica los nombres** - Deben coincidir exactamente (ver sección 4)
4. **Verifica el token** - Si configuraste precio en ETH pero estás viendo USDC, no aparecerá
5. **Verifica que la transacción fue exitosa** - Revisa el hash en Arbiscan

## 7. Ejemplo de Transacción Exitosa

Una transacción exitosa de `setCenterMaterialPrice` debería verse así en Arbiscan:

- **Function:** `setCenterMaterialPrice(address,string,uint8,uint256)`
- **Inputs:**
  - `_center`: `0xb761...9d0b`
  - `_materialType`: `"plastico"`
  - `_token`: `0` (ETH)
  - `_pricePerKg`: `2000000000000000` (0.002 ETH)

Si ves esto, el precio está configurado correctamente.

