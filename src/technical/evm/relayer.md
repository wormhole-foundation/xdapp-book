# Relayer Module

**_Disclaimer: This module is only available in testnet._**

The WormholeRelayer module allows developers to deliver their VAAs via an untrusted **DeliveryProvider**, rather than needing to develop and host their own relay infrastructure.

<br/>
<br/>

## Interacting with the Module

There are two relevant interfaces to discuss when utilizing the WormholeRelayer module:

- [IWormholeRelayer](https://github.com/wormhole-foundation/wormhole/blob/generic-relayer-merge/ethereum/contracts/interfaces/relayer/IWormholeRelayer.sol) - the primary interface by which you interact with the module. It allows you to request deliveries from a given DeliveryProvider.
- [IWormholeReceiver](https://github.com/wormhole-foundation/wormhole/blob/generic-relayer-merge/ethereum/contracts/interfaces/relayer/IWormholeReceiver.sol) - this is the interface you are responsible for implementing. It allows the selected Delivery Provider to deliver messages to your contract.

Check the [deployed contracts page](../../reference/contracts.md) for contract addresses on each supported blockchain.

A minimal setup that can receive messages looks something like this:

```solidity
import "../IWormholeRelayer.sol";
import "../IWormholeReceiver.sol";

contract HelloWorld is IWormholeReceiver {

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory additionalVaas,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32 deliveryHash
    ) public payable override onlyRelayerContract {

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

Let's cover how to send a "Hello World" message. The basic mechanism to call the `sendPayloadToEvm` function on the IWormholeRelayer interface. Here's its basic usage:

```solidity
function sendHelloWorldMessage() public payable {
    //spell out some constants
    bytes memory helloWorld = abi.encode("Hello World");
    uint256 gasLimit = 500000;
    uint256 receiverValue = 0; // don't deliver any 'msg.value' along with the message

    //calculate cost to deliver message
    (uint256 deliveryCost,) = relayer.quoteEVMDeliveryPrice(
        targetChain,
        receiverValue, 
        gasLimit
    );

    // publish delivery request
    relayer.sendPayloadToEvm{value: deliveryCost}(
        TARGET_CHAIN, TARGET_CONTRACT, helloWorld, receiverValue, gasLimit
    );
}
```

In this code, we first emit a "Hello World" message via the Wormhole Core Layer the same way it's always done. We then request from the default DeliveryProvider that they deliver all messages emitted from this transaction with nonce 1 to the TARGET_CONTRACT on the TARGET_CHAIN.

Let's break down all the things happening in this code.

- `deliveryCost` - this calculates the necessary price for the selected DeliveryProvider to perform a delivery with 500,000 gas on the target chain. Thus, by paying this `deliveryCost`, you can be sure that your `receiveWormholeMessages` function will be invoked with a gas limit of 500,000. There's more info on the how these deliveries work in a later section.
- `targetChain` - Wormhole chainId where the messages should be sent. This is not the same as the EVM Network ID!
- `targetContract` - Contract address on targetChain where the messages should be sent. 
- `gasLimit` - this specifies the maximum units of targetChain gas that can be used to execute receiveWormholeMessages on the targetChain. If the gasLimit is exceeded during contract execution you will enter a **receiver failure** state. Note: If you have a wallet on the targetChain (or any chain) that you wish to collect refunds to (i.e. if your contract takes less than `gasLimit` units of gas to execute), there is an option in IWormholeRelayer to have this happen.
- `receiverValue` - this amount (in targetChain wei) is passed to `receiveWormholeMessages` on the target chain when the delivery happens. This is useful for covering small fees encountered during execution on the target chain.

<br/>
<br/>
<br/>
<br/>

## Receiving Messages

To receive messages through the relayer module, simply implement the `IWormholeReceiver` interface.

```solidity
function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory additionalVaas,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32 deliveryHash
    ) public payable override onlyRelayerContract {

    //Do whatever you need to do with 'payload'
}

modifier onlyRelayerContract() {
    require(msg.sender == WORMHOLE_RELAYER_ADDRESS, "msg.sender is not WormholeRelayer contract.");
    _;
}
```

Breaking down everything happening in this code snippet:

- `receiveWormholeMessages` - this is the function which will be invoked by the WormholeRelayer contract when the DeliveryProvider completes the delivery. It will be executed with a gas limit that was specified in the deliveryRequest.
- `payload` - This is the payload that was sent in the delivery request
- `additionalVaas` - In the example shown above, this will be empty. This will contain any additional VAAs that were requested to be relayed through the 'vaaKeys' field. These should not be considered trusted until you call `core_bridge.parseAndVerifyVM` or otherwise verify them against the Core Contract! (More on this in [Best Practices](./bestPractices.md))
- `sourceAddress` - Address that requested this delivery (in Wormhole bytes32 format; i.e. if this is originally an EVM address, it will be left-padded with 12 zeros)
- `sourceChain` - Chain (in Wormhole Chain ID format) that this delivery was requested from 
- `deliveryHash` - Unique identifier of this delivery request. Specifically, this is the hash of the delivery VAA. 
- `onlyRelayerContract` - this prevents contracts other than the WormholeRelayer contract from calling this entrypoint. The WormholeRelayer contract handles the invocation of `receiveWormholeMessages`, and ensures that relayers can't improperly call it.

Here are a few other important points to note:

- `receiveWormholeMessages` function should generally not throw an exception or revert during execution. If an exception is thrown, or a 'require' statement is violated, you will enter a receiver failure. When a receiver failure occurs, the execution of `receiveWormholeMessages` is reverted.

- `receiveWormholeMessages` will only be called with as much gas as was specified by the gasLimit specified when the message delivery was requested. If you exceed this gas amount, you will enter a delivery failure.

<br/>
<br/>
<br/>
<br/>

# Delivery Guarantees & Delivery Failures

The WormholeRelayer protocol is intended to create a service interface whereby mutually distrustful integrators and DeliveryProviders can work together to provide a seamless Dapp experience. You don't trust the delivery providers with your data, and the delivery providers don't trust your smart contract. The primary agreement which is made between integrators and delivery providers is that:

**When a delivery is requested, the delivery provider will attempt to deliver the VAA within the provider's stated delivery timeframe.**

As a baseline, DeliveryProviders should aim to perform deliveries **within 5 minutes of the VAA creation, assuming blockchain liveness**.

This creates a marketplace whereby providers can set different price levels and service guarantees. Delivery providers effectively accept the slippage risk premium of delivering your VAAs in exchange for a set fee rate. Thus, the providers agree to deliver your messages **even if they have to do so at a loss**.

Relay providers should set their prices such that they turn a profit on average, but not necessarily on every single transfer. Thus, some providers may choose to set higher rates for tighter guarantees, or lower rates for less stringent guarantees.

<br/>

### Receiver Failures

All deliveries should result in one of following four outcomes prior to the delivery timeframe of the delivery provider. These outcomes are emitted as EVM events from the WormholeRelayer contract when they occur.

- Delivery Success
- Receiver Failure
- Forward Request Success (More on forwarding in a later section)
- Forward Request Failure

Receiver Failures are not a nebulous 'something went wrong' term in the Wormhole Core Relayer protocol. A delivery failure is a well-defined term which means that the selected provider **performed the delivery, but the delivery was not able to be completed.** There are only three causes for a delivery failure:

- the target contract does not implement the `IWormholeReceiver` interface
- the target contract threw an exception or reverted during execution of `receiveWormholeMessages`
- the target contract exceeded the specified `gasLimit` while executing `receiveWormholeMessages`

All three of these scenarios should generally be avoidable by the integrator, and thus it is up to integrator to resolve them.

Any other scenario which causes a delivery to not be performed should be considered an **outage** by some component of the system, including potentially the blockchains themselves.

<br/>

### Redelivery

What happens in the case of a delivery failure is up to you as the integrator. It is perfectly acceptable to just leave the delivery incomplete, if that's acceptable for your usecase.

However, in the scenario where you need to reattempt the delivery, there is a function specifically for this.

```solidity
function resendExample() public payable {
    //spelling out consts
    IWormholeRelayer.VaaKey memory deliveryVaaKey = IWormholeRelayer.VaaKey({
        chainId: SOURCE_CHAIN,
        emitterAddress: EMITTER_ADDRESS, // address which requested the delivery, in Wormhole bytes32 format (for EVM addresses, left-padded with 12 zeros)
        sequence: DELIVERY_SEQUENCE_NUMBER // return value from the send
    });
    uint16 targetChain = TARGET_CHAIN;
    uint256 newReceiverValue = 0;
    uint256 newGasLimit = 1000000;

    (uint256 deliveryCost,) = relayer.quoteEVMDeliveryPrice(
        targetChain,
        newReceiverValue,
        newGasLimit
    );

    relayer.resendToEvm{value: deliveryCost}(
        deliveryVaaKey, targetChain, newReceiverValue, newGasLimit, relayer.getDefaultDeliveryProvider()
    );
}
```

Note: **the requester must pay a second time in order to initiate the redelivery**.

Also note: **Redeliveries must not decrease the original gasLimit, receiverValue, or targetChainRefundPerGasUnused**

<br/>
<br/>
<br/>
<br/>

## Forwarding

So far we've discussed how to perform a simple delivery from chain A to chain B. However, a fairly common scenario that you may encounter is that you may want to perform a multi-hop delivery from chain A to B to C, or to round-trip a delivery back to the source chain. Forwarding is a feature specifically designed to suit these use cases.

Forwarding is quite similar to a normal 'send' action, however it has a couple special traits.

- Instead of calling `send`, you should call `forward`.
- `forward` can only be called while a delivery is being executed (I.E, during execution of receiveWormholMessages), and can only be called by the contract which is receiving the delivery.
- When a forward is requested, the `refundAddress` of the delivery is ignored, and the refund is instead used to pay for the next delivery.
- You can add supplemental funds to cover the forwarding costs by passing additional tokens in msg.value.
- If the refund amount + supplemental funds do not cover the cost of the delivery, you will encounter a Forward Failure.
- Forward Failures, just like Receiver Failures, revert the previous delivery

  <br/>
  <br/>
  <br/>
  <br/>

## Security & Proper Usage

### Validating Received Messages

The array of `additionalVaas` which is passed to `receiveWormholeMessages` are non-validated VAAs. This means _you are responsible for validating these messages_. This is most commonly done by either calling `parseAndVerifyVM` on the Wormhole Core Contract, or by passing the VAA into another contract which will do its own verification. However, this design benefits you quite a few desireable security properties:

- Relayers are not trusted with payload content! If they were to modify the content of a payload during delivery, it would invalidate the signatures on the delivery VAA, which the WormholeRelayer contract checks before delivering the message. This means, as long as you restrict the receiveWormholeMessage to only be called by the WormholeRelayer contract, relayers are only trusted for **liveness**.

- There are also very few trust assumptions placed on the WormholeRelayer contract. The WormholeRelayer contract only enforces a few protections, such as that refunds are correctly paid out

However, as always with smart contract development, there are some things you should be aware of:

- Deliveries can potentially be performed multiple times, and redeliveries for any delivery can be requested by anyone. If you need replay protection on your deliveries, you will have to enforce it yourself. One common methodology for replay protection is simply to store a map of 'deliveryHash' to boolean in your contract state, and check that 'deliveryHash' doesn't already exist in this map.

<br/>
  <br/>
  <br/>
  <br/>

## Tricks, Tips, and Common Solutions

<br />

### Safe Round-Trips

A very common scenario for Hub-and-Spoke style applications is to want to round-trip a delivery from a Spoke chain to the Hub chain and then back. In this case, it's generally a good idea to set `receiverValue` to be what you expect the price of the second leg of the delivery will be (in Hub-chain currency) and then perform a `forward`, passing in receiverValue as msg.value, from the Hub chain with the end-user's wallet set to the `refundAddress`. Thus the end user is ultimately returned all unused funds.

### Bridging Multiple Tokens

Because the WormholeRelayer can handle delivery of multiple messages, you can call the Token Bridge module multiple times and have 'vaaKeys' identify the resulting VAAs, and then these VAAs will be included in the delivery array. This is great for scenarios where an action results in tokens being sent to two different locations, or multiple tokens needing to be sent atomically.

### Faster-than-finality transfers

One of the primary features of the WormholeRelayer protocol is that messages can be delivered faster than finality so long as the DeliveryProvider supports it. Normally the Token Bridge module can only transfer tokens once finality has been reached on a chain. However, with the WormholeRelayer protocol, you could potentially initiate two transfers in the same transaction.

- The first transfer sends funds instantly from a liqudity source, so that the end user receives their funds quickly.
- The second transfer sends funds via the Token Bridge to reimburse the liquidity source on the `targetChain`

Beware, the second transfer may never arrive if there is a rollback on the `sourceChain`. However, this risk can be managed if the primary concern is to provide users with a smooth user experience.

<br/>
<br/>
<br/>
<br/>

## Examples

Checkout this [Hello World contract](https://github.com/wormhole-foundation/wormhole/blob/generic-relayer-merge/ethereum/contracts/mock/relayer/MockRelayerIntegration.sol)

<br/>

**More info and features to come. This module is still in development.**
