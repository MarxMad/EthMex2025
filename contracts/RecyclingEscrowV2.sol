// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecyclingEscrowV2
 * @dev Contrato inteligente mejorado para gestionar entregas de materiales reciclables
 * con soporte para múltiples métodos de pago (ETH, USDC, MXNB)
 * y sistema de escrow que bloquea fondos hasta validación del centro
 */
contract RecyclingEscrowV2 is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Enums
    enum DeliveryStatus {
        Pending,    // Pendiente de validación
        Validated,  // Validado por el centro
        Rejected,   // Rechazado por el centro
        Completed   // Proceso completado
    }

    enum PaymentToken {
        ETH,   // Ether nativo
        USDC,  // USD Coin
        MXNB   // MXNB token
    }

    // Structs
    struct Delivery {
        address user;                    // Dirección del usuario que entrega
        address recyclingCenter;         // Dirección del centro de reciclaje
        string materialType;             // Tipo de material (plástico, vidrio, etc.)
        uint256 amount;                  // Cantidad entregada (en kg o unidades)
        uint256 paymentAmount;          // Monto bloqueado en escrow
        PaymentToken paymentToken;       // Token usado para el pago
        DeliveryStatus status;           // Estado de la entrega
        uint256 createdAt;               // Timestamp de creación
        uint256 validatedAt;             // Timestamp de validación
        string rejectionReason;         // Razón del rechazo (si aplica)
        string metadata;                 // Metadata adicional (IPFS hash, JSON, etc.)
    }

    // Variables de estado
    mapping(address => bool) public recyclingCenters;           // Centros autorizados
    mapping(uint256 => Delivery) public deliveries;            // Registro de entregas
    mapping(address => uint256[]) public userDeliveries;        // Entregas por usuario
    mapping(address => uint256[]) public centerDeliveries;     // Entregas por centro
    
    // Direcciones de tokens soportados
    address public usdcToken;  // Dirección del contrato USDC
    address public mxnbToken;  // Dirección del contrato MXNB
    
    // Precios por tipo de material y token (en wei/token units)
    mapping(string => mapping(PaymentToken => uint256)) public materialPrices; // materialType => token => price per kg
    
    uint256 public deliveryCounter;      // Contador de entregas
    uint256 public totalEscrowedETH;      // Total de ETH en escrow
    mapping(PaymentToken => uint256) public totalEscrowedTokens; // Total de tokens en escrow por tipo
    
    // Configuración
    uint256 public commissionRate;      // Tasa de comisión en basis points (100 = 1%)
    address public commissionWallet;      // Wallet que recibe las comisiones
    
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
    
    event DeliveryValidated(
        uint256 indexed deliveryId,
        address indexed user,
        uint256 paymentAmount,
        PaymentToken paymentToken
    );
    
    event DeliveryRejected(
        uint256 indexed deliveryId,
        address indexed user,
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
    
    event TokenAddressSet(PaymentToken indexed token, address indexed tokenAddress);
    event MaterialPriceSet(string indexed materialType, PaymentToken indexed token, uint256 price);
    event CommissionRateSet(uint256 indexed rate);
    event CommissionWalletSet(address indexed wallet);

    // Modifiers
    modifier onlyRecyclingCenter() {
        require(
            recyclingCenters[msg.sender],
            "Only authorized recycling center can call this function"
        );
        _;
    }
    
    modifier validDeliveryId(uint256 _deliveryId) {
        require(_deliveryId < deliveryCounter, "Invalid delivery ID");
        _;
    }

    modifier validPaymentToken(PaymentToken _token) {
        require(
            _token == PaymentToken.ETH || 
            (_token == PaymentToken.USDC && usdcToken != address(0)) ||
            (_token == PaymentToken.MXNB && mxnbToken != address(0)),
            "Invalid payment token or token not configured"
        );
        _;
    }

    /**
     * @dev Constructor
     * @param _usdcToken Dirección del contrato USDC
     * @param _mxnbToken Dirección del contrato MXNB
     * @param _commissionWallet Dirección que recibe comisiones
     * @param _commissionRate Tasa de comisión en basis points (ej: 100 = 1%)
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
     * @param _recyclingCenter Dirección del centro de reciclaje
     * @param _materialType Tipo de material entregado
     * @param _amount Cantidad de material entregado (en kg)
     * @param _paymentToken Token a usar para el pago
     * @param _metadata Metadata adicional (opcional)
     */
    function createDelivery(
        address _recyclingCenter,
        string memory _materialType,
        uint256 _amount,
        PaymentToken _paymentToken,
        string memory _metadata
    ) external payable nonReentrant validPaymentToken(_paymentToken) returns (uint256) {
        require(
            recyclingCenters[_recyclingCenter],
            "Invalid recycling center"
        );
        require(_amount > 0, "Amount must be greater than zero");

        // Calcular monto a pagar según precio del material
        uint256 pricePerKg = materialPrices[_materialType][_paymentToken];
        require(pricePerKg > 0, "Price not set for this material and token");
        uint256 requiredPayment = _amount * pricePerKg;

        // Verificar y transferir pago según el token
        if (_paymentToken == PaymentToken.ETH) {
            require(msg.value >= requiredPayment, "Insufficient ETH payment");
            // El ETH ya está en el contrato
            totalEscrowedETH += msg.value;
            
            // Reembolsar exceso si hay
            if (msg.value > requiredPayment) {
                (bool refundSuccess, ) = payable(msg.sender).call{
                    value: msg.value - requiredPayment
                }("");
                require(refundSuccess, "Refund failed");
            }
        } else {
            // Para tokens ERC20
            address tokenAddress = _paymentToken == PaymentToken.USDC ? usdcToken : mxnbToken;
            IERC20 token = IERC20(tokenAddress);
            
            require(msg.value == 0, "ETH sent but token payment expected");
            require(
                token.balanceOf(msg.sender) >= requiredPayment,
                "Insufficient token balance"
            );
            require(
                token.allowance(msg.sender, address(this)) >= requiredPayment,
                "Insufficient token allowance"
            );
            
            // Transferir tokens al contrato
            token.safeTransferFrom(msg.sender, address(this), requiredPayment);
            totalEscrowedTokens[_paymentToken] += requiredPayment;
        }

        uint256 deliveryId = deliveryCounter;
        deliveryCounter++;

        deliveries[deliveryId] = Delivery({
            user: msg.sender,
            recyclingCenter: _recyclingCenter,
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

        userDeliveries[msg.sender].push(deliveryId);
        centerDeliveries[_recyclingCenter].push(deliveryId);

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
     * @dev Valida una entrega de material (solo centros autorizados)
     * @param _deliveryId ID de la entrega a validar
     */
    function validateDelivery(
        uint256 _deliveryId
    ) external validDeliveryId(_deliveryId) onlyRecyclingCenter nonReentrant {
        Delivery storage delivery = deliveries[_deliveryId];
        
        require(
            delivery.recyclingCenter == msg.sender,
            "You are not authorized to validate this delivery"
        );
        require(
            delivery.status == DeliveryStatus.Pending,
            "Delivery is not pending"
        );

        delivery.status = DeliveryStatus.Validated;
        delivery.validatedAt = block.timestamp;

        // Calcular comisión
        uint256 commission = (delivery.paymentAmount * commissionRate) / 10000;
        uint256 userPayment = delivery.paymentAmount - commission;

        // Transferir fondos al usuario y comisión
        if (delivery.paymentToken == PaymentToken.ETH) {
            totalEscrowedETH -= delivery.paymentAmount;
            
            // Transferir comisión
            if (commission > 0) {
                (bool commissionSuccess, ) = payable(commissionWallet).call{
                    value: commission
                }("");
                require(commissionSuccess, "Commission transfer failed");
            }
            
            // Transferir al usuario
            (bool userSuccess, ) = payable(delivery.user).call{
                value: userPayment
            }("");
            require(userSuccess, "User transfer failed");
        } else {
            // Para tokens ERC20
            address tokenAddress = delivery.paymentToken == PaymentToken.USDC 
                ? usdcToken 
                : mxnbToken;
            IERC20 token = IERC20(tokenAddress);
            
            totalEscrowedTokens[delivery.paymentToken] -= delivery.paymentAmount;
            
            // Transferir comisión
            if (commission > 0) {
                token.safeTransfer(commissionWallet, commission);
            }
            
            // Transferir al usuario
            token.safeTransfer(delivery.user, userPayment);
        }

        emit DeliveryValidated(
            _deliveryId,
            delivery.user,
            userPayment,
            delivery.paymentToken
        );
    }

    /**
     * @dev Rechaza una entrega de material
     * @param _deliveryId ID de la entrega a rechazar
     * @param _reason Razón del rechazo
     */
    function rejectDelivery(
        uint256 _deliveryId,
        string memory _reason
    ) external validDeliveryId(_deliveryId) onlyRecyclingCenter nonReentrant {
        Delivery storage delivery = deliveries[_deliveryId];
        
        require(
            delivery.recyclingCenter == msg.sender,
            "You are not authorized to reject this delivery"
        );
        require(
            delivery.status == DeliveryStatus.Pending,
            "Delivery is not pending"
        );

        delivery.status = DeliveryStatus.Rejected;
        delivery.rejectionReason = _reason;

        // Reembolsar fondos al usuario
        if (delivery.paymentToken == PaymentToken.ETH) {
            totalEscrowedETH -= delivery.paymentAmount;
            (bool success, ) = payable(delivery.user).call{
                value: delivery.paymentAmount
            }("");
            require(success, "Refund failed");
        } else {
            address tokenAddress = delivery.paymentToken == PaymentToken.USDC 
                ? usdcToken 
                : mxnbToken;
            IERC20 token = IERC20(tokenAddress);
            
            totalEscrowedTokens[delivery.paymentToken] -= delivery.paymentAmount;
            token.safeTransfer(delivery.user, delivery.paymentAmount);
        }

        emit DeliveryRejected(_deliveryId, delivery.user, _reason);
    }

    /**
     * @dev Retira fondos de una entrega validada
     * @param _deliveryId ID de la entrega
     */
    function withdrawFunds(
        uint256 _deliveryId
    ) external validDeliveryId(_deliveryId) nonReentrant {
        Delivery storage delivery = deliveries[_deliveryId];
        
        require(
            delivery.user == msg.sender,
            "Only delivery owner can withdraw"
        );
        require(
            delivery.status == DeliveryStatus.Validated,
            "Delivery must be validated first"
        );

        delivery.status = DeliveryStatus.Completed;

        // Calcular comisión
        uint256 commission = (delivery.paymentAmount * commissionRate) / 10000;
        uint256 userPayment = delivery.paymentAmount - commission;

        if (delivery.paymentToken == PaymentToken.ETH) {
            // Transferir comisión
            if (commission > 0) {
                (bool commissionSuccess, ) = payable(commissionWallet).call{
                    value: commission
                }("");
                require(commissionSuccess, "Commission transfer failed");
            }
            
            // Transferir al usuario
            (bool success, ) = payable(msg.sender).call{
                value: userPayment
            }("");
            require(success, "Transfer failed");
        } else {
            address tokenAddress = delivery.paymentToken == PaymentToken.USDC 
                ? usdcToken 
                : mxnbToken;
            IERC20 token = IERC20(tokenAddress);
            
            // Transferir comisión
            if (commission > 0) {
                token.safeTransfer(commissionWallet, commission);
            }
            
            // Transferir al usuario
            token.safeTransfer(msg.sender, userPayment);
        }

        emit FundsWithdrawn(_deliveryId, msg.sender, userPayment, delivery.paymentToken);
    }

    /**
     * @dev Obtiene información de una entrega
     */
    function getDelivery(
        uint256 _deliveryId
    ) external view validDeliveryId(_deliveryId) returns (Delivery memory) {
        return deliveries[_deliveryId];
    }

    /**
     * @dev Obtiene todas las entregas de un usuario
     */
    function getUserDeliveries(
        address _user
    ) external view returns (uint256[] memory) {
        return userDeliveries[_user];
    }

    /**
     * @dev Obtiene todas las entregas de un centro
     */
    function getCenterDeliveries(
        address _center
    ) external view returns (uint256[] memory) {
        return centerDeliveries[_center];
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

    /**
     * @dev Configura la dirección de un token de pago
     */
    function setTokenAddress(
        PaymentToken _token,
        address _tokenAddress
    ) external onlyOwner {
        require(_token != PaymentToken.ETH, "Cannot set ETH address");
        
        if (_token == PaymentToken.USDC) {
            usdcToken = _tokenAddress;
        } else if (_token == PaymentToken.MXNB) {
            mxnbToken = _tokenAddress;
        }
        
        emit TokenAddressSet(_token, _tokenAddress);
    }

    /**
     * @dev Configura el precio de un material para un token específico
     * @param _materialType Tipo de material
     * @param _token Token de pago
     * @param _pricePerKg Precio por kg en wei/token units
     */
    function setMaterialPrice(
        string memory _materialType,
        PaymentToken _token,
        uint256 _pricePerKg
    ) external onlyOwner {
        materialPrices[_materialType][_token] = _pricePerKg;
        emit MaterialPriceSet(_materialType, _token, _pricePerKg);
    }

    /**
     * @dev Configura múltiples precios a la vez
     */
    function setMaterialPrices(
        string[] memory _materialTypes,
        PaymentToken[] memory _tokens,
        uint256[] memory _prices
    ) external onlyOwner {
        require(
            _materialTypes.length == _tokens.length && 
            _tokens.length == _prices.length,
            "Arrays length mismatch"
        );
        
        for (uint256 i = 0; i < _materialTypes.length; i++) {
            materialPrices[_materialTypes[i]][_tokens[i]] = _prices[i];
            emit MaterialPriceSet(_materialTypes[i], _tokens[i], _prices[i]);
        }
    }

    /**
     * @dev Configura la tasa de comisión
     */
    function setCommissionRate(
        uint256 _rate
    ) external onlyOwner {
        require(_rate <= 1000, "Commission rate too high"); // Max 10%
        commissionRate = _rate;
        emit CommissionRateSet(_rate);
    }

    /**
     * @dev Configura la wallet de comisiones
     */
    function setCommissionWallet(
        address _wallet
    ) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        commissionWallet = _wallet;
        emit CommissionWalletSet(_wallet);
    }

    /**
     * @dev Obtiene el precio de un material para un token
     */
    function getMaterialPrice(
        string memory _materialType,
        PaymentToken _token
    ) external view returns (uint256) {
        return materialPrices[_materialType][_token];
    }

    /**
     * @dev Obtiene el balance del contrato en ETH
     */
    function getContractBalanceETH() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Obtiene el balance del contrato en un token específico
     */
    function getContractBalanceToken(
        PaymentToken _token
    ) external view returns (uint256) {
        if (_token == PaymentToken.ETH) {
            return address(this).balance;
        }
        
        address tokenAddress = _token == PaymentToken.USDC ? usdcToken : mxnbToken;
        require(tokenAddress != address(0), "Token not configured");
        
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }

    /**
     * @dev Obtiene el total de fondos en escrow por tipo de token
     */
    function getTotalEscrowedByToken(
        PaymentToken _token
    ) external view returns (uint256) {
        if (_token == PaymentToken.ETH) {
            return totalEscrowedETH;
        }
        return totalEscrowedTokens[_token];
    }

    /**
     * @dev Función de emergencia para retirar fondos (solo owner)
     * Úsese solo en caso de emergencia
     */
    function emergencyWithdraw(
        PaymentToken _token,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        require(_to != address(0), "Invalid address");
        
        if (_token == PaymentToken.ETH) {
            require(_amount <= address(this).balance, "Insufficient balance");
            (bool success, ) = payable(_to).call{value: _amount}("");
            require(success, "Transfer failed");
        } else {
            address tokenAddress = _token == PaymentToken.USDC ? usdcToken : mxnbToken;
            require(tokenAddress != address(0), "Token not configured");
            
            IERC20 token = IERC20(tokenAddress);
            token.safeTransfer(_to, _amount);
        }
    }

    // Función para recibir Ether
    receive() external payable {
        // Permite que el contrato reciba Ether
    }
}

