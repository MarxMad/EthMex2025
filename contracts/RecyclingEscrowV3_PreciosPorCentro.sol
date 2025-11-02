// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecyclingEscrowV3
 * @dev Versión mejorada que soporta precios por centro de reciclaje
 * Cada centro puede tener sus propios precios por material y token
 */
contract RecyclingEscrowV3 is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ CONSTANTES DE TOKENS ============
    // Direcciones oficiales para facilitar el despliegue
    // Solo necesitas escribir el nombre de la constante en Remix, no la dirección completa!
    
    // Arbitrum Sepolia (Testnet) - ⭐ USAR ESTAS PARA SEPOLIA
    address public constant ARBITRUM_SEPOLIA_USDC = 0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1;
    address public constant ARBITRUM_SEPOLIA_MXNB = 0x7911e898d0F91Db0DF9604574878906a3aB3E61e;
    
    // Arbitrum One (Mainnet) - Solo para producción
    address public constant ARBITRUM_ONE_USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant ARBITRUM_ONE_MXNB = 0x59B07Ab47481E1B95E15E96b06DfDA50b50F1053;
    
    // ============ FIN CONSTANTES ============

    enum DeliveryStatus {
        Pending,
        Validated,
        Rejected,
        Completed
    }

    enum PaymentToken {
        ETH,
        USDC,
        MXNB
    }

    struct Delivery {
        address user;
        address recyclingCenter;
        address collector; // Recolector que aceptó la entrega
        string materialType;
        uint256 amount;
        uint256 paymentAmount;
        PaymentToken paymentToken;
        DeliveryStatus status;
        uint256 createdAt;
        uint256 validatedAt;
        string rejectionReason;
        string metadata;
    }

    // Variables de estado
    mapping(address => bool) public recyclingCenters;
    mapping(uint256 => Delivery) public deliveries;
    // OPTIMIZACIÓN: Eliminados userDeliveries y centerDeliveries para reducir gas
    // Las entregas se pueden obtener mediante eventos filtrados por dirección
    
    address public usdcToken;
    address public mxnbToken;
    
    // NUEVO: Precios por centro, material y token
    // center => materialType => token => price per kg
    mapping(address => mapping(string => mapping(PaymentToken => uint256))) public centerMaterialPrices;
    
    // Fallback: Precios globales si el centro no tiene precio configurado
    mapping(string => mapping(PaymentToken => uint256)) public globalMaterialPrices;
    
    uint256 public deliveryCounter;
    uint256 public totalEscrowedETH;
    mapping(PaymentToken => uint256) public totalEscrowedTokens;
    
    uint256 public commissionRate;
    address public commissionWallet;
    
    // Events
    event DeliveryCreated(
        uint256 indexed deliveryId,
        address indexed user,
        address indexed recyclingCenter,
        string materialType,
        uint256 amount,
        uint256 paymentAmount,
        PaymentToken paymentToken
    );
    
    event DeliveryAccepted(
        uint256 indexed deliveryId,
        address indexed collector,
        uint256 paymentAmount,
        PaymentToken paymentToken
    );
    
    event DeliveryValidated(
        uint256 indexed deliveryId,
        address indexed user,
        address indexed collector,
        uint256 paymentAmount,
        PaymentToken paymentToken
    );
    
    event DeliveryRejected(
        uint256 indexed deliveryId,
        address indexed user,
        address indexed collector,
        string reason
    );
    
    event FundsWithdrawn(
        uint256 indexed deliveryId,
        address indexed user,
        uint256 amount,
        PaymentToken paymentToken
    );
    
    event RecyclingCenterAdded(address indexed center);
    event RecyclingCenterRemoved(address indexed center);
    
    event CenterMaterialPriceSet(
        address indexed center,
        string indexed materialType,
        PaymentToken indexed token,
        uint256 price
    );
    
    event GlobalMaterialPriceSet(
        string indexed materialType,
        PaymentToken indexed token,
        uint256 price
    );

    modifier validPaymentToken(PaymentToken _token) {
        require(
            _token == PaymentToken.ETH ||
            (_token == PaymentToken.USDC && usdcToken != address(0)) ||
            (_token == PaymentToken.MXNB && mxnbToken != address(0)),
            "Invalid or unsupported payment token"
        );
        _;
    }

    /**
     * @dev Constructor del contrato
     * @param _usdcToken Dirección del token USDC - Usar constante ARBITRUM_SEPOLIA_USDC para Sepolia
     * @param _mxnbToken Dirección del token MXNB - Usar constante ARBITRUM_SEPOLIA_MXNB para Sepolia
     * @param _commissionWallet Dirección que recibirá las comisiones
     * @param _commissionRate Tasa de comisión en basis points (100 = 1%, 1000 = 10% máximo)
     * 
     * Para Arbitrum Sepolia (Testnet) - ⭐ ACTUAL:
     * En Remix, simplemente escribe:
     * ARBITRUM_SEPOLIA_USDC
     * ARBITRUM_SEPOLIA_MXNB
     * 0xTuWallet
     * 100
     * 
     * Para Arbitrum One Mainnet (Producción):
     * ARBITRUM_ONE_USDC
     * ARBITRUM_ONE_MXNB
     * 0xTuWallet
     * 100
     */
    constructor(
        address _usdcToken,
        address _mxnbToken,
        address _commissionWallet,
        uint256 _commissionRate
    ) Ownable(msg.sender) {
        require(_commissionWallet != address(0), "Invalid commission wallet");
        require(_commissionRate <= 1000, "Commission rate too high"); // Max 10%
        
        usdcToken = _usdcToken;
        mxnbToken = _mxnbToken;
        commissionWallet = _commissionWallet;
        commissionRate = _commissionRate;
    }

    /**
     * @dev Crea una nueva entrega de material reciclable
     * NUEVO MODELO: El usuario NO paga, solo crea la solicitud con precio calculado
     * El recolector será quien pague cuando acepte la entrega
     * NOTA: Esta función NO es payable, por lo que Solidity rechazará automáticamente
     * cualquier transacción que intente enviar ETH.
     */
    function createDelivery(
        address _recyclingCenter,
        string memory _materialType,
        uint256 _amount,
        PaymentToken _paymentToken,
        string memory _metadata
    ) external nonReentrant validPaymentToken(_paymentToken) returns (uint256) {
        require(
            recyclingCenters[_recyclingCenter],
            "Invalid recycling center"
        );
        require(_amount > 0, "Amount must be greater than zero");
        // No verificar msg.value aquí - la función no es payable, 
        // Solidity rechazará automáticamente si se envía ETH

        // Obtener precio: primero del centro, luego global
        uint256 pricePerKg = centerMaterialPrices[_recyclingCenter][_materialType][_paymentToken];
        if (pricePerKg == 0) {
            pricePerKg = globalMaterialPrices[_materialType][_paymentToken];
        }
        require(pricePerKg > 0, "Price not set for this material and token");
        uint256 requiredPayment = _amount * pricePerKg;

        uint256 deliveryId = deliveryCounter;
        deliveryCounter++;

        deliveries[deliveryId] = Delivery({
            user: msg.sender,
            recyclingCenter: _recyclingCenter,
            collector: address(0), // Aún no tiene recolector asignado
            materialType: _materialType,
            amount: _amount,
            paymentAmount: requiredPayment,
            paymentToken: _paymentToken,
            status: DeliveryStatus.Pending,
            createdAt: block.timestamp,
            validatedAt: 0,
            rejectionReason: "",
            metadata: _metadata
        });

        emit DeliveryCreated(
            deliveryId,
            msg.sender,
            _recyclingCenter,
            _materialType,
            _amount,
            requiredPayment,
            _paymentToken
        );

        return deliveryId;
    }

    /**
     * @dev Recolector acepta una entrega y bloquea el pago en el contrato
     * Esta función requiere que el recolector pague el monto calculado
     */
    function acceptDelivery(
        uint256 _deliveryId
    ) external payable nonReentrant returns (bool) {
        Delivery storage delivery = deliveries[_deliveryId];
        
        require(delivery.user != address(0), "Delivery does not exist");
        require(
            delivery.status == DeliveryStatus.Pending,
            "Delivery not pending"
        );
        require(
            delivery.collector == address(0),
            "Delivery already accepted by another collector"
        );
        require(msg.sender != delivery.user, "User cannot accept their own delivery");

        // Verificar y transferir pago según el token
        if (delivery.paymentToken == PaymentToken.ETH) {
            require(msg.value >= delivery.paymentAmount, "Insufficient ETH payment");
            
            // Bloquear el pago en el contrato
            totalEscrowedETH += delivery.paymentAmount;
            
            // Reembolsar exceso si hay
            if (msg.value > delivery.paymentAmount) {
                (bool refundSuccess, ) = payable(msg.sender).call{
                    value: msg.value - delivery.paymentAmount
                }("");
                require(refundSuccess, "Refund failed");
            }
        } else {
            address tokenAddress = delivery.paymentToken == PaymentToken.USDC 
                ? usdcToken 
                : mxnbToken;
            IERC20 token = IERC20(tokenAddress);
            
            require(msg.value == 0, "ETH sent but token payment expected");
            require(
                token.balanceOf(msg.sender) >= delivery.paymentAmount,
                "Insufficient token balance"
            );
            require(
                token.allowance(msg.sender, address(this)) >= delivery.paymentAmount,
                "Insufficient token allowance"
            );
            
            token.safeTransferFrom(msg.sender, address(this), delivery.paymentAmount);
            totalEscrowedTokens[delivery.paymentToken] += delivery.paymentAmount;
        }

        // Asignar recolector a la entrega
        delivery.collector = msg.sender;

        emit DeliveryAccepted(
            _deliveryId,
            msg.sender,
            delivery.paymentAmount,
            delivery.paymentToken
        );

        return true;
    }

    /**
     * @dev Valida una entrega y libera el pago al usuario desde los fondos del recolector
     * El dinero fue depositado por el recolector al aceptar la entrega
     */
    function validateDelivery(
        uint256 _deliveryId
    ) external nonReentrant {
        Delivery storage delivery = deliveries[_deliveryId];
        require(
            recyclingCenters[msg.sender],
            "Only authorized recycling centers can validate"
        );
        require(
            delivery.recyclingCenter == msg.sender,
            "Center mismatch"
        );
        require(
            delivery.status == DeliveryStatus.Pending,
            "Delivery not pending"
        );
        require(
            delivery.collector != address(0),
            "Delivery must be accepted by a collector first"
        );

        delivery.status = DeliveryStatus.Validated;
        delivery.validatedAt = block.timestamp;

        uint256 paymentAmount = delivery.paymentAmount;
        uint256 commission = (paymentAmount * commissionRate) / 10000;
        uint256 userPayment = paymentAmount - commission;

        if (delivery.paymentToken == PaymentToken.ETH) {
            totalEscrowedETH -= paymentAmount;
            
            // Transferir comisión al wallet de comisiones
            if (commission > 0) {
                (bool commissionSuccess, ) = payable(commissionWallet).call{value: commission}("");
                require(commissionSuccess, "Commission transfer failed");
            }
            
            // Transferir pago al usuario (dinero viene del recolector que lo depositó)
            (bool userPaymentSuccess, ) = payable(delivery.user).call{value: userPayment}("");
            require(userPaymentSuccess, "User payment transfer failed");
        } else {
            address tokenAddress = delivery.paymentToken == PaymentToken.USDC 
                ? usdcToken 
                : mxnbToken;
            IERC20 token = IERC20(tokenAddress);
            
            totalEscrowedTokens[delivery.paymentToken] -= paymentAmount;
            
            // Transferir comisión
            if (commission > 0) {
                token.safeTransfer(commissionWallet, commission);
            }
            
            // Transferir pago al usuario (dinero viene del recolector)
            token.safeTransfer(delivery.user, userPayment);
        }

        emit DeliveryValidated(
            _deliveryId,
            delivery.user,
            delivery.collector,
            userPayment,
            delivery.paymentToken
        );
    }

    /**
     * @dev Rechaza una entrega y devuelve el dinero al recolector
     * El dinero fue depositado por el recolector, por lo que se le devuelve
     */
    function rejectDelivery(
        uint256 _deliveryId,
        string memory _reason
    ) external nonReentrant {
        Delivery storage delivery = deliveries[_deliveryId];
        require(
            recyclingCenters[msg.sender],
            "Only authorized recycling centers can reject"
        );
        require(
            delivery.recyclingCenter == msg.sender,
            "Center mismatch"
        );
        require(
            delivery.status == DeliveryStatus.Pending,
            "Delivery not pending"
        );
        require(
            delivery.collector != address(0),
            "Delivery must be accepted by a collector first"
        );

        delivery.status = DeliveryStatus.Rejected;
        delivery.rejectionReason = _reason;

        uint256 refundAmount = delivery.paymentAmount;

        if (delivery.paymentToken == PaymentToken.ETH) {
            totalEscrowedETH -= refundAmount;
            // Devolver el dinero al recolector que lo depositó
            (bool refundSuccess, ) = payable(delivery.collector).call{value: refundAmount}("");
            require(refundSuccess, "Refund transfer failed");
        } else {
            address tokenAddress = delivery.paymentToken == PaymentToken.USDC 
                ? usdcToken 
                : mxnbToken;
            IERC20 token = IERC20(tokenAddress);
            
            totalEscrowedTokens[delivery.paymentToken] -= refundAmount;
            // Devolver el dinero al recolector que lo depositó
            token.safeTransfer(delivery.collector, refundAmount);
        }

        emit DeliveryRejected(_deliveryId, delivery.user, delivery.collector, _reason);
    }

    /**
     * @dev Configura el precio de un material para un centro específico
     * Solo el owner o el propio centro pueden configurar
     */
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

    /**
     * @dev Configura el precio global de un material (fallback)
     * Solo owner
     */
    function setGlobalMaterialPrice(
        string memory _materialType,
        PaymentToken _token,
        uint256 _pricePerKg
    ) external onlyOwner {
        globalMaterialPrices[_materialType][_token] = _pricePerKg;
        emit GlobalMaterialPriceSet(_materialType, _token, _pricePerKg);
    }

    /**
     * @dev Obtiene el precio para un centro, material y token
     * Retorna el precio del centro si existe, sino el global
     */
    function getMaterialPrice(
        address _center,
        string memory _materialType,
        PaymentToken _token
    ) external view returns (uint256) {
        uint256 centerPrice = centerMaterialPrices[_center][_materialType][_token];
        if (centerPrice > 0) {
            return centerPrice;
        }
        return globalMaterialPrices[_materialType][_token];
    }

    /**
     * @dev Agrega un centro de reciclaje autorizado
     */
    function addRecyclingCenter(
        address _center
    ) external onlyOwner {
        require(_center != address(0), "Invalid address");
        require(
            !recyclingCenters[_center],
            "Center already authorized"
        );
        
        recyclingCenters[_center] = true;
        emit RecyclingCenterAdded(_center);
    }

    /**
     * @dev Remueve un centro de reciclaje autorizado
     */
    function removeRecyclingCenter(
        address _center
    ) external onlyOwner {
        require(recyclingCenters[_center], "Center not authorized");
        recyclingCenters[_center] = false;
        emit RecyclingCenterRemoved(_center);
    }

    // ... resto de funciones del contrato V2 (withdrawFunds, getDelivery, etc.)
    // Por ahora solo mostramos las funciones clave relacionadas con precios por centro
}

