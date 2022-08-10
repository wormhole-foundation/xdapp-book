# Relaying Messages

Relaying Messages can be done one of three ways:

1. Manual Relaying 
    
    Manual Relaying is usally done on the front end.  Manual relyaing requires the front end to fetch the VAA it just created and then submit on the target chain. This means the user ends up paying for the gas fee and has to go through the additional step to submit the tx on the target chain. 

2. Protocol Specific Relayers

    Protocols and Apps can run their own relayers, listening to messages as they are created by the Core Bridge and submitting them to their application on the target chain. This is the ideal user experience but requires more work from the developer.

3. Generic Relayers

    Generic Relayers can pick up any app or protocol's messages and submit them to the target chain for a fee. This is the ideal developer and user experience, but is still being developed. 
