# Relayer Module

**_Disclaimer: This module is only available in devnet, and is subject to change while still in development._**

In order to integrate with the relayer module (which enables generic relaying), there are two requirements placed on the integrator.

1. To receive messages, the integrator must implement the `wormholeReceiver` interface, which will be called by the relayer to deliver the requested messages. If the recipient contract does not implement this function on their contract, the delivery will automatically fail.

2. To request message delivery, the integrator must call the `requestDelivery(DeliveryInstructions instructions)` function on the relayer module.

## Receiving Messages

Receiving messages through the relayer module is almost trivial. Simply implement the public function `wormholeReciever` in your contract that the relayer module will invoke.

```
function wormholeReceiver(
    bytes[] memory vaas,
    uint16 sourceChain,
    bytes32 sourceAddress,
    bytes memory payload
)
```

This is the function takes the following four inputs:

- `vaas`: VAAs which were requested for delivery
- `sourceChain`: Wormhole chain ID of the chain the messages were sent from
- `sourceAddress`: address which requested delivery (_In Wormhole format!_)
- `payload`: additional payload which is at the top level

There are a few noteworthy items here:

- `wormholeReceiver` function should never throw an exception. Throwing an exception here will just cause a delivery failure and _will not revert the transaction(!!!)_.
- `wormholeReceiver` will only be called with as much gas as was specified by the compute budget specified when the message delivery was requested.
- Batch VAAs are always used by the relayer module. `vaas` is an array of all the headless VAAs for which delivery was requested. These VAAs are not verified until you have VM objects which is obtained by calling `core_bridge.parseAndVerifyVM`! (More on this in [Best Practices](./bestPractices.md))
- The generic relay VAA will be included in the `vaas` array you receive. This VAA can be ignored, but you can use it if it's useful to you.

## Sending Messages

In order to send a message to another contract, you must call `requestDelivery(DeliveryInstructions instructions)`. There are a few different things you can accomplish with this call.

First let's lay out the DeliveryInstructions object, which is part of the relayer module structs.

```
struct DeliveryParameters {
    uint16 targetChain;
    bytes32 targetAddress;
    bytes payload;
    VAAId[] deliveryList;
    bytes relayParameters;
    bytes chainPayload;
    uint32 nonce;
    uint8 consistencyLevel;
}
```

- `targetChain`: chain ID of the chain this should be delivered to
- `targetAddress`: contract address to deliver to (_in Wormhole format_)
- `payload`: additional payload which will be included in the delivery
- `deliveryList` (_optional_): mechanism for re-delivery of already existing VAAs
- `relayParameters`: information required to relay to the target env. Contains compute budget
- `chainPayload`: information used for computation efficiency when relaying to other ecosystems
- `nonce` (_optional_): If included, only messages with this nonce will be relayed
- `consistencyLevel`: what level of consistency / finality to reach before emitting the message
- `msg.value`: payment in native currency to relayer that must cover the compute budget specified in the relayer parameters

## Compute Budget

Part of the relay parameters is a 'computeBudget' which specifies the maximum amount of computation that can be spent executing delivery on the destination contract. This is effectively a 'gasLimit' in the EVM ecosystem, but due to the relayer network supporting blockchains that don't utilize the concept of gas, we use a more generalizable concept of 'computation budget'.

When requesting delivery, the caller must specify and pay for the compute budget upfront. Compute budget which is not utilized will be refunded on the target chain. If the compute budget is exhausted during the execution of the delivery, a delivery failure occurs. When a delivery failure occurs, the computation budget from the source chain is not refunded, as the relayer used it to process the failed transaction.

The computation 'rate' is specified by the relayer module and is different for each blockchain. The quote provided by the relayer module contains the fee for the requested compute budget AND the fixed overheads of the computation which is done by the relayer contract.

## Delivery Failures

'Delivery Failure' is a technical term in the case of the relayer module. It does not mean 'something went wrong', but rather that the relayer attempted to deliver the VAA, and was unsuccessful. There are only 3 causes of a delivery failure.

- The `wormholeReceiver` function is either missing or otherwise uncallable on the recipient contract.
- The `wormholeReceiver` function encountered an exception while processing.
- The `wormholeReceiver` function exhausted the computeBudget that was specified by the delivery requester.

All three of these scenarios are controllable by the integrator. In order to avoid delivery failures, the integrators should have a top-level try-catch such that the wormholeReceiver never reverts, and should always request a worst-case compute budget since excess budget will be refunded.

## Delivery Retries

In the unfortunate scenario of a delivery failure, the VAAs can be re-delivered by requesting their delivery a second time. To accomplish this, simply list their VAA IDs in the `deliveryList` in the call.

**More info and features to come. This module is still in development.**
