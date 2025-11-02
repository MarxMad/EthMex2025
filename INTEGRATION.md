# Guía de Integración del Contrato RecyclingEscrow

## Archivos Creados

### 1. Configuración de Wagmi
- **`lib/wagmi-config.ts`**: Configuración de wagmi para Arbitrum Sepolia
- **`components/providers/wagmi-provider.tsx`**: Provider de wagmi para envolver la app
- **`app/layout.tsx`**: Ya actualizado para incluir el WagmiProvider

### 2. Contrato y Hooks
- **`lib/contracts.ts`**: ABI completo del contrato y tipos TypeScript
- **`lib/hooks/use-recycling-contract.ts`**: Hooks personalizados para interactuar con el contrato

### 3. Componentes Web3
- **`components/web3/wallet-connect.tsx`**: Componente para conectar wallet

## Pasos para Completar la Integración

### Paso 1: Desplegar el Contrato

Sigue la guía en `DEPLOYMENT.md` para desplegar el contrato en Arbitrum Sepolia.

### Paso 2: Actualizar la Dirección del Contrato

Una vez desplegado, actualiza la dirección en `lib/contracts.ts`:

```typescript
export const RECYCLING_CONTRACT_ADDRESS = '0xTU_DIRECCION_AQUI' as const
```

### Paso 3: Agregar Conexión de Wallet al Header

Puedes agregar el componente de conexión de wallet en cualquier parte de la app:

```tsx
import { WalletConnect } from '@/components/web3/wallet-connect'

// En tu componente
<WalletConnect />
```

### Paso 4: Usar los Hooks en los Componentes

#### Ejemplo: Crear una Entrega

```tsx
'use client'
import { useCreateDelivery } from '@/lib/hooks/use-recycling-contract'
import { useAccount } from 'wagmi'
import { formatEther, parseUnits } from 'viem'

function CreateDeliveryForm() {
  const { address } = useAccount()
  const { createDelivery, isPending, isSuccess, error } = useCreateDelivery()
  const [amount, setAmount] = useState('')
  const [materialType, setMaterialType] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    // Dirección del centro de reciclaje (debe estar autorizada)
    const recyclingCenter = '0x...' as const
    
    // Convertir cantidad a bigint (ej: 15 kg = 15000 gramos o usar 15 directamente)
    const amountBigInt = BigInt(amount)
    
    // Monto en ETH (ej: "0.001" para 0.001 ETH)
    const paymentAmount = "0.001"

    try {
      await createDelivery(recyclingCenter, materialType, amountBigInt, paymentAmount)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Tu formulario */}
      <button type="submit" disabled={isPending || !address}>
        {isPending ? 'Enviando...' : 'Crear Entrega'}
      </button>
      {isSuccess && <p>Entrega creada exitosamente!</p>}
      {error && <p>Error: {error.message}</p>}
    </form>
  )
}
```

#### Ejemplo: Validar una Entrega (Centro de Reciclaje)

```tsx
import { useValidateDelivery } from '@/lib/hooks/use-recycling-contract'

function ValidateDeliveryButton({ deliveryId }: { deliveryId: bigint }) {
  const { validateDelivery, isPending, isSuccess } = useValidateDelivery()

  const handleValidate = async () => {
    try {
      await validateDelivery(deliveryId)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <button onClick={handleValidate} disabled={isPending}>
      {isPending ? 'Validando...' : 'Validar Entrega'}
    </button>
  )
}
```

#### Ejemplo: Obtener Entregas del Usuario

```tsx
import { useMyDeliveries, useDelivery } from '@/lib/hooks/use-recycling-contract'

function MyDeliveriesList() {
  const { deliveryIds, isLoading } = useMyDeliveries()

  if (isLoading) return <p>Cargando...</p>

  return (
    <div>
      {deliveryIds?.map((id) => (
        <DeliveryCard key={id.toString()} deliveryId={id} />
      ))}
    </div>
  )
}

function DeliveryCard({ deliveryId }: { deliveryId: bigint }) {
  const { delivery, isLoading } = useDelivery(deliveryId)

  if (isLoading) return <div>Cargando entrega...</div>
  if (!delivery) return null

  return (
    <div>
      <h3>{delivery.materialType}</h3>
      <p>Cantidad: {delivery.amount.toString()} kg</p>
      <p>Pago: {formatEther(delivery.paymentAmount)} ETH</p>
      <p>Estado: {delivery.status}</p>
    </div>
  )
}
```

## Funciones Disponibles

### Para Usuarios
- `createDelivery`: Crea una entrega con pago en escrow
- `withdrawFunds`: Retira fondos de una entrega validada
- `getUserDeliveries`: Obtiene todas las entregas del usuario

### Para Centros de Reciclaje
- `validateDelivery`: Valida una entrega (libera el pago)
- `rejectDelivery`: Rechaza una entrega (reembolsa al usuario)

### Para Owner
- `addRecyclingCenter`: Agrega un centro autorizado
- `removeRecyclingCenter`: Remueve un centro autorizado

## Estados de Entrega

- `Pending (0)`: Pendiente de validación
- `Validated (1)`: Validado - el pago se transfirió automáticamente
- `Rejected (2)`: Rechazado - se reembolsó al usuario
- `Completed (3)`: Completado - fondos retirados

## Próximos Pasos

1. ✅ Configuración de wagmi completada
2. ✅ Hooks creados
3. ⏳ Actualizar componentes existentes para usar el contrato
4. ⏳ Agregar manejo de errores y mensajes de estado
5. ⏳ Agregar confirmaciones visuales para transacciones

