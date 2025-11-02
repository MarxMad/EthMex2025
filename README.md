# 🌱 EcoRecicla - Plataforma de Reciclaje Blockchain

> **El Uber del Reciclaje** - Conectamos usuarios, recolectores y centros de reciclaje para transformar residuos en oportunidades mediante tecnología blockchain.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Arbitrum](https://img.shields.io/badge/Arbitrum-Sepolia-28A0F0?style=for-the-badge&logo=arbitrum)](https://arbitrum.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Lean Canvas](#-lean-canvas)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contrato Inteligente](#-contrato-inteligente)
- [Guías de Uso](#-guías-de-uso)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)

---

## 🎯 Visión General

**EcoRecicla** es una plataforma descentralizada que revoluciona la economía circular del reciclaje en México mediante blockchain. Conectamos tres actores clave: usuarios que reciclan, recolectores independientes y centros de reciclaje autorizados, creando un ecosistema transparente, seguro y rentable para todos.

### 🎪 Concepto Principal

"**El Uber del Reciclaje**" - Así como Uber conecta pasajeros con conductores, EcoRecicla conecta usuarios con recolectores y centros de reciclaje, facilitando el proceso de reciclaje desde la solicitud hasta el pago final.

---

## 📊 Lean Canvas

### 1. **Problema**

#### Problemas del Cliente:
- ❌ **Falta de transparencia** en el proceso de reciclaje
- ❌ **Pagos inciertos** o tardíos por materiales reciclables
- ❌ **Desconfianza** entre usuarios, recolectores y centros
- ❌ **Falta de trazabilidad** del material desde origen hasta destino
- ❌ **Dificultad** para encontrar recolectores o centros cercanos
- ❌ **Precios variables** y poco transparentes

#### Problemas Existentes:
- Sistema tradicional sin garantías de pago
- Falta de verificación de calidad del material
- Ineficiencia en la cadena de recolección
- Alto riesgo de fraude o materiales no aceptados

---

### 2. **Segmentos de Cliente**

#### Cliente Primario:
1. **Usuarios y Empresas** que generan material reciclable
   - Personas que quieren reciclar desde casa
   - Empresas que generan residuos reciclables
   - Comunidades organizadas

2. **Recolectores Independientes**
   - Recolectores informales que buscan ingresos
   - Emprendedores en el sector del reciclaje
   - Personas con vehículos que quieren trabajar de forma flexible

3. **Centros de Reciclaje**
   - Centros formales e informales
   - Empresas de procesamiento de materiales
   - Instalaciones de reciclaje que necesitan materias primas

---

### 3. **Solución Única**

#### Propuesta de Valor:
✅ **Sistema de Escrow Blockchain**: Pagos garantizados mediante smart contracts  
✅ **Validación Transparente**: Verificación on-chain de calidad y cantidad  
✅ **Trazabilidad Completa**: Historial inmutable de todas las transacciones  
✅ **Multi-token Support**: Pagos en ETH, USDC o MXNB según preferencia  
✅ **Dashboard en Tiempo Real**: Seguimiento completo del proceso  
✅ **Economía Circular Transparente**: Todos ganan, todos verifican  

#### Características Diferenciadoras:
- **Smart Contract con Escrow**: Fondos bloqueados hasta validación
- **Sistema de Comisiones Configurable**: Modelo de negocio sostenible
- **Precios Dinámicos**: Configurables por material y método de pago
- **Verificación On-Chain**: Calidad y cantidad verificadas antes del pago

---

### 4. **Propuesta de Valor**

#### Para Usuarios:
- 💰 **Pago Garantizado**: Fondos en escrow hasta validación
- 🔍 **Transparencia Total**: Ver todo el proceso en blockchain
- ⚡ **Solicitud Rápida**: Como pedir un Uber
- 📱 **App Intuitiva**: Interfaz moderna y fácil de usar

#### Para Recolectores:
- 💼 **Ingresos Flexibles**: Trabaja cuando quieras
- 📍 **Solicitudes Cercanas**: Material cerca de ti
- 🔐 **Pagos Seguros**: Garantizados por blockchain
- 📊 **Dashboard de Ganancias**: Seguimiento en tiempo real

#### Para Centros:
- ✅ **Calidad Verificada**: Material verificado antes de recibir
- 💳 **Pagos Automáticos**: Sistema de escrow garantiza el proceso
- 📈 **Gestión Eficiente**: Dashboard para gestionar entregas
- 🎯 **Trazabilidad Completa**: Historial de todas las transacciones

---

### 5. **Canales**

- 🌐 **Plataforma Web**: Next.js con interfaz moderna
- 📱 **Acceso Móvil**: Web responsive optimizada
- 🔗 **MetaMask Integration**: Wallet connection nativo
- 📢 **Marketing Digital**: Redes sociales y contenido
- 🤝 **Partnerships**: Alianzas con centros de reciclaje
- 🎓 **Educación**: Programas de concientización

---

### 6. **Flujo de Ingresos**

#### Revenue Streams:
1. **Comisiones por Transacción**
   - Tasa configurable (1-10% por defecto)
   - Cobrada al validar entregas
   - Distribuida a wallet de comisiones

2. **Modelo de Suscripción** (Futuro)
   - Suscripciones premium para centros
   - Características avanzadas de dashboard

3. **Publicidad** (Futuro)
   - Anuncios de empresas eco-friendly
   - Promoción de productos sostenibles

---

### 7. **Estructura de Costos**

#### Costos Principales:
- 💻 **Desarrollo y Mantenimiento**: Infraestructura técnica
- ⛽ **Gas Fees de Blockchain**: Costos de transacciones en Arbitrum
- 🖥️ **Hosting y Servicios**: Vercel, RPC providers
- 🔐 **Seguridad y Auditorías**: Smart contract security
- 📢 **Marketing y Crecimiento**: Adquisición de usuarios

---

### 8. **Métricas Clave**

#### KPIs Principales:
- 📊 **Entregas Completadas**: Número de transacciones exitosas
- 💰 **Volumen Total en Escrow**: Fondos gestionados
- 👥 **Usuarios Activos**: MAU (Monthly Active Users)
- 🔄 **Tasa de Validación**: % de entregas validadas vs rechazadas
- 💵 **Revenue por Transacción**: Comisiones generadas
- ⏱️ **Tiempo Promedio de Validación**: Eficiencia del proceso

---

### 9. **Ventaja Competitiva**

#### Unfair Advantage:
🚀 **Tecnología Blockchain**: Primera plataforma de reciclaje con escrow inteligente en México  
🔒 **Transparencia Total**: Todo registrado en blockchain, inmutable  
💎 **Trustless System**: No requiere confianza, el código es la ley  
🌐 **Descentralización**: Sin intermediarios tradicionales  
⚡ **Eficiencia**: Procesos automatizados, menos fricción  
💰 **Multi-token**: Flexibilidad de pagos (ETH, USDC, MXNB)  

---

## ✨ Características Principales

### 🔐 Funcionalidades Blockchain

- **Sistema de Escrow Inteligente**: Fondos bloqueados hasta validación
- **Multi-Token Payments**: Soporte para ETH, USDC y MXNB
- **Smart Contract Verificado**: Contrato auditado y desplegado en Arbitrum Sepolia
- **Trazabilidad Completa**: Historial inmutable de todas las transacciones
- **Sistema de Comisiones**: Tasa configurable para sostenibilidad

### 📱 Funcionalidades de Usuario

- **Solicitud de Recolección**: Interfaz intuitiva para crear solicitudes
- **Dashboard Personal**: Seguimiento de entregas y pagos
- **Selector de Centros**: Lista dinámica de centros autorizados
- **Historial Completo**: Todas las transacciones registradas

### 🏭 Funcionalidades de Centro

- **Dashboard de Gestión**: Vista de entregas pendientes y completadas
- **Verificación de Materiales**: Validar o rechazar entregas
- **Registro de Nuevos Centros**: Sistema de autorización por owner

### 🚚 Funcionalidades de Recolector

- **Solicitudes Disponibles**: Ver entregas pendientes de recolección
- **Tracking de Rutas**: Seguimiento en tiempo real
- **Gestión de Ganancias**: Dashboard de pagos y comisiones

---

## 🛠️ Stack Tecnológico

### Frontend

- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Estilos utility-first
- **[Shadcn UI](https://ui.shadcn.com/)** - Componentes UI modernos
- **[Radix UI](https://www.radix-ui.com/)** - Primitivos accesibles
- **[Lucide React](https://lucide.dev/)** - Iconos modernos

### Blockchain & Web3

- **[Wagmi v2.19](https://wagmi.sh/)** - React Hooks para Ethereum
- **[Viem v2.38](https://viem.sh/)** - TypeScript Ethereum Library
- **[Arbitrum Sepolia](https://arbitrum.io/)** - Layer 2 Testnet
- **[MetaMask](https://metamask.io/)** - Wallet integration
- **[Solidity ^0.8.24](https://soliditylang.org/)** - Smart contracts

### Smart Contracts

- **[OpenZeppelin Contracts](https://www.openzeppelin.com/contracts)** - Contratos seguros
  - `Ownable` - Control de ownership
  - `ReentrancyGuard` - Protección contra reentrancy
  - `SafeERC20` - Manejo seguro de tokens ERC20

### State Management & Data Fetching

- **[TanStack Query](https://tanstack.com/query)** - Data fetching y cache
- **[React Hooks](https://react.dev/)** - State management nativo

### Herramientas de Desarrollo

- **[pnpm](https://pnpm.io/)** - Package manager rápido
- **[ESLint](https://eslint.org/)** - Linting
- **[TypeScript](https://www.typescriptlang.org/)** - Type checking

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ o superior
- pnpm (o npm/yarn)
- MetaMask instalado en tu navegador
- Cuenta en Arbitrum Sepolia con ETH para gas

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MarxMad/EthMex2025.git
cd EthMex2025

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### Configuración de MetaMask

1. Agrega la red **Arbitrum Sepolia** en MetaMask:
   - **Nombre**: Arbitrum Sepolia
   - **RPC URL**: `https://sepolia-rollup.arbitrum.io/rpc`
   - **Chain ID**: `421614`
   - **Símbolo**: `ETH`
   - **Explorador**: `https://sepolia.arbiscan.io`

2. Obtén ETH de prueba en [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

---

## 📁 Estructura del Proyecto

```
v0-recycling-app-design/
├── app/                          # Next.js App Router
│   ├── centro/                   # Dashboard y registro de centros
│   │   ├── dashboard/
│   │   ├── registro/
│   │   └── verificar/[id]/
│   ├── usuario/                  # Funcionalidades de usuarios
│   │   ├── dashboard/
│   │   ├── solicitar/
│   │   └── pagos/
│   ├── recolector/               # Funcionalidades de recolectores
│   │   ├── dashboard/
│   │   └── solicitud/[id]/
│   └── layout.tsx                # Layout principal con WagmiProvider
│
├── components/                   # Componentes React
│   ├── providers/                # Wagmi provider
│   ├── ui/                       # Componentes Shadcn UI
│   ├── web3/                     # Wallet connect
│   └── recycling-center-selector.tsx
│
├── contracts/                    # Contratos inteligentes
│   ├── RecyclingEscrowV2.sol    # Contrato principal
│   └── *.md                      # Documentación de deployment
│
├── lib/                          # Utilidades y configuración
│   ├── chains/                   # Configuración de chains
│   ├── contracts.ts              # ABI y direcciones del contrato
│   ├── hooks/                    # Custom React hooks
│   │   └── use-recycling-contract.ts
│   └── wagmi-config.ts          # Configuración de wagmi
│
└── public/                       # Archivos estáticos
```

---

## 📜 Contrato Inteligente

### Información del Contrato

- **Nombre**: `RecyclingEscrowV2`
- **Red**: Arbitrum Sepolia (Testnet)
- **Dirección**: `0x83501eae542748590639649f2e951b653c509b1b`
- **Explorador**: [Ver en Arbiscan](https://sepolia.arbiscan.io/address/0x83501eae542748590639649f2e951b653c509b1b)
- **Chain ID**: `421614`

### Funciones Principales

#### Para Usuarios:
- `createDelivery()` - Crear una solicitud de recolección
- `withdrawFunds()` - Retirar fondos de entregas validadas

#### Para Centros:
- `validateDelivery()` - Validar y pagar una entrega
- `rejectDelivery()` - Rechazar una entrega con razón
- `getCenterDeliveries()` - Obtener entregas del centro

#### Para Owner:
- `addRecyclingCenter()` - Autorizar nuevos centros
- `removeRecyclingCenter()` - Remover centros autorizados
- `setMaterialPrice()` - Configurar precios por material
- `setCommissionRate()` - Configurar tasa de comisión

### Características del Contrato

✅ **Sistema de Escrow**: Fondos bloqueados hasta validación  
✅ **Multi-Token Support**: ETH, USDC, MXNB  
✅ **Comisiones Configurables**: 1-10% (en basis points)  
✅ **Precios Dinámicos**: Configurables por material y token  
✅ **Seguridad Mejorada**: ReentrancyGuard, SafeERC20, Ownable  
✅ **Metadata Support**: Campo para información adicional  

Ver documentación completa en [`contracts/RecyclingEscrowV2.sol`](./contracts/RecyclingEscrowV2.sol)

---

## 📖 Guías de Uso

### Para Usuarios

1. **Conecta tu Wallet**
   - Haz clic en "Conectar Wallet" en el header
   - Acepta la conexión en MetaMask
   - Asegúrate de estar en Arbitrum Sepolia

2. **Crear una Solicitud de Recolección**
   - Ve a "Solicitar Recolección"
   - Selecciona un centro de reciclaje
   - Completa el formulario (tipo de material, cantidad, dirección)
   - Selecciona método de pago (ETH, USDC o MXNB)
   - Revisa el pago estimado
   - Confirma la transacción en MetaMask

3. **Seguir tu Solicitud**
   - Ve al Dashboard de Usuario
   - Revisa el estado de tus entregas
   - Cuando sea validada, puedes retirar los fondos

### Para Centros de Reciclaje

1. **Registro como Centro**
   - Ve a "Ser Centro de Reciclaje"
   - Completa el formulario de registro
   - El owner del contrato debe autorizar tu wallet
   - Una vez autorizado, podrás recibir entregas

2. **Gestionar Entregas**
   - Accede al Dashboard del Centro
   - Revisa entregas pendientes
   - Valida o rechaza entregas según calidad/cantidad
   - El pago se libera automáticamente al validar

### Para Recolectores

1. **Ver Solicitudes Disponibles**
   - Accede al Dashboard de Recolector
   - Revisa solicitudes pendientes cerca de ti
   - Acepta las que puedas recoger

2. **Completar Recolección**
   - Lleva el material al centro designado
   - El centro verificará y validará
   - El pago se procesará automáticamente

---

## 🚀 Despliegue

### Despliegue del Frontend

El proyecto está configurado para Vercel:

```bash
# Build para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

### Despliegue del Contrato

Ver guías detalladas:
- [`DEPLOYMENT_V2_REMIX.md`](./DEPLOYMENT_V2_REMIX.md) - Guía completa
- [`contracts/QUICK_DEPLOY.md`](./contracts/QUICK_DEPLOY.md) - Despliegue rápido
- [`contracts/DEPLOY_REMIX.md`](./contracts/DEPLOY_REMIX.md) - Paso a paso

**Parámetros de Constructor**:
```solidity
constructor(
    0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1,  // USDC Arbitrum Sepolia
    0x7911e898d0F91Db0DF9604574878906a3aB3E61e,   // MXNB Arbitrum Sepolia
    0xTuDireccionWallet,                          // Commission wallet
    100                                           // Commission rate: 1%
)
```

---

## 🧪 Testing

```bash
# Linter
pnpm lint

# Type checking
npx tsc --noEmit
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Usa commits descriptivos

---

## 📄 Licencia

Este proyecto es parte de **ETHMexico 2025** y está desarrollado con fines educativos y de innovación social.

---

## 👥 Equipo

**EthMex2025 Team**

Desarrollado con ❤️ para un futuro sostenible y un México más verde.

---

## 🔗 Enlaces Útiles

- **Contrato en Arbiscan**: [Ver Contrato](https://sepolia.arbiscan.io/address/0x83501eae542748590639649f2e951b653c509b1b)
- **Arbitrum Sepolia**: [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io)
- **Documentación Wagmi**: [Wagmi Docs](https://wagmi.sh/)
- **Documentación Viem**: [Viem Docs](https://viem.sh/)

---

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Integración completa de contrato en frontend
- [x] Sistema de agregar centros autorizados
- [x] Creación de entregas con multi-token
- [x] Validación y rechazo de entregas
- [x] Dashboard de usuarios y centros
- [x] Sistema de escrow funcional
- [x] Configuración para Arbitrum Sepolia

### 🚧 En Desarrollo

- [ ] Integración completa de USDC y MXNB
- [ ] Dashboard de recolectores
- [ ] Sistema de notificaciones
- [ ] Optimización de gas fees

### 📋 Pendiente

- [ ] Auditoría de seguridad del contrato
- [ ] Despliegue en mainnet
- [ ] App móvil nativa
- [ ] Sistema de reputación

---

## 🙏 Agradecimientos

- OpenZeppelin por las librerías de contratos seguros
- Comunidad de Ethereum y Arbitrum
- Equipo de Next.js y React
- Todos los contribuidores del ecosistema Web3

---

<div align="center">

**🌱 Transformando residuos en oportunidades, un bloque a la vez 🌱**

Made with ❤️ in México for ETHMexico 2025

</div>