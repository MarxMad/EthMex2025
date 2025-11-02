# Setup Rápido para Remix - OpenZeppelin Contracts

## Método Rápido: Importar desde GitHub

### Paso 1: Importar Archivos Necesarios

En Remix, usa el botón "GitHub" en el explorador de archivos y pega estas URLs:

```
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/Context.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/access/Ownable.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/IERC20.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/utils/SafeERC20.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/utils/ReentrancyGuard.sol
```

### Paso 2: Verificar Imports

Después de importar, los archivos deberían aparecer en:
- `contracts/access/Ownable.sol`
- `contracts/token/ERC20/IERC20.sol`
- `contracts/token/ERC20/utils/SafeERC20.sol`
- `contracts/utils/ReentrancyGuard.sol`
- `contracts/utils/Context.sol`

### Paso 3: Crear el Contrato

Crea `RecyclingEscrowV2.sol` y copia el código. Los imports deberían funcionar automáticamente.

---

## Si GitHub Import No Funciona

### Crear archivos mínimos manualmente:

1. Crea `contracts/utils/Context.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}
```

2. Crea `contracts/access/Ownable.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./../utils/Context.sol";

abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor(address initialOwner) {
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }
    
    function owner() public view virtual returns (address) {
        return _owner;
    }
    
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }
    
    function transferOwnership(address newOwner) public virtual onlyOwner {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
```

3. Crea `contracts/token/ERC20/IERC20.sol` (interfaz mínima):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

4. Crea `contracts/token/ERC20/utils/SafeERC20.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "../IERC20.sol";
import "../../../contracts/utils/Context.sol";

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        require(token.transfer(to, value), "SafeERC20: transfer failed");
    }
    
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        require(token.transferFrom(from, to, value), "SafeERC20: transferFrom failed");
    }
}
```

5. Crea `contracts/utils/ReentrancyGuard.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
```

**Nota:** Estos son archivos mínimos. Para producción, usa los archivos completos de OpenZeppelin.

