# Project Description

## CriKula - Blockchain-Powered Recycling Platform

**CriKula** is a decentralized recycling platform that revolutionizes the circular economy in Mexico through blockchain technology. Dubbed "The Uber of Recycling," the platform connects three key stakeholders: users who want to recycle, independent collectors, and authorized recycling centers, creating a transparent, secure, and profitable ecosystem for all participants.

### Key Features

- **Smart Contract Escrow System**: Payments are secured in escrow until delivery validation, protecting all parties involved
- **Multi-Token Support**: Accepts payments in ETH, USDC, or MXNB based on user preference
- **Dynamic Pricing**: Each recycling center can set custom prices per material type and payment method
- **Full Traceability**: Complete immutable transaction history on the blockchain
- **Role-Based Dashboard**: Dedicated interfaces for users, collectors, and recycling centers
- **Decentralized & Trustless**: No intermediaries, code is law

### Technology Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Shadcn UI
- **Blockchain**: Arbitrum Sepolia (Layer 2), Solidity ^0.8.24
- **Web3**: Wagmi v2, Viem v2, RainbowKit v2
- **Smart Contracts**: OpenZeppelin contracts (Ownable, ReentrancyGuard, SafeERC20)

### How It Works

1. **Users** create recycling requests by selecting a center, material type, and payment method
2. **Collectors** accept pickup requests and deliver materials to designated centers
3. **Recycling Centers** validate material quality and quantity, triggering automatic payment release via escrow
4. Funds are automatically distributed: user receives payment, platform collects commission (configurable)

### Current Status

- ✅ Fully functional smart contract deployed on Arbitrum Sepolia
- ✅ Complete frontend integration with role-based dashboards
- ✅ Escrow system operational
- ✅ Multi-token payment support
- 🚧 Route tracking and mobile app in development

### Contract Address

**Arbitrum Sepolia**: `0x9eac6fff8014b159bd930cb526c3059a1a65e298`

---

*Built for ETHMexico 2025 - Transforming waste into opportunities, one block at a time*

