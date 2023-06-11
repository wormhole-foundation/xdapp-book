# Overview of Receiving Messages

Receiving messages requires you (or a relayer) to submit the VAA to your application contract. This contract then calls the Core Bridge on the receiving chain to check the message signatures against the stored Guardian set signatures. 

If those checks pass, then the application can see if it's a message that's already been processed by checking its sequence number against a store list of processed message sequence numbers. ![[Screenshot 2023-06-12 at 12.39.16 AM.png]]

The final optional check is to make sure that the message came from an application from the source chain that we were expecting. Usually this is our own application, and should be registered during initialization steps (see [registration](../registration/overview.md)). 

After we have ensured all those things are correct, we can process the message according to the business logic in our application.
