# 🔧 Solución a Errores CORS y Rate Limiting

## Problema

La aplicación estaba usando el RPC público de Arbitrum Sepolia (`https://sepolia-rollup.arbitrum.io/rpc`) que tiene dos problemas principales:

1. **Errores CORS**: No permite peticiones desde navegadores web
2. **Rate Limiting (429)**: Límites muy estrictos que causan muchos errores

## Solución Implementada

Se ha actualizado la configuración de RPC para usar proveedores alternativos con mejor soporte para navegadores:

### Prioridad de RPC (Fallback Automático)

1. **Alchemy** (si está configurado) - Mejor opción, requiere API key gratuita
2. **Infura** (si está configurado) - Buena alternativa, requiere API key gratuita  
3. **PublicNode** (por defecto) - Gratis, sin API key, mejor que el RPC oficial

### Cambios Realizados

1. **`lib/wagmi-config.ts`**:
   - Función `getArbitrumSepoliaRpc()` con fallbacks automáticos
   - Configuración de batching y retry para reducir rate limiting
   - Logs para debugging

2. **`lib/hooks/use-recycling-contract.ts`**:
   - Reducido refetch interval de 5s a 30s
   - Mejor manejo de errores
   - Reintentos reducidos para evitar spam

## Configuración Opcional (Recomendado)

Para mejor rendimiento, puedes configurar API keys gratuitas:

### Opción 1: Alchemy (Recomendado)

1. Ve a https://www.alchemy.com/
2. Crea una cuenta gratuita
3. Crea un nuevo app para "Arbitrum Sepolia"
4. Copia tu API key
5. Agrega a `.env.local`:
   ```
   NEXT_PUBLIC_ALCHEMY_API_KEY=tu_api_key_aqui
   ```

### Opción 2: Infura

1. Ve a https://www.infura.io/
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Selecciona "Arbitrum Sepolia"
5. Copia tu API key
6. Agrega a `.env.local`:
   ```
   NEXT_PUBLIC_INFURA_API_KEY=tu_api_key_aqui
   ```

### Opción 3: Sin Configuración (Por Defecto)

Si no configuras nada, usará **PublicNode** automáticamente, que es mucho mejor que el RPC oficial pero puede tener límites durante picos de uso.

## Verificar que Funciona

1. Abre la consola del navegador (F12)
2. Busca el log: `🔗 RPC Configurado:`
3. Verifica que diga qué proveedor está usando
4. Los errores CORS deberían desaparecer
5. Los precios deberían cargarse correctamente

## Si Aún Hay Problemas

1. **Limpia el cache del navegador** - Ctrl+Shift+R (o Cmd+Shift+R en Mac)
2. **Reinicia el servidor de desarrollo** - `pnpm dev`
3. **Verifica la red** - Asegúrate de estar en Arbitrum Sepolia
4. **Revisa los logs** - La consola mostrará qué RPC está usando

## Notas Importantes

- **No necesitas configurar nada** - Funciona por defecto con PublicNode
- **Las API keys son opcionales** - Solo mejoran el rendimiento y límites
- **Las API keys son gratuitas** - No hay costo por usar Alchemy o Infura en testnets
- **PublicNode es suficiente** - Para la mayoría de casos de uso es suficiente

