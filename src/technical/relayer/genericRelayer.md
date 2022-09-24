# Generic Relayers

The defining characteristic of generic relayers is that they do not have any off-chain components for the xDapp developer. All aspects of this integration are on chain.

The implementation details vary by blockchain so you should reference the `relayer module` documentation for each ecosystem. However, the general workflow is the same.

Developers are responsible for implementing a standardized interface which is part of the API agreement with the generic relayer network. This interface generally looks something like

```
wormholeReceiver(
    bytes[] batchVAA,
    sourceChain
    sourceAddress
    payload)
```

This is the entrypoint on your contract which will be called by the relayer.

You are able to request delivery of a VAA via calling the `relayer module` on-chain. As part of the delivery request, you are required to specify and pre-pay a 'future compute' budget, which will designate a limit for how much budget can be spent on the target transaction.

This interface is generally along the lines of:

```
requestDelivery(
    targetChain,
    targetAddress,
    computeBudget,
    nonce,
    consistencyLevel,
)
```

If the requested delivery either runs out of compute budget or throws an exception, the delivery will fail. In the case of a delivery failure, you're always able to request a second delivery. However, the prepaid fee is not refunded. Thus, it is recommended to always place a top-level try-catch around your entrypoint, and to specify a worst-case computation budget. <!-- TODO mention refunds -->
