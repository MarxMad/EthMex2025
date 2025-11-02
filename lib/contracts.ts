// Archivo para definir las direcciones y ABI de los contratos

// Direcciones del contrato RecyclingEscrowV3 por red
export const RECYCLING_CONTRACT_ADDRESSES = {
  arbitrumSepolia: '0x9eac6fff8014b159bd930cb526c3059a1a65e298' as const, // V3 desplegado en Arbitrum Sepolia
  scrollSepolia: '' as const, // Se actualizará cuando se despliegue en Scroll
} as const

// Función para obtener la dirección del contrato según la chain ID
export function getContractAddress(chainId: number): `0x${string}` {
  // Arbitrum Sepolia: 421614
  if (chainId === 421614) {
    return RECYCLING_CONTRACT_ADDRESSES.arbitrumSepolia
  }
  // Scroll Sepolia: 534351
  if (chainId === 534351) {
    const scrollAddress = RECYCLING_CONTRACT_ADDRESSES.scrollSepolia
    if (!scrollAddress) {
      throw new Error('Contract not deployed on Scroll Sepolia yet. Please update RECYCLING_CONTRACT_ADDRESSES.scrollSepolia')
    }
    return scrollAddress
  }
  // Por defecto, usar Arbitrum Sepolia
  return RECYCLING_CONTRACT_ADDRESSES.arbitrumSepolia
}

// Dirección del contrato activo (legacy, usar getContractAddress en su lugar)
// Se mantiene para compatibilidad pero se recomienda usar getContractAddress con chainId
export const RECYCLING_CONTRACT_ADDRESS = RECYCLING_CONTRACT_ADDRESSES.arbitrumSepolia

// ABI del contrato RecyclingEscrowV3 (actualizado desde contrato desplegado)
export const RECYCLING_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_deliveryId',
        type: 'uint256',
      },
    ],
    name: 'acceptDelivery',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_center',
        type: 'address',
      },
    ],
    name: 'addRecyclingCenter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_recyclingCenter',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_materialType',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: '_paymentToken',
        type: 'uint8',
      },
      {
        internalType: 'string',
        name: '_metadata',
        type: 'string',
      },
    ],
    name: 'createDelivery',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_usdcToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_mxnbToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_commissionWallet',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_commissionRate',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'center',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'materialType',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: 'token',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
    ],
    name: 'CenterMaterialPriceSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'deliveryId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collector',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paymentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: 'paymentToken',
        type: 'uint8',
      },
    ],
    name: 'DeliveryAccepted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'deliveryId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recyclingCenter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'materialType',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paymentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: 'paymentToken',
        type: 'uint8',
      },
    ],
    name: 'DeliveryCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'deliveryId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collector',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'DeliveryRejected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'deliveryId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collector',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paymentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: 'paymentToken',
        type: 'uint8',
      },
    ],
    name: 'DeliveryValidated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'deliveryId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: 'paymentToken',
        type: 'uint8',
      },
    ],
    name: 'FundsWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'materialType',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: 'token',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
    ],
    name: 'GlobalMaterialPriceSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'center',
        type: 'address',
      },
    ],
    name: 'RecyclingCenterAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'center',
        type: 'address',
      },
    ],
    name: 'RecyclingCenterRemoved',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_deliveryId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_reason',
        type: 'string',
      },
    ],
    name: 'rejectDelivery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_center',
        type: 'address',
      },
    ],
    name: 'removeRecyclingCenter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_center',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_materialType',
        type: 'string',
      },
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: '_pricePerKg',
        type: 'uint256',
      },
    ],
    name: 'setCenterMaterialPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_materialType',
        type: 'string',
      },
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: '_pricePerKg',
        type: 'uint256',
      },
    ],
    name: 'setGlobalMaterialPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_deliveryId',
        type: 'uint256',
      },
    ],
    name: 'validateDelivery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ARBITRUM_ONE_MXNB',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ARBITRUM_ONE_USDC',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ARBITRUM_SEPOLIA_MXNB',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ARBITRUM_SEPOLIA_USDC',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: '',
        type: 'uint8',
      },
    ],
    name: 'centerMaterialPrices',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'commissionRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'commissionWallet',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'deliveries',
    outputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recyclingCenter',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'collector',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'materialType',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'paymentAmount',
        type: 'uint256',
      },
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: 'paymentToken',
        type: 'uint8',
      },
      {
        internalType: 'enum RecyclingEscrowV3.DeliveryStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'createdAt',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'validatedAt',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'rejectionReason',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'metadata',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deliveryCounter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_center',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_materialType',
        type: 'string',
      },
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
    ],
    name: 'getMaterialPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: '',
        type: 'uint8',
      },
    ],
    name: 'globalMaterialPrices',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mxnbToken',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'recyclingCenters',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalEscrowedETH',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum RecyclingEscrowV3.PaymentToken',
        name: '',
        type: 'uint8',
      },
    ],
    name: 'totalEscrowedTokens',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'usdcToken',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Enums y tipos TypeScript
export enum PaymentToken {
  ETH = 0,
  USDC = 1,
  MXNB = 2,
}

export enum DeliveryStatus {
  Pending = 0,
  Validated = 1,
  Rejected = 2,
  Completed = 3,
}

// Tipo para la estructura Delivery (actualizado con V3 - incluye collector)
export interface Delivery {
  user: `0x${string}`
  recyclingCenter: `0x${string}`
  collector: `0x${string}` // Recolector que aceptó la entrega (address(0) si no tiene)
  materialType: string
  amount: bigint
  paymentAmount: bigint
  paymentToken: PaymentToken
  status: DeliveryStatus
  createdAt: bigint
  validatedAt: bigint
  rejectionReason: string
  metadata: string
}
