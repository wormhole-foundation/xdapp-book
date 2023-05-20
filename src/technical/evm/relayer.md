# Relayer Module

**_Disclaimer: This module is only available in testnet._**

The WormholeRelayer module allows developers to deliver their VAAs via an untrusted **RelayProvider**, rather than needing to develop and host their own relay infrastructure.

<br/>
<br/>

## Interacting with the Module

There are four relevant interfaces to discuss when utilizing the WormholeRelayer module:

- [IWormholeRelayer](https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/interfaces/IWormholeRelayer.sol) - the primary interface by which you interact with the module. It allows you to request deliveries from a given RelayProvider.
- [IRelayProvider](https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/interfaces/IRelayProvider.sol) - this interface represents the delivery pricing information for a given relayer network.
- [IWormholeReceiver](https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/interfaces/IWormholeReceiver.sol) - this is the interface you are responsible for implementing. It allows the selected RelayProvider to deliver messages to your contract.
- [IWormhole](https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/interfaces/IWormhole.sol) - this is simply the Wormhole Core Messaging interface, used for emitting and verifying VAAs.

Check the [deployed contracts page](../../reference/contracts.md) for contract addresses on each supported blockchain.

A minimal setup looks something like this:

```solidity
import "../IWormholeRelayer.sol";
import "../IRelayProvider.sol";
import "../IWormholeReceiver.sol";
import "../IWormhole.sol";

contract HelloWorld is IWormholeReceiver {
    IWormholeRelayer relayer = IWormholeRelayer(WORMHOLE_RELAYER_CONTRACT_ADDRESS);
    IWormhole wormhole = IWormhole(WORMHOLE_CORE_CONTRACT_ADDRESS);

    function receiveWormholeMessages(bytes[] memory whMessages, bytes[] memory otherData)
        public payable override onlyRelayerContract {
    }

    modifier onlyRelayerContract() {
        require(msg.sender == WORMHOLE_RELAYER_CONTRACT_ADDRESS, "msg.sender is not WormholeRelayer contract.");
        _;
    }
}
```

<br/>
<br/>
<br/>
<br/>

# Sending Messages

The WormholeRelayer contract does not directly send messages. Rather, the WormholeRelayer contract allows you to deliver **any or all messages which originate from the current transaction**, including those which don't originate directly from the current contract.

This allows you to easily combine basic messaging along with other modules of the Wormhole ecosystem, such as the Token Bridge or NFT modules. It even allows for other Wormhole integrators to easily compose with your application! (See [best practices](./bestPractices.md) for more info.)

We'll discuss more complex useage later. For now let's just cover how to send a "Hello World" message. The basic mechanism to request delivery of your VAAs is to call the `send` function on the IWormholeRelayer interface. Here's its basic usage:

```solidity
function sendHelloWorldMessage() public payable {
    //spell out some constants
    bytes memory helloWorld = abi.encode("Hello World");
    uint64 nonce = 1;
    uint8 consistencyLevel = 200; //instant
    uint32 gasLimit = 500000;
    bytes32 TARGET_CONTRACT = relayer.toWormholeFormat(MY_OTHER_DEPLOYED_CONTRACT);

    //publish the Hello World message
    wormhole.publishMessage{value: wormhole.messageFee()}(nonce, helloWorld, consistencyLevel);

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
    // targetChain, targetAddress, refundAddress, maxTransactionFee, receiverValue, nonce
    relayer.send{value: deliveryCost + receiverValue}(
        TARGET_CHAIN, TARGET_CONTRACT, TARGET_CONTRACT, maxTransactionFee, receiverValue, nonce
    );
}
```

In this code, we first emit a "Hello World" message via the Wormhole Core Layer the same way it's always done. We then request from the default RelayProvider that they deliver all messages emitted from this transaction with nonce 1 to the TARGET_CONTRACT on the TARGET_CHAIN.

Let's break down all the things happening in this code.

- `nonce` - Core Contract nonce. All messages with this nonce will be delivered. Messages without this nonce won't be delivered!
- `consistencyLevel` - here we use 200 (instant) for the message emission on our "Hello World" message. Deliveries must wait for the _slowest_ message, because the delivery can't take place until there are signed VAAs for every message.

- `deliveryCost` - this calculates the necessary price for the selected RelayProvider to perform a delivery with 500,000 gas on the target chain. Thus, by paying this `deliveryCost`, you can be sure that your `receiveWormholeMessages` function will be invoked with a gas limit of 500,000. There's more info on how these deliveries work in a later section.

- `relayProvider` - The relayer network which will deliver the request. Here we use the default provider.
- `targetChain` - Wormhole chainId where the messages should be sent. This is not the same as the EVM Network ID!
- `targetContract` - Contract address on targetChain where the messages should be sent. This is in the 32-byte Wormhole address format.
- `refundAddress` - Address (in Wormhole format) on **targetChain** where any remaining maxTransactionFee should be sent once execution of receiveWormholeMessages is complete.
- `maxTransactionFee` - this specifies the maximum amount of funds (in sourceChain wei) that should be utilized to execute receiveWormholeMessages on the targetChain. If the maxTransactionFee is exceeded during contract execution you will enter a **delivery failure** state. Any unused budget is sent to the refundAddress.
- `receiverValue` - this amount (in sourceChain wei) is converted to targetChain native funds at the rate specified by the RelayProvider and passed to `receiveWormholeMessages` on the target chain when the delivery happens. This is useful for covering small fees encountered during execution on the target chain.

<br/>
<br/>
<br/>
<br/>

## Receiving Messages

Receiving messages through the relayer module is quite straightforward. Simply implement the `IWormholeReceiver` interface.

```solidity
function receiveWormholeMessages(bytes[] memory whMessages, bytes[] memory otherData)
    public payable override onlyRelayerContract {

    (IWormhole.VM memory whMessage, bool valid, string memory reason) =
        wormhole.parseAndVerifyVM(whMessages[0]);

    require(valid, reason);

    //Parse whMessage.payload and do whatever you need to do
}

modifier onlyRelayerContract() {
    require(msg.sender == WORMHOLE_RELAYER_ADDRESS, "msg.sender is not WormholeRelayer contract.");
    _;
}
```

Breaking down everything happening in this code snippet:

- `receiveWormholeMessages` - this is the function which will be invoked by the WormholeRelayer contract when the RelayProvider completes the delivery. It will be executed with a gas limit equal to the amount which was covered by the `maxTransactionFee` that was specified in the deliveryRequest.

- `whMessages` - These are all the messages that were requested for delivery, in the order they were emitted. This includes the deliveryVAA used by the WormholeRelayer, which should generally be ignored.
- `otherData` - Non-Wormhole data which was requested for delivery. Currently not used, but included for future compatibility.
- `onlyRelayerContract` - this prevents contracts other than the WormholeRelayer contract from calling this entrypoint. The WormholeRelayer contract handles the invocation of `receiveWormholeMessages`, and ensures that relayers can't improperly call it.

Here are a few other important points to note:

- `receiveWormholeMessages` function should generally not throw an exception or revert during execution. If an exception is thrown, or a 'require' statement is violated, you will enter a delivery failure. When a delivery failure occurs, the execution of `receiveWormholeMessages` is reverted, but the entire transaction is not.

- `receiveWormholeMessages` will only be called with as much gas as was specified by the maxTransactionFee specified when the message delivery was requested. If you exceed this gas amount, you will enter a delivery failure. There are more details on maxTransactionFee in a later section.

- `whMessages` is the array of VAAs which were requested for delivery, in the order they were emitted during the requesting transaction. These VAAs are not verified, and should not be considered trusted until you call `core_bridge.parseAndVerifyVM` or otherwise verify them against the Core Contract! (More on this in [Best Practices](./bestPractices.md))

- The delivery VAA will be included in the array you receive. This is generally best ignored.

<br/>
<br/>
<br/>
<br/>

# Delivery Guarantees & Delivery Failures

The WormholeRelayer protocol is intended to create a service interface whereby mutually distrustful integrators and RelayProviders can work together to provide a seamless Dapp experience. You don't trust the relay providers with your data, and the relay providers don't trust your smart contract. The primary agreement which is made between integrators and relayers is that:

**When a delivery is requested, the relay provider will attempt to deliver the VAA within the provider's stated delivery timeframe.**

As a baseline, RelayProviders should aim to perform deliveries **within 5 minutes of the VAA creation, assuming blockchain liveness**.

This creates a marketplace whereby providers can set different price levels and service guarantees. Relay providers effectively accept the slippage risk premium of delivering your VAAs in exchange for a set fee rate. Thus, the providers agree to deliver your messages **even if they have to do so at a loss**.

Relay providers should set their prices such that they turn a profit on average, but not necessarily on every single transfer. Thus, some providers may choose to set higher rates for tighter guarantees, or lower rates for less stringent guarantees.

<br/>

### Delivery Failures

All deliveries should result in one of the following four outcomes prior to the delivery timeframe of the relay provider. These outcomes are emitted as EVM events from the WormholeRelayer contract when they occur.

- Delivery Success
- Delivery Failure
- Forward Request (More on forwarding in a later section)
- Forward Failure

Delivery Failures are not a nebulous 'something went wrong' term in the Wormhole Core Relayer protocol. A delivery failure is a well-defined term which means that the selected provider **performed the delivery, but the delivery was not able to be completed.** There are only three causes for a delivery failure:

- the target contract does not implement the `IWormholeReceiver` interface
- the target contract threw an exception or reverted during execution of `receiveWormholeMessages`
- the target contract exceeded the specified `maxTransactionFee` while executing `receiveWormholeMessages`

All three of these scenarios should generally be avoidable by the integrator, and thus it is up to integrator to resolve them.

Any other scenario which causes a delivery to not be performed should be considered an **outage** by some component of the system, including potentially the blockchains themselves.

<br/>

### Redelivery

What happens in the case of a delivery failure is up to you as the integrator. It is perfectly acceptable to just leave the delivery incomplete, if that's acceptable for your use case.

However, in the scenario where you need to reattempt the delivery, there is a function specifically for this.

```solidity
function redeliveryExample() public payable {
    //spelling out consts
    bytes memory deliveryTxHash = ORIGINATING_TX_HASH
    uint16 sourceChain = SOURCE_CHAIN
    uint16 targetChain = TARGET_CHAIN
    uint16 nonce = SOURCE_NONCE
    uint32 gasLimit = 1000000

    //Note, call quoteGasResend instead of quoteGas.
    //The overheads for the two processes differ, so the quotes differ as well.
    const newMaxTransactionFee = relayer.quoteGasResend(
        TARGET_CHAIN,
        gasLimit,
        relayer.getDefaultRelayProvider());

    //Receiver value calculations do not differ
    const receiverValue = relayer.quoteReceiverValue(
        targetChain,
        0,
        relayer.getDefaultRelayProvider());

    IWormholeRelayer.ResendByTx memory redeliveryRequest = IWormholeRelayer.ResendByTx(
        sourceChain,
        deliveryTxHash,
        nonce, //sourceNonce
        targetChain,
        newMaxTransactionFee, //newMaxTransactionFee
        receiverValue, //newReceiverValue
        relayer.getDefaultRelayParams() //newRelayParams
    );

    relayer.resend{value: newMaxTransactionFee + receiverValue}(
        redeliveryRequest, nonce, relayer.getDefaultRelayProvider()
    );
}
```

The relayer has already paid for the first attempted delivery, so it would not be fair to have them need to pay for the redelivery out-of-pocket. As such, **the requester must pay a second time in order to initiate the redelivery**.

Any delivery or forwarding request can be requested for redelivery, potentially even deliveries which succeeded. The key pieces of information needed for a redelivery are the sourceChain, sourceTxHash, and sourceNonce for the original delivery request, which means you can **request redeliveries from chains other than the chain where the request originated**. This can be useful when performing multi-hop deliveries with forwarding. When requesting a redelivery for a Forward Failure, the transaction hash of the Forwarding transaction should be specified, not the original delivery request.

<br/>
<br/>
<br/>
<br/>

## Max Transaction Fee and Refunds

When you request delivery to an EVM chain, there are effectively three factors which go into the delivery fee.

- A fixed `deliveryOverhead` provided by the RelayProvider, which covers the overhead fees associated with any delivery.
- A predetermined rate at which gas can be pre-purchased on the target chain.
- An exchange rate for `receiverValue`.

On every delivery there is a `refundAddress` specified on the `targetChain`. If the entire `maxTransactionFee` is not exhausted during the execution of `receiveWormholeMessages`, the remaining unused budget will be sent to the `refundAddress`.

For example, let's say that the `maxTransactionFee` for a 500k gas execution on FooChain is equal to 13 fooCoins. If the `deliveryOverhead` is 3 fooCoins, and `receiveWormholeMessages` only uses 250k gas during its execution, then we can expect 5 fooCoins to be sent to the `refundAddress`.

Notably, this means that there is not a penalty for specifying a `maxTransactionFee` which is too large, so long as the RelayProvider has reasonably accurate price quotes. You should generally err on the side of caution when specifying a `maxTransactionFee`, as undershooting results in a Delivery Failure, whereas overshooting just results in a larger refund.

Contrary to `maxTransactionFee`, when specifying a `receiverValue` the RelayProvider will take a percentage of the exchange as specified by the provider. RelayProviders also specify a maximum budget that they will support.

<br/>
<br/>
<br/>
<br/>

## Forwarding

So far, we've discussed how to perform a simple delivery from chain A to chain B. However, a fairly common scenario that you may encounter is that you may want to perform a multi-hop delivery from chain A to B to C, or to round-trip a delivery back to the source chain. Forwarding is a feature specifically designed to suit these use cases.

Forwarding is quite similar to a normal 'send' action, however it has a couple special traits.

- Instead of calling `send`, you should call `forward`.
- `forward` can only be called while a delivery is being executed (I.E, during execution of receiveWormholMessages), and can only be called by the contract which is receiving the delivery.
- When a forward is requested, the `refundAddress` of the delivery is ignored, and the refund is instead used to pay for the `maxTransactionFee` and `receiverValue` of the next delivery.
- You can add supplemental funds to cover the forwarding costs by passing additional tokens in msg.value.
- If the refund amount + supplemental funds do not cover the cost of the delivery, you will encounter a Forward Failure.
- Forward Failures do not revert the previous delivery, but the next delivery is not guaranteed to be performed.
- Forward Failures can be redelivered via the normal redelivery process, however the transaction hash which requested the forward should be used instead of the original delivery transaction hash.

  <br/>
  <br/>
  <br/>
  <br/>

## Security & Proper Usage

### Validating Received Messages

The array of `whMessages` which is passed to `receiveWormholeMessages` are non-validated VAAs. This means _you are responsible for validating these messages_. This is most commonly done by either calling `parseAndVerifyVM` on the Wormhole Core Contract, or by passing the VAA into another contract which will do its own verification. However, this design benefits you quite a few desirable security properties:

- Relayers are not trusted with message content! If they were to modify the content of a VAA during delivery, it would invalidate the signatures and fail to be verified by the Core Contract. This means relayers are only trusted for **liveness**.

- There are also very few trust assumptions placed on the WormholeRelayer contract. The WormholeRelayer contract only enforces a few protections, such as that refunds are correctly paid out, and that non Batch-VAAs are not handed into the contract.

However, as always with smart contract development, there are some things you should be aware of:

- The Relay Module is technically in **beta** until Batch VAAs are live in mainnet. While in beta, the selected RelayProvider can potentially reorder, omit, or mix-and-match VAAs if they were to behave maliciously. As such, you will either have to trust your RelayProvider to not do this, or code some relatively straightforward checks to detect this scenario.

- Never trust the content of VAAs which haven't been verified by the Core Contract! Your first line of code should essentially always be a verify statement, which ensures the VAA originates from a trusted contract.

- Deliveries can potentially be performed multiple times, and redeliveries for any delivery can be requested by anyone. If you need replay protection on your deliveries, you will have to enforce it yourself. One common methodology for replay protection is simply to compose with `transferWithPayload` from the Token Bridge module. Because this function enforces replay protection, you can often passively leverage this protection for your own application.

<br/>
  <br/>
  <br/>
  <br/>

## Tricks, Tips, and Common Solutions

<br />

### Drop a user off with native gas

The most common way to accomplish this is to simply specify a large `maxTransactionFee` with the user's wallet as the `refundAddress`. This can also be done via the `receiverValue`, however the `receiverValue` rates are always equal to or worse than the `maxTransactionFee` rates.

### Safe Round-Trips

A very common scenario for Hub-and-Spoke style applications is to want to round-trip a delivery from a Spoke chain to the Hub chain and then back. In this case, it's generally a good idea to capture a large `maxTransactionFee` and then perform a `forward` from the Hub chain with the end-user's wallet set to the `refundAddress`. Thus, the end user is ultimately returned all unused funds.

### Bridging Multiple Tokens

Because the WormholeRelayer can handle delivery of multiple messages, you can call the Token Bridge module multiple times in the same transaction using the same nonce and all the VAAs will be included in the delivery array. This is great for scenarios where an action results in tokens being sent to two different locations, or multiple tokens needing to be sent atomically.

### Broadcasting and Multidelivery

You can request delivery to many chains at once by calling `multichainSend` or `multichainForward`. This is great for accomplishing actions like the delivery of a governance event or any other piece of data which has to be sent to all your contracts. This also allows you to send tokens to multiple addresses on multiple chains from a single transaction.

### Faster-than-finality transfers

One of the primary features of the WormholeRelayer protocol is that messages can be delivered faster than finality so long as the RelayProvider supports it. Normally, the Token Bridge module can only transfer tokens once finality has been reached on a chain. However, with the WormholeRelayer protocol, you could potentially initiate two transfers in the same transaction.

- The first transfer sends funds instantly from a liquidity source, so that the end user receives their funds quickly.
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
