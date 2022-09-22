# Blockchain Finality Recommendations

The goal of Wormhole is to provide high confidence that only _finalized_ messages are observed and attested. Different chains use different consensus mechanisms and so there are different finality assumptions with each one.

Below is a table of suggested finality recommendations for each of the chains supported by the Wormhole ecosystem to have the highest confidence of finality.

However, these are just suggestions and developers are free to define their own finality windows for their applications. Ultimately, the tradeoff is between speed and security.

| Blockchain | Suggested Number of Block Confirmations |
| ----------- | ----------- |
| Ethereum | 1 |
| Binance Smart Chain | 15 |
| Polygon | 512 |
| Avalanche | 1 |
| Oasis | 1 |
| Aurora | 1 |
| Fantom | 1 |
| Karura | 1 |
| Acala | 1 |
| Klaytn | 1 |
| Celo | 1 |
| Solana | 32 |
| Terra Class | Instant |
| Terra 2 | Instant |

