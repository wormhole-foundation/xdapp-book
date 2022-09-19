# Environment Setup

The bare minimum Wormhole environment is just a blockchain linked up to a Guardian node. There are quite a few ways of accomplishing this, and if you're just looking to get your feet wet, you should try whichever sounds easiest.

However, as you get deeper into cross-chain development you'll likely find you have a growing number of components, dependencies, and teammates in the picture making your development environment more complex. Here are some of the considerations you should have in mind when choosing a development environment which will be well suited for your xDapp.

### What components do I need now? What components will I need in the future?

- You may be able to get a lot done with just an EVM chain and a Guardian. However, as your application gets more sophisticated, components like relayers, frontends, automated tests, databases, explorers, and other blockchains are likely to get added in to the environment.

### What are my dependencies?

- If your smart contracts have no dependencies, it may be possible for you to develop in a vacuum. However, if you're working on a fledgling blockchain and trying to integrate with other applications which are also in development, you may have no choice but to work in testnet alongside other development teams.

- Just because you have dependencies doesn't mean you automatically have to develop in testnet or mainnet. Often times it's relatively trivial to redeploy your dependencies in Tilt, or to use something like [Foundry](https://github.com/foundry-rs/foundry) to create a development version of an existing testnet or mainnet.

### How am I going to collaborate?

- You should consider how your teammates or collaborators are going to work in this environment from the start. There are some basic considerations like "how will they access it", but also some subtler points such as ensuring that contracts will deploy deterministically and that automated tests can be trusted to run reliably. The two paths to accomplish this are to use a public environment (testnet), or to ensure the local environment is well controlled (like tilt).
