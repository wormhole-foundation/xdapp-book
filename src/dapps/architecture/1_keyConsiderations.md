# Key Considerations

Before we get started, we should outline the key considerations which will shape your xDapp. Over the course of the chapter, we'll elaborate on how decisions made about these key items impact the way you may want to structure your application as a whole.

### Why?

Why you are building an xDapp is definitely the foremost consideration. In the first chapter, we went over the [advantages](../5_advantages.md) of cross-chain development. Which of these advantages are most important to you? Are you building a brand new application and you want the widest reach? Are you trying to increase the performance of an existing Dapp? Are you interested in composing on top of protocols which only exist in certain ecosystems? Deciding what your key priorities are will help you make the correct technical decisions and tradeoffs when designing your xDapp.

### Target Ecosystems & Languages

Which blockchains do you intend to support? Due to the fact that blockchains utilize different virtual machines, supporting more blockchains often (but not always) requires writing smart contracts in more than one language.

### Data Flows

Where does your data originate from and where does it have to go? Does all your data come from user-initiated transactions? Do you have governance messages which need to be emitted from a central governance contract? Do you have automated actions which need to happen periodically to synchronize your data?

### Liquidity & Tokens

Not all xDapps deal with tokens, but certainly quite a few do. If your app is centered around tokens, you'll have to decide what tokens will be utilized, where liquidity is aggregated (or fractured), and how this liquidity can be best utilized across your application.
