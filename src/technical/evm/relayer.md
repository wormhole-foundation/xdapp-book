# Relayer Module

**_Note_: This module is only available in testnet.**

The WormholeRelayer module allows developers to deliver their VAAs via an untrusted **RelayProvider**, rather than needing to develop and host their own relay infrastructure.

There are four relevant interfaces you may want to use when utilizing the WormholeRelayer module:

- [IWormholeRelayer](https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/interfaces/IWormholeRelayer.sol) - the primary interface by which you interact with the module. It allows you to request deliveries from a given RelayProvider.
- [IRelayProvider](https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/interfaces/IRelayProvider.sol) - this interface represents the delivery pricing information for a given relayer network.
- [IWormholeReceiver](https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/interfaces/IWormholeReceiver.sol) - this is the interface you are responsible for implementing. It allows the selected RelayProvider to deliver messages to your contract.
- [IWormhole](https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/interfaces/IWormhole.sol) - this is simply the Wormhole Core Messaging interface, used for emitting and verifying VAAs.

Check the [deployed contracts page](../../reference/contracts.md) for contract addresses on each supported blockchain.

<br/>
<br/>

## Interacting with the Module

A relatively minimal setup to start interacting with the module looks like this:

```solidity
import "../IWormholeRelayer.sol";
import "../IWormholeReceiver.sol";

contract HelloWorld is IWormholeReceiver {
    IWormholeRelayer relayer = IWormholeRelayer(WORMHOLE_RELAYER_CONTRACT_ADDRESS);
    map(bytes32 -> bool) consumedMessages;
    map(uint16 -> bytes32) myContractNetwork;

    function receiveWormholeMessages(IWormholeReceiver.DeliveryData deliveryData, bytes[] memory vaas)
        public payable override onlyRelayerContract {
        require(myContractNetwork[deliveryData.sourceChain] = sourceAddress);
        require(consumedMessages[deliveryData.deliveryHash] = false);

        uint256 receiverValue = msg.value;

        consumedMessages[deliveryData.deliveryHash] = true;
    }

    modifier onlyRelayerContract() {
        require(msg.sender == relayer.getDeliveryAddress(), "msg.sender is not WormholeRelayer contract.");
        _;
    }
}
```

Let's do a quick breakdown of what's happening in this code:

- `receiveWormholeMessages` - When a 'send' is initiated with this contract as the targetAddress, this is the function which will be called.
- `DeliveryData` - This has information regarding the delivery which is currently being performed.
  - `sourceAddress` - the address (in Wormhole format) which initiated this delivery.
  - `sourceChain` - the chain where this delivery originated.
  - `maximumRefund` - this is the maximum refund that could result from this delivery, assuming your receiveWormholeMessages uses 0 gas.
  - `deliveryHash` - a unique hash corresponding to this delivery. (Technically the VAA Hash of the underlying delivery VAA.)
  - `payload` - an (optional) byte array containing a message which was sent with this delivery.
- `vaas` - If this delivery includes additional VAAs, they will be passed here in the same order as they were requested. **Note: these VAAs are not authenticated!** Always make sure to call wormhole.parseAndVerify before trusting the content of a raw VAA.
- `onlyRelayerContract` - This entrypoint should only be callable by the relayer module's delivery contract, otherwise other callers could input malicious data. If you need additional entrypoints into the contract, you should create another function.
- `myContractNetwork` - by default, anyone can send anything to any contract. This is useful and necessary for some usecases, but it's also common to only want to receive content from contracts which belong to your protocol.
- `consumedMessages` - Wormhole deliveries should happen **at least** once, but can potentially happen many times, and it's up to the integrator to handle this. There are several ways to enforce replay protection, which have various pros and cons, but this is definitely the most common and straightforward way to do it.
- `receiverValue` - Whatever the specified receiveValue was on the delivery will be sent as msg.value when receiveWormholeMessages is called.

<br/>
<br/>
<br/>
<br/>

# Sending Messages

The WormholeRelayer contract is able to send basic messages, and also able to request delivery of VAAs which originate from other smart contracts. This allows you to easily combine basic messaging along with other modules of the Wormhole ecosystem, such as the Token Bridge or NFT modules. It even allows for other Wormhole integrators to easily compose with your application! (See [best practices](./bestPractices.md) for more info.)

We'll discuss more complex useage later. For now let's just cover how to send a "Hello World" message. The basic mechanism to request delivery of your VAAs is to call the `send` function on the IWormholeRelayer interface. Here's its basic usage:

```solidity
function sendHelloWorldMessage() public payable {
    //spell out some constants
    bytes memory helloWorld = abi.encode("Hello World");
    uint32 gasLimit = 500000;
    bytes32 TARGET_CONTRACT = relayer.toWormholeFormat(MY_OTHER_DEPLOYED_CONTRACT);

    //calculate cost to deliver this message
    uint256 maxTransactionFee = relayer.quoteGas(
        TARGET_CHAIN,
        gasLimit,
        relayer.getDefaultRelayProvider());

    //calculate cost to cover receiver value of 100 wei on the targetChain.
    //if you don't need 'receiver value', feel free to skip this and just pass 0 to the send
    uint256 receiverValue = relayer.quoteReceiverValue(
        targetChain,
        100,
        relayer.getDefaultRelayProvider());

    // publish delivery request
    // the fields, in order, are:
    // targetChain, targetAddress, refundAddress, refundChain, maxTransactionFee, receiverValue, payload, consistencyLevel
    relayer.send{value: maxTransactionFee + receiverValue}(
        TARGET_CHAIN, TARGET_CONTRACT, TARGET_CONTRACT, TARGET_CHAIN, maxTransactionFee, receiverValue, helloWorld
    );
}
```

Let's break down all the things happening in this code.

- `helloWorld` - You can send arbitary byte arrays
- `gasLimit` - This is how much gas your 'receiveWormholeMessages' will be called with when your message is delivered. If you exceed this gas limit, the delivery will result in a **Receiver Failure**. There's more information on receiver failures in a later section.
- `relayer.getDefaultRelayProvider` - Relay Providers are independent relayer networks which execute deliveries based off their stated SLA. The Wormhole relayer protocol has a default Relay Provider, but you're able to use any other provider you'd like, or even run your own.
- `targetChain` - Wormhole chainId where the messages should be sent. This is not the same as the EVM Network ID!
- `targetContract` - Contract address on targetChain where the messages should be sent. This is in the 32-byte Wormhole address format.
- `refundAddress` - Address (in Wormhole format) where any remaining maxTransactionFee should be sent once execution of receiveWormholeMessages is complete.
- `refundChain` - The chain where the refund address exists. If the `refundChain` is not the same as the `targetChain`, the refund will trigger an empty delivery with the same Relay Provider in order to perform the refun. This is called a cross-chain refund.
- `maxTransactionFee` - this specifies the maximum amount of funds (in sourceChain wei) that should be utilized to execute receiveWormholeMessages on the targetChain. If the maxTransactionFee is exceeded during contract execution you will enter a **receiver failure** state. Any unused funds are refunded to the `refundAddress`.
- `receiverValue` - this amount (in sourceChain wei) is converted to targetChain native funds at the rate specified by the RelayProvider and passed to `receiveWormholeMessages` on the target chain when the delivery happens. This is useful for covering small fees encountered during execution on the target chain.

<br/>
<br/>
<br/>
<br/>

# Delivery Guarantees & Receiver Failures

The WormholeRelayer protocol is intended to create a service interface whereby mutually distrustful integrators and Relay Providers can work together to provide a more powerful Dapp experience. You don't trust the relay providers with your data, and the relay providers don't trust your smart contract. The primary agreement which is made between integrators and relayers is that:

**When a delivery is requested, the relay provider will attempt to deliver the VAA within the provider's stated delivery timeframe.**

As a baseline, RelayProviders should aim to perform deliveries **within 5 minutes of the VAA creation, assuming blockchain liveness**.

This creates a marketplace whereby providers can set different price levels and service guarantees. Relay providers effectively accept the slippage risk premium of delivering your VAAs in exchange for a set fee rate. Thus, the providers agree to deliver your messages **even if they have to do so at a loss**.

Relay providers set their prices on chain, and are able to change their prices at any time. Thus, some providers may choose to set higher rates for tighter guarantees, or lower rates for less stringent guarantees.

<br/>

### Receiver Failures

All deliveries should result in one of following five outcomes prior to the delivery timeframe of the relay provider.

- Delivery Success - Everything went well.
- Undeliverable - The delivery or redelivery specify non-existent or invalid VAAs, such that the delivery cannot be performed.
- Forward Request - The delivery was performed and resulted in a 'Forwarded' request.
- Forward Failure - The delivery was performed, a forward was requested, and the Forward was not sufficiently funded.
- Receiver Failure - The delivery was performed, but receiveWormholeMessages did not successfully execute.

Receiver Failures are not a nebulous 'something went wrong' term in the Wormhole Core Relayer protocol. A receiver failure is a well-defined term which means that the selected provider **performed the delivery, but the delivery was not able to be completed.** There are only three causes for a delivery failure:

- the target contract does not implement the `IWormholeReceiver` interface
- the target contract threw an exception or reverted during execution of `receiveWormholeMessages`
- the target contract exceeded the specified `maxTransactionFee` while executing `receiveWormholeMessages`

All three of these scenarios should generally be avoidable by the integrator, and thus it is up to integrator to resolve them. The most common way to resolve this state is via redelivery.

Both Forwarding Failures and Receiver Failures result in the execution of receiveWormholeMessages being reverted.

Any other senario which causes a delivery to not be performed should be considered an **outage** by some component of the system, including potentially the blockchains themselves.

<br/>

### Redelivery

How receiver failures are handled is up to you as the integrator. It is perfectly acceptable to just leave the delivery incomplete, if that's acceptable for your usecase.

However, in the scenario where you need to reattempt the delivery, there is a function specifically for this.

**NOTE: this function is not yet included in the current testnet deployment.**

```solidity
function redeliveryExample() public payable {
    IWormholeRelayer.VaaKey key = new IWormholeRelayer.VaaKey(KeyType.HASH, VAA_TO_REDELIVER_HASH);

    //calculate cost to deliver this message
    uint256 newMaxTransactionFee = relayer.quoteGas(
        TARGET_CHAIN,
        NEW_GAS_LIMIT,
        relayer.getDefaultRelayProvider());

    //calculate cost to cover receiver value of 100 wei on the targetChain.
    //if you don't need 'receiver value', feel free to skip this and just pass 0 to the send
    uint256 newReceiverValue = relayer.quoteReceiverValue(
        targetChain,
        NEW_RECEIVER_VALUE,
        relayer.getDefaultRelayProvider());

    relayer.resend(key, newMaxTransactionFee, newReceiverValue, targetChain, relayer.getDefaultRelayProvider());
}
```

The relayer has already paid for the first attempted delivery, so it would not be fair to have them need to pay for the redelivery out-of-pocket. As such, **the requester must pay a second time in order to initiate the redelivery**.

Any delivery, including forwards can be requested for redelivery, potentially even deliveries which succeeded. The key pieces of information needed for a redelivery are the sourceChain, sourceTxHash, and sourceNonce for the original delivery request, which means you can **request redeliveries from chains other than the chain where the request originated**. This can be useful when performing multi-hop deliveries with forwarding. When requesting a redelivery for a Forward Failure, the transaction hash of the Forwarding transaction should be specified, not the original delivery request.

Redeliveries can only **increase** the maxTransactionFee and receiverValue of a delivery. If you request a lower maxTransactionFee, receiverValue or a non-existant deliveryVAA, the delivery will immediately be considered to be **undeliverable** status.

<br/>
<br/>
<br/>
<br/>

## Max Transaction Fee, Receiver Value and Refunds

When you request delivery to an EVM chain, there are effectively three factors which go into the delivery fee.

- A fixed `deliveryOverhead` provided by the RelayProvider, which covers the overhead fees associated with any delivery.
- A predetermined rate at which gas can be pre-purchased on the target chain.
- An exchange rate for `receiverValue`.

On every delivery there is a `refundAddress` and `refundChain` specified. If the entire `maxTransactionFee` is not exhausted during the execution of `receiveWormholeMessages`, the remaining unused budget will be used to perform a refund. If the `refundChain` is equal to the targetChain, then the remaining funds are simply sent to this address. If the `refundChain` is different than the targetChain, then the refund will trigger a cross-chain refund which is sent via the same RelayProvider, and subject to the same delivery fees. If the remaining refund is not sufficient to pay for a new delivery, the refund is not sent. In summary, _it is always cheaper to do a same-chain refund than a cross-chain refund, because a cross-chain refund initiates a second delivery internally_.

Notably, this means that there is not a huge penalty to specifying a `maxTransactionFee` which is large, as unused funds are mostly returned. One point worth noting is that one aspect of the Relay Provider's pricing is the 'assetConversionBuffer', which takes a percentage of all refunds and receiverValues and awards them to the Relay Provider. If your selected Relay Provider has high assetConversion buffer, you should expect to have to pay more to receive the same refund amount or receiver value.

RelayProviders also specify a maximum budget that they will support for a given delivery. If the receiverValue + maxTransactionFee exceeds the provider's maximum budget, the `send` call will revert.

<br/>
<br/>
<br/>
<br/>

## Forwarding

So far we've discussed how to perform a simple delivery from chain A to chain B. However, a fairly common scenario that you may encounter is that you may want to perform a multi-hop delivery from chain A to B to C, or to round-trip (A to B to A) a delivery back to the source chain. Forwarding is a feature specifically designed to suit these usecases.

Forwarding is quite similar to a normal 'send' action, however it has a couple special traits.

- Instead of calling `send`, you should call `forward`.
- `forward` can only be called while a delivery is being executed (I.E, during execution of receiveWormholMessages), and can only be called by the contract which is receiving the delivery.
- When a forward is requested, the `refundAddress` of the delivery is ignored, and the refund is instead used to pay for the `maxTransactionFee` and `receiverValue` of the next delivery.
- You can add supplemental funds to cover the forwarding costs by passing additional tokens in msg.value.
- If the refund amount + supplemental funds do not cover the cost of the delivery, you will encounter a Forward Failure.
- Forward Failures are similar to Receiver Failures, in that they revert the current delivery.
- Forward Failures can be redelivered via the normal redelivery process.

  <br/>
  <br/>
  <br/>
  <br/>

## Security & Proper Usage

### Validating Received Messages

The array of `vaas` which is passed to `receiveWormholeMessages` are non-validated VAAs. This means _you are responsible for validating these messages_. This is most commonly done by either calling `parseAndVerifyVM` on the Wormhole Core Contract, or by passing the VAA into another contract which will do its own verification. However, this design benefits you quite a few desireable security properties:

As always with smart contract development, there are some things you should be aware of:

- Relayers are not trusted with message content! If they were to modify the content of a VAA during delivery, it would invalidate the signatures and fail to be verified by the Core Contract. This means relayers are only trusted for **liveness**. This also means **anyone can perform the deliveries, not just the specified Relay Provider**. Relay Providers are incentivized to perform relays because they are paid to do so, but in the worst case, you could always redelivery your messages with a different Relay Provider, or even do it yourself.

- Never trust the content of VAAs which haven't been verified by the Wormhole Core Contract! Your first line of code should almost always be a require statement which ensures the content you're about to process originates from a source you trust.

- Deliveries can potentially be performed multiple times, and redeliveries for any delivery can be requested by anyone. If you need replay protection on your deliveries, you will have to enforce it yourself. One common methodology for replay protection is simply to compose with `transferWithPayload` from the Token Bridge module. Because this function enforces replay protection, you can often passively leverage this protection for your own application. Alternately, you can implement replay protection inside your own contract with only a couple lines of code.

<br/>
<br/>
<br/>
<br/>

## Tricks, Tips, and Common Solutions

<br />

### Drop a user off with native gas

The most common way to accomplish this is to simply specify a large `maxTransactionFee` with the user's wallet as the `refundAddress`. This can also be done via the `receiverValue`.

### Safe Round-Trips

A very common scenario for Hub-and-Spoke style applications is to want to round-trip a delivery from a Spoke chain to the Hub chain and then back. In this case, it's generally a good idea to capture a large `maxTransactionFee` and then perform a `forward` from the Hub chain with the end-user's wallet set to the `refundAddress`. Thus the end user is ultimately returned all unused funds.

### Bridging Multiple Tokens

Because the WormholeRelayer can handle delivery of multiple messages, you can call the Token Bridge module multiple times in the same transaction and then add all the VAAs to the VAA delivery array. This is great for scenarios where an action results in tokens being sent to two different locations, or multiple tokens needing to be sent atomically.

### Broadcasting and Multidelivery

You can request delivery to many chains at once by calling `send` or `forward` multiple times in the same transaction. This is great for accomplishing actions like the delivery of a governance event or any other piece of data which has to be sent to all your contracts. This also allows you to send tokens to multiple addresses on multiple chains from a single transaction.

### Faster-than-finality transfers

One of the primary features of the WormholeRelayer protocol is that messages can be delivered faster than finality so long as the RelayProvider supports it. Normally the Token Bridge module can only transfer tokens once finality has been reached on a chain. However, with the WormholeRelayer protocol, you could potentially initiate two transfers in the same transaction.

- The first transfer sends funds instantly from a liqudity source, so that the end user receives their funds quickly.
- The second transfer sends funds via the Token Bridge to reimburse the liquidity source on the `targetChain`

Beware, the second transfer may never arrive if there is a rollback on the `sourceChain`. However, this risk can be managed if the primary concern is to provide users with a smooth user experience.

<br/>
<br/>
<br/>
<br/>

## Examples

Checkout this [Hello World contract](https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/mock/MockRelayerIntegration.sol)

<br/>

**More info and features to come. This module is still in development.**
