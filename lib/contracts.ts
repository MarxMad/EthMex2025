// Archivo para definir las direcciones y ABI de los contratos

// Direcciones del contrato RecyclingEscrowV2 por red
export const RECYCLING_CONTRACT_ADDRESSES = {
  arbitrumSepolia: '0x83501eae542748590639649f2e951b653c509b1b' as const,
  scrollSepolia: '', // Se actualizará cuando se despliegue en Scroll
} as const

// Dirección del contrato activo (usar según la red configurada)
export const RECYCLING_CONTRACT_ADDRESS = RECYCLING_CONTRACT_ADDRESSES.arbitrumSepolia

// ABI del contrato RecyclingEscrowV2
export const RECYCLING_CONTRACT_ABI = [
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
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
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
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
        internalType: 'uint256',
        name: 'rate',
        type: 'uint256',
      },
    ],
    name: 'CommissionRateSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'wallet',
        type: 'address',
      },
    ],
    name: 'CommissionWalletSet',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
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
        indexed: false,
        internalType: 'uint256',
        name: 'paymentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
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
    name: 'MaterialPriceSet',
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
        internalType: 'uint256',
        name: '_rate',
        type: 'uint256',
      },
    ],
    name: 'setCommissionRate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_wallet',
        type: 'address',
      },
    ],
    name: 'setCommissionWallet',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: '_pricePerKg',
        type: 'uint256',
      },
    ],
    name: 'setMaterialPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string[]',
        name: '_materialTypes',
        type: 'string[]',
      },
      {
        internalType: 'enum RecyclingEscrowV2.PaymentToken[]',
        name: '_tokens',
        type: 'uint8[]',
      },
      {
        internalType: 'uint256[]',
        name: '_prices',
        type: 'uint256[]',
      },
    ],
    name: 'setMaterialPrices',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
    ],
    name: 'setTokenAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: 'token',
        type: 'uint8',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
    ],
    name: 'TokenAddressSet',
    type: 'event',
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
    inputs: [
      {
        internalType: 'uint256',
        name: '_deliveryId',
        type: 'uint256',
      },
    ],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'centerDeliveries',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: 'paymentToken',
        type: 'uint8',
      },
      {
        internalType: 'enum RecyclingEscrowV2.DeliveryStatus',
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
    ],
    name: 'getCenterDeliveries',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContractBalanceETH',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
    ],
    name: 'getContractBalanceToken',
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
        internalType: 'uint256',
        name: '_deliveryId',
        type: 'uint256',
      },
    ],
    name: 'getDelivery',
    outputs: [
      {
        components: [
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
            internalType: 'enum RecyclingEscrowV2.PaymentToken',
            name: 'paymentToken',
            type: 'uint8',
          },
          {
            internalType: 'enum RecyclingEscrowV2.DeliveryStatus',
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
        internalType: 'struct RecyclingEscrowV2.Delivery',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: '_token',
        type: 'uint8',
      },
    ],
    name: 'getTotalEscrowedByToken',
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
        name: '_user',
        type: 'address',
      },
    ],
    name: 'getUserDeliveries',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
        name: '',
        type: 'uint8',
      },
    ],
    name: 'materialPrices',
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
        internalType: 'enum RecyclingEscrowV2.PaymentToken',
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
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'userDeliveries',
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
] as const

// Enum para el método de pago
export enum PaymentToken {
  ETH = 0,
  USDC = 1,
  MXNB = 2,
}

// Enum para el estado de la entrega
export enum DeliveryStatus {
  Pending = 0,
  Validated = 1,
  Rejected = 2,
  Completed = 3,
}

// Tipo para la estructura Delivery (actualizado con V2)
export interface Delivery {
  user: `0x${string}`
  recyclingCenter: `0x${string}`
  materialType: string
  amount: bigint
  paymentAmount: bigint
  paymentToken: PaymentToken // Nuevo campo
  status: DeliveryStatus
  createdAt: bigint
  validatedAt: bigint
  rejectionReason: string
  metadata: string // Nuevo campo
}
