# xAsset Layer

There is a set of ecosystem contracts that provision Wormhole's xAsset layer which allow tokens to be bridged around the Wormhole Ecosystem in a **path-independent** fashion, and are easily composable with other functions in the Wormhole ecosystem.

This section provides a high-level overview of how to interact with two smart contract modules that implement xAssets: (1) Token Bridge module and (2) NFT Bridge Module.

If you're looking to interact with the Token Bridge directly from a typescript client or backend, you should start with the [Wormhole Typescript SDK](https://www.npmjs.com/package/@certusone/wormhole-sdk).

## Creating xAssets

xAssets always have an **origin chain**. This is where the token is initially minted via the standard of that chain (ERC-20, SPL, etc for tokens; ERC-721, Metaplex, etc for NFTs).

xAssets are all **fungible** with each other. This means the Wormhole-wrapped asset can be exchanged for the original asset or a wrapped asset from other chains.

**Tokens**

To convert tokens into an xAsset, an **attestation** must first be created. To create an attestation, simply call the **attest** function on the token bridge contract of the origin chain.

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

**NFTs**

NFTs do not need need to be attested before they can be created into a xAsset.

## Transferring xAssets

Initiating xAsset transfers is a straightforward affair. Once the transfer is initiated, the Guardians will produce a transfer VAA when finality has been reached on the **source chain**. The VAA must then be relayed to the **target chain**.

All tokens managed by the Token Bridge are backed by the origin asset, allowing assets to be transferred in a path-independent fashion. Regardless of what chain the assets are passed to, a 'double-wrapped' asset will never be created for a single backing asset. Additionally, there are no liquidity limitations.

**Tokens**

```
    function transferTokens(
        address token,
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        uint256 arbiterFee,
        uint32 nonce) returns (uint64 sequence)
```

**NFTs**

```
function transferNFT(
    address token,
    uint256 tokenID,
    uint16 recipientChain,
    bytes32 recipient,
    uint32 nonce) returns (uint64 sequence)
)
```

## Contract-Controlled Transfers

Basic transfers are intended to transfer xAssets from one wallet to another, whereas Contract Controlled Transfers (CCTs) are meant to transfer xAssets from one smart contract to another. If you're writing an xDapp, CCTs will likely be a large component.

CCTs allow xDapp contracts to easily perform simple xAsset transfers, but have two additional features:

- An arbitrary byte array can be appended to the transfer and can be used to easily pass additional information to the recipient contract.
- The CCT VAA redeem can only be performed by the recipient contract, as opposed to basic transfers, which can be performed by any caller. This ensures that any additional operations which the contract wants to perform as part of the redeem transaction must be executed.

---

In the next section, we'll discuss Wormchain and some of the upcoming features it will enable.
