# Overview of Receving Messages

The basic flow of receving messages requires you (or a relayer!) to submit the VAA to your application contract. This contract then calls the Core Bridge on the receving chain to check the message signatures against the stored guardian set signatures. 

If those checks pass, then the application can check to see if it's a message that's already been processed before by checking it's sequence number against a store list of processed message sequence numbers. 

The final optional check is to make sure that the message came from an application from the source chain that we were expecting. Usually this is our own application, and should be registered during initialization steps (see [registration](../registration/overview.md)). 

After we have ensured all those things are correct, we can go ahead and process the message according to the business logic in our application.