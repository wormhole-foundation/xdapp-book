# xDapp Scaffold

To help you get started with cross-chain development, we've provided a template project in `projects/xdapp-starter`. All sample projects will be made using this template, so check them out if you want to get a feel for how various modules interact with each other.

The template uses npm workspaces to setup a main project with subdirectories for each supported chain. This allows you to initialize each subdirectory using any scaffolding tool for each individual chain along with orchestration code in a common directory. 

What's in the `xdapp-starter` project:

### chains/
This folder contains the subdirectories for chain-specific code. For example, you might use the `anchor` tool to `anchor init solana-project` within the chains/ directory.

### handlers/ 
The handlers/ folder contains the js client code to deal with each chain's specific needs. They expose a common API that we can consume in `starter.js` for code cleanliness.

### orchestrator.js
This file parses command line args and filters calls to chain management handlers. 

### xdapp.config.json
The config file contains all the information about the network rpc nodes, accounts, and other constants used to communicate with contracts deployed to the selected chains.
[[remoteStaking]]
