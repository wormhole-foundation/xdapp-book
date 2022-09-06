# Portal Token Bridge

Portal Token Bridge is one of the biggest applications built on Wormhole. It uses structured payloads to transfer tokens and NFTs from one wallet to another. 

## Attesting a Token
Before a token can be transferred, the token need to be attested to another chain. To attest a token, you first create a AssetMeta VAA by calling the `attest()` function on Token Bridge. Then, take the VAA over to the receipient chain where you'll call `createWrapped()` which deploys a wrapped version of the token.

This only needs to happen once per payload, and trying to attest a token a second time will simply result in the address of the already-created Wrapped Token Address.

## Transfering Tokens
To transfer tokens, the payer of tokens first authorizes the Token Bridge contract to move the tokens on their behalf, then locks them up with the Token Bridge, which emits a VAA. This VAA can then be submitted on target chain Token Bridge's `completeTransfer()` to mint the wrapped version of the token. 
  
When transfering tokens from Chain A to B and beyond, the token is only "wrapped" once, as every time it's attested, it's always from the chain where the token is natively located. If the token being transferred is native to the chain it's being transfered to, you'll receive the original token back instread of a wrapped version. 

There are typically two functions for transfer: `transfer()` and `transferNative()`. This is because native currencies of most blockchains (ETH on Ethereum, SOL on Solana, etc) don't follow the token spec of that chain, so to transfer native currencies, we wrap them first into a tokenized version and then transfer.

For transfers, there's also an arbiterFee you can set. If this fee is set, when `completeTransfer()` is called, that amount of tokens are withheld from the release of tokens on the target chain and instead given to the submitter of the message (for example, a relayer). This allows a third party to submit transactions on your behalf, for a fee.

## Transfering with a Payload
Transfering with a Payload is much like transfering normal tokens, with two major differences:

First, as the name implies, you can attach a bytes payload to the transfer message. 

Secondly, the `completeTransfer()` function for Transfer with Payload can *only* be called by the receipient of that VAA. This means the flow is slightly different--instead of the user calling the `completeTransfer()` function on the Token Bridge, they call a function on the application they are interacting with which will check the payload, finalize any state changes and then call `completeTransfer()` on Token Bridge to mint tokens to itself. 
