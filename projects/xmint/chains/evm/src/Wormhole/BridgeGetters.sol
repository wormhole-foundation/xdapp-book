// contracts/Getters.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

interface BridgeGetters {
    function governanceActionIsConsumed(bytes32 hash) external view returns (bool) ;
    function isInitialized(address impl) external view returns (bool) ;
    function isTransferCompleted(bytes32 hash) external view returns (bool) ;
    function chainId() external view returns (uint16);
    function governanceChainId() external view returns (uint16);
    function governanceContract() external view returns (bytes32);
    function wrappedAsset(uint16 tokenChainId, bytes32 tokenAddress) external view returns (address);
    function bridgeContracts(uint16 chainId_) external view returns (bytes32);
    function tokenImplementation() external view returns (address);
    function outstandingBridged(address token) external view returns (uint256);
    function isWrappedAsset(address token) external view returns (bool);
}
