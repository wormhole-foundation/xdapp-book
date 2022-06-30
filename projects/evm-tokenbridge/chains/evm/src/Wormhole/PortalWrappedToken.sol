// contracts/TokenImplementation.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;


// Based on the OpenZepplin ERC20 implementation, licensed under MIT
interface PortalWrappedToken {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function owner() external view returns (address);

    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint256);

    function chainId() external view returns (uint16);

    function nativeContract() external view returns (bytes32) ;

    function balanceOf(address account_) external view returns (uint256) ;

    function transfer(address recipient_, uint256 amount_) external returns (bool) ;

    function allowance(address owner_, address spender_) external view returns (uint256) ;

    function approve(address spender_, uint256 amount_) external returns (bool) ;

    function transferFrom(address sender_, address recipient_, uint256 amount_) external returns (bool) ;

    function increaseAllowance(address spender_, uint256 addedValue_) external returns (bool) ;

    function decreaseAllowance(address spender_, uint256 subtractedValue_) external returns (bool) ;

    function mint(address account_, uint256 amount_) external ;

}