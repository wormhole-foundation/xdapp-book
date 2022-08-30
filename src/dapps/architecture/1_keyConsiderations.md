# Key Considerations

Before we get started, we should outline the key considerations that will shape your xDapp. Below, we'll show how each of the decisions you make about these key considerations can impact the structure of your application as a whole.

### Why?

The reason you're building an xDapp is the foremost consideration. Think about the [advantages](../5_advantages.md) of cross-chain development -- which of these are most important to you? Are you building a brand new application and you want the widest reach? Are you trying to increase the performance of an existing Dapp? Are you interested in composing on top of protocols that only exist in certain ecosystems? Determining your key priorities will help you make better technical decisions and tradeoffs when designing your xDapp.

### Target Ecosystems & Languages

Which blockchains do you intend to support? Because different blockchains utilize different virtual machines, supporting more blockchains often requires writing smart contracts in more than one language.

### Data Flows

Think about where your data originates and where it needs to go. Does all your data come from user-initiated transactions? Do you have governance messages that need to be emitted from a central governance contract? Do you have automated actions which need to happen periodically to synchronize your data? 

### Liquidity & Tokens

Not all xDapps deal with tokens, but many do. If your app is centered around tokens, you'll have to decide which tokens will be utilized, where liquidity is aggregated (or fractured), and how this liquidity can be best utilized across your application.
