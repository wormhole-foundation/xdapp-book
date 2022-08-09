# Registering Emitters: EVM

To specify applications that our EVM application is allowed to listen to, we can create a mapping of chainId to bytes32 addresses of the relevant contracts on other chains. 

The chainId used here is the *wormhole* chainId, and the address used here is the address in *bytes*.

```solidity

contract Messenger {
    mapping(uint16 => bytes32) _applicationContracts;

    address owner;
    constructor(){
        owner = msg.sender;
    }
    
    /**
        Registers it's sibling applications on other chains as the only ones that can send this instance messages
    */

    function registerApplicationContracts(uint16 chainId, bytes32 applicationAddr) public {
        require(msg.sender == owner, "Only owner can register new chains!");
        _applicationContracts[chainId] = applicationAddr;
    }
}
```

If you have more than one address per chainId that you want to listen to, consider making the mapping into bytes32[]. 
