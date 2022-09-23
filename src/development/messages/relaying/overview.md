# Relaying Messages

Relaying Messages can be done one of three ways:

**_Manual Relaying_**
    
Manual relaying is usally done on the front end.  Manual relaying requires the front end to fetch the VAA it just created and then submit on the target chain. This means the user ends up paying for the gas fee and has to go through the additional step to submit the tx on the target chain. 

**_Protocol-Specific Relayers_**

Protocols and apps can run their own relayers that listen to messages as they are created by the Core Bridge and submit them to their application on the target chain. This offers the ideal user experience, but requires more work from the developer.

**_Generic Relayers_**

Generic relayers can pick up any app or protocol's messages and submit them to the target chain for a fee. This is the ideal developer and user experience, but is still evolving. 
