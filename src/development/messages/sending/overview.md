# Overview of Sending Messages

While the specific code varies chain by chain, the basic flow of sending a message requires your contract to interact with the Core Bridge contract deployed on each chain to emit a VAA.

To emit a VAA requires three pieces of information:

1. Nonce (u32)
    - The nonce is a random number assigned to each message. This allows the receiving contract a way to make sure it doesn't double process messages.
2. Consistency (u8)
    - This is the number of blocks for Guardians to wait before they sign the message. Higher consistencies mean more security against blockchain reorgs. For example, if this is set too low, and the block you're emitting from reorgs, then it's possible that even though the message was emitted and signed by the Guardians and processed on the receiving chain, no record of it exists on the emitting chain. If you were sending tokens across, this would allow for double spend attacks. 
3. Payload (bytes[])
    - This is a payload of raw bytes that you want to emit. It's up to the receiving contract to know how to parse it.
