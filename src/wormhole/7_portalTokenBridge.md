# Portal

Portal is a set of ecosystem contracts which provision Wormhole's xAsset layer. These contracts allow tokens to be bridged around the Wormhole Ecosystem in a **path-independent** fashion, and in a manner easily composeable with other functions in the Wormhole ecosystem, such as Core-Layer messaging.

The Portal functions are a major focus of the [Wormhole Typescript SDK](https://www.npmjs.com/package/@certusone/wormhole-sdk). If you're looking to interact with Portal directly from a typescript client or backend, you should start there. This section will only provide a high-level overview of how to interact with the Portal contracts. If you'd prefer to look at code examples, they are provided in the **Portal Examples** section.

## Creating xAssets

xAssets always have an **origin chain**. This is the chain where the token is initially minted, via the standard of that chain (ERC-20, SPL, etc).

To begin converting this asset into an xAsset, an **attestation** must first be created. This is accomplished by simply calling the **attest** function on the Portal contract of the origin chain.

    function attestToken(
        address tokenAddress,
        uint32 nonce)
     returns (uint64 sequence)

The Guardian Network will then produce an **attestation VAA**, which can be retrieved using the sequence number returned by the attestToken function.

The attestation VAA must then be submitted to the **createWrapped** function of every other chain, referred to as **foreign chains** for this token.

    function createWrapped(
        bytes memory encodedVm)
    returns (address token)

Calling this function will deploy a new contract for the token on the foreign chain, creating a **Wormhole-Wrapped Token**. The wrapped token will use the same symbol as the origin asset, and will append (Wormhole) to the end of the name.

These assets are all **fungible** with eachother. This means the wrapped token from any chain can be exchanged for the original token or any of the wrapped tokens from other chains.

## Transferring Assets

    function transferTokens(
        address token,
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        uint256 arbiterFee,
        uint32 nonce) returns (uint64 sequence)

Initiating a token transfer is a relatively straightforward affair. After the transfer is initiated, the Guardians will produce a transfer VAA once finality has been reached on the **source chain**. The VAA must then be relayed to the **target chain**.

All tokens managed by Portal are backed by the origin asset, and this allows for the tokens to be transferred in a path-independent fashion. Regardless of what chain the tokens are passed to, a 'double-wrapped' asset will never be created for a single backing asset. Additionally, because Portal is based purely on a wrapping model, there are no liquidity limitations.

## Contract-Controlled Transfers

Contract Controlled Transfers (CCTs) are a feature designed to allow xDapp contracts to easily perform Portal transfers. Contract controlled transfers are quite similar to simple transfers, but have two additional features:

- An arbitrary byte array can be appended to the transfer, which can be used to easily pass additional information to the recipient contract.
- The CCT VAA redeem can only be performed by the recipient contract, as opposed to basic transfers, which can be performed by any caller. This ensures that any additional operations which the contract wants to perform as part of the redeem transaction must be executed.

In short, basic transfers are intended to transfer tokens from one wallet to another, whereas CCTs are meant to transfer tokens from one smart contract to another. If you're writing an xDapp, you probably want to use CCTs for the most part.

In the next section. We'll discuss Wormchain, and some of the upcoming features it will enable.
