# Specialized Relayers

- Link to Plugin relayer codebase

- Recommend plugin relayers as the starting point for anyone developing specialized relayers
- plugin relayers provide a kernel for relayer development. Handles management of all the necessary hotwallets, provides the necessary typescript interfaces for dealing with each ecosystems, and provides an easy integration point to connect to the guardian network

- Follow the instructions provided in the codebase in order to get it running
- to develop a plugin, simply implement the interface provided at [here]
- diagram explaining the flow
- Listener component listens to either incoming REST calls or the guardian network for relevant VAAs,
- When a relevant VAA is detected, your listener code is responsible for producing an action.
- This action is stored in a redis instance
- The executor portion of the interface is responsible for consuming interactions which are provided by the listener.
- The executor is handed an action and is responsible for consuming that action and (optionally) queuing up more actions

- additional configuration info can be found in the README of the codebase.
