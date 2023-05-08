# Contracts

Here you can find the addresses for the deployed contracts on all the chains that Wormhole supports, including testnet.

The [constants](https://github.com/wormhole-foundation/wormhole/blob/main/sdk/js/src/utils/consts.ts) of the Wormhole SDK always has the most up-to-date contract addresses, along with additional useful constants. Check there if something you're looking for isn't found here. Note that the Sui contract addresses are the contract state object IDs and not the package IDs. For an overview of objects on Sui, please see the [docs](https://docs.sui.io/learn/objects).

## Mainnet

### Core Bridge

| Chain Name          | Wormhole Chain ID | Network ID   | Address                                                            |
| :------------------ | :---------------- | :----------- | :----------------------------------------------------------------- |
| Solana              | 1                 | mainnet-beta | worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth                        |
| Ethereum            | 2                 | 1            | 0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B                         |
| Terra Classic       | 3                 | columbus-5   | terra1dq03ugtd40zu9hcgdzrsq6z2z4hwhc9tqk2uy5                       |
| Binance Smart Chain | 4                 | 56           | 0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B                         |
| Polygon             | 5                 | 137          | 0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7                         |
| Avalanche (C-Chain) | 6                 | 43114        | 0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c                         |
| Oasis (Emerald)     | 7                 | 4262         | 0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585                         |
| Algorand            | 8                 |              | 842125965                                                          |
| Aurora              | 9                 | 1313161554   | 0xa321448d90d4e5b0A732867c18eA198e75CAC48E                         |
| Fantom              | 10                | 250          | 0x126783A6Cb203a3E35344528B26ca3a0489a1485                         |
| Karura              | 11                | 686          | 0xa321448d90d4e5b0A732867c18eA198e75CAC48E                         |
| Acala               | 12                | 787          | 0xa321448d90d4e5b0A732867c18eA198e75CAC48E                         |
| Klaytn              | 13                | 8217         | 0x0C21603c4f3a6387e241c0091A7EA39E43E90bb7                         |
| Celo                | 14                | 42220        | 0xa321448d90d4e5b0A732867c18eA198e75CAC48E                         |
| NEAR                | 15                |              | contract.wormhole_crypto.near                                      |
| Moonbeam            | 16                | 1284         | 0xC8e2b0cD52Cf01b0Ce87d389Daa3d414d4cE29f3                         |
| Terra               | 18                | phoenix-1    | terra12mrnzvhx3rpej6843uge2yyfppfyd3u9c3uq223q8sl48huz9juqffcnh    |
| Injective           | 19                |              | inj17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9l2q74d                         |
| Sui                 | 21                |              | 0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c |
| Aptos               | 22                |              | 0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625 |
| Arbitrum            | 23                |              | 0xa5f208e072434bC67592E4C49C1B991BA79BCA46                         |
| Optimism            | 24                | 10           | 0xEe91C335eab126dF5fDB3797EA9d6aD93aeC9722                         |
| XPLA                | 28                |              | xpla1jn8qmdda5m6f6fqu9qv46rt7ajhklg40ukpqchkejcvy8x7w26cqxamv3w    |

#### Core Bridge - Read Only

These chains can _verify_ Wormhole messages submitted to them, but cannot _emit_ messages for other chains.

| Chain Name | Wormhole Chain ID | Network ID | Address                                    |
| :--------- | :---------------- | :--------- | :----------------------------------------- |
| Gnosis     | 25                | 100        | 0xa321448d90d4e5b0A732867c18eA198e75CAC48E |

### Token Bridge

| Chain Name          | Wormhole Chain ID | Network ID   | Address                                                            |
| :------------------ | :---------------- | :----------- | :----------------------------------------------------------------- |
| Solana              | 1                 | mainnet-beta | wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb                        |
| Ethereum            | 2                 | 1            | 0x3ee18B2214AFF97000D974cf647E7C347E8fa585                         |
| Terra               | 3                 | columbus-5   | terra10nmmwe8r3g99a9newtqa7a75xfgs2e8z87r2sf                       |
| Binance Smart Chain | 4                 | 56           | 0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7                         |
| Polygon             | 5                 | 137          | 0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE                         |
| Avalanche (C-Chain) | 6                 | 43114        | 0x0e082F06FF657D94310cB8cE8B0D9a04541d8052                         |
| Oasis (Emerald)     | 7                 | 4262         | 0x5848C791e09901b40A9Ef749f2a6735b418d7564                         |
| Algorand            | 8                 |              | 842126029                                                          |
| Aurora              | 9                 | 1313161554   | 0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F                         |
| Fantom              | 10                | 250          | 0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2                         |
| Karura              | 11                | 686          | 0xae9d7fe007b3327AA64A32824Aaac52C42a6E624                         |
| Acala               | 12                | 787          | 0xae9d7fe007b3327AA64A32824Aaac52C42a6E624                         |
| Klaytn              | 13                | 8217         | 0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F                         |
| Celo                | 14                | 42220        | 0x796Dff6D74F3E27060B71255Fe517BFb23C93eed                         |
| NEAR                | 15                |              | contract.portalbridge.near                                         |
| Moonbeam            | 16                | 1284         | 0xb1731c586ca89a23809861c6103f0b96b3f57d92                         |
| Terra               | 18                | phoenix-1    | terra153366q50k7t8nn7gec00hg66crnhkdggpgdtaxltaq6xrutkkz3s992fw9   |
| Injective           | 19                |              | inj1ghd753shjuwexxywmgs4xz7x2q732vcnxxynfn                         |
| Sui                 | 21                |              | 0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9 |
| Aptos               | 22                |              | 0x576410486a2da45eee6c949c995670112ddf2fbeedab20350d506328eefc9d4f |
| Arbitrum            | 23                |              | 0x0b2402144Bb366A632D14B83F244D2e0e21bD39c                         |
| Optimism            | 24                | 10           | 0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b                         |
| XPLA                | 28                |              | xpla137w0wfch2dfmz7jl2ap8pcmswasj8kg06ay4dtjzw7tzkn77ufxqfw7acv    |

### NFT Bridge

| Chain Name          | Wormhole Chain ID | Network ID   | Address                                                            |
| :------------------ | :---------------- | :----------- | :----------------------------------------------------------------- |
| Solana              | 1                 | mainnet-beta | WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD                        |
| Ethereum            | 2                 | 1            | 0x6FFd7EdE62328b3Af38FCD61461Bbfc52F5651fE                         |
| Binance Smart Chain | 4                 | 56           | 0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE                         |
| Polygon             | 5                 | 137          | 0x90BBd86a6Fe93D3bc3ed6335935447E75fAb7fCf                         |
| Avalanche (C-Chain) | 6                 | 43114        | 0xf7B6737Ca9c4e08aE573F75A97B73D7a813f5De5                         |
| Oasis (Emerald)     | 7                 | 4262         | 0x04952D522Ff217f40B5Ef3cbF659EcA7b952a6c1                         |
| Aurora              | 9                 | 1313161554   | 0x6dcC0484472523ed9Cdc017F711Bcbf909789284                         |
| Fantom              | 10                | 250          | 0xA9c7119aBDa80d4a4E0C06C8F4d8cF5893234535                         |
| Karura              | 11                | 686          | 0xb91e3638F82A1fACb28690b37e3aAE45d2c33808                         |
| Acala               | 12                | 787          | 0xb91e3638F82A1fACb28690b37e3aAE45d2c33808                         |
| Klaytn              | 13                | 8217         | 0x3c3c561757BAa0b78c5C025CdEAa4ee24C1dFfEf                         |
| Celo                | 14                | 42220        | 0xA6A377d75ca5c9052c9a77ED1e865Cc25Bd97bf3                         |
| Moonbeam            | 16                | 1284         | 0x453cfbe096c0f8d763e8c5f24b441097d577bde2                         |
| Aptos               | 22                |              | 0x1bdffae984043833ed7fe223f7af7a3f8902d04129b14f801823e64827da7130 |
| Arbitrum            | 23                | 42161        | 0x453cfbe096c0f8d763e8c5f24b441097d577bde2                         |
| Optimism            | 24                | 10           | 0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585                         |

## Testnet

### Core Bridge

| Chain Name              | Wormhole Chain ID | Network ID | Address                                                            |
| :---------------------- | :---------------- | :--------- | :----------------------------------------------------------------- |
| Solana                  | 1                 | devnet     | 3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5                       |
| Ethereum (Goerli)       | 2                 | 5          | 0x706abc4E45D419950511e474C7B9Ed348A4a716c                         |
| Ethereum (Sepolia)      | 10002             | 11155111   | 0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78                         |
| Terra                   | 3                 | bombay-12  | terra1pd65m0q9tl3v8znnz5f5ltsfegyzah7g42cx5v                       |
| Binance Smart Chain     | 4                 | 97         | 0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D                         |
| Polygon (Mumbai)        | 5                 | 80001      | 0x0CBE91CF822c73C2315FB05100C2F714765d5c20                         |
| Avalanche (Fuji)        | 6                 | 43113      | 0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C                         |
| Oasis (Emerald Testnet) | 7                 | 42261      | 0xc1C338397ffA53a2Eb12A7038b4eeb34791F8aCb                         |
| Algorand (Testnet)      | 8                 |            | 86525623                                                           |
| Aurora                  | 9                 | 1313161555 | 0xBd07292de7b505a4E803CEe286184f7Acf908F5e                         |
| Fantom                  | 10                | 4002       | 0x1BB3B4119b7BA9dfad76B0545fb3F531383c3bB7                         |
| Karura                  | 11                | 686        | 0xE4eacc10990ba3308DdCC72d985f2a27D20c7d03                         |
| Acala                   | 12                | 787        | 0x4377B49d559c0a9466477195C6AdC3D433e265c0                         |
| Klaytn                  | 13                | 1001       | 0x1830CC6eE66c84D2F177B94D544967c774E624cA                         |
| Celo                    | 14                | 44787      | 0x88505117CA88e7dd2eC6EA1E13f0948db2D50D56                         |
| NEAR                    | 15                |            | wormhole.wormhole.testnet                                          |
| Moonbase alpha          | 16                | 1287       | 0xa5B7D85a8f27dd7907dc8FdC21FA5657D5E2F901                         |
| Terra                   | 18                | pisco-1    | terra19nv3xr5lrmmr7egvrk2kqgw4kcn43xrtd5g0mpgwwvhetusk4k7s66jyv0   |
| Injective               | 19                | testnet    | inj1xx3aupmgv3ce537c0yce8zzd3sz567syuyedpg                         |
| Sui                     | 21                |            | 0x69ae41bdef4770895eb4e7aaefee5e4673acc08f6917b4856cf55549c4573ca8 |
| Aptos                   | 22                |            | 0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625 |
| Arbitrum                | 23                | 421613     | 0xC7A204bDBFe983FCD8d8E61D02b475D4073fF97e                         |
| Optimism (Goerli)       | 24                | 420        | 0x6b9C8671cdDC8dEab9c719bB87cBd3e782bA6a35                         |
| Base                    | 30                | 84531      | 0x23908A62110e21C04F3A4e011d24F901F911744A                         |

These chains can _verify_ Wormhole messages submitted to them, but cannot _emit_ messages for other chains.

| Chain Name     | Wormhole Chain ID | Network ID | Address                                    |
| :------------- | :---------------- | :--------- | :----------------------------------------- |
| Gnosis (Sokol) | 25                | 77         | 0xE4eacc10990ba3308DdCC72d985f2a27D20c7d03 |

### Token Bridge

| Chain Name              | Wormhole Chain ID | Network ID | Address                                                            |
| :---------------------- | :---------------- | :--------- | :----------------------------------------------------------------- |
| Solana                  | 1                 | devnet     | DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe                       |
| Ethereum (Goerli)       | 2                 | 5          | 0xF890982f9310df57d00f659cf4fd87e65adEd8d7                         |
| Ethereum (Sepolia)      | 10002             | 11155111   | 0xDB5492265f6038831E89f495670FF909aDe94bd9                         |
| Terra                   | 3                 | bombay-12  | terra1pseddrv0yfsn76u4zxrjmtf45kdlmalswdv39a                       |
| Binance Smart Chain     | 4                 | 97         | 0x9dcF9D205C9De35334D646BeE44b2D2859712A09                         |
| Polygon (Mumbai)        | 5                 | 80001      | 0x377D55a7928c046E18eEbb61977e714d2a76472a                         |
| Avalanche (Fuji)        | 6                 | 43113      | 0x61E44E506Ca5659E6c0bba9b678586fA2d729756                         |
| Oasis (Emerald Testnet) | 7                 | 42261      | 0x88d8004A9BdbfD9D28090A02010C19897a29605c                         |
| Algorand (Testnet)      | 8                 |            | 86525641                                                           |
| Aurora                  | 9                 | 1313161555 | 0xD05eD3ad637b890D68a854d607eEAF11aF456fba                         |
| Fantom                  | 10                | 4002       | 0x599CEa2204B4FaECd584Ab1F2b6aCA137a0afbE8                         |
| Karura                  | 11                | 686        | 0xd11De1f930eA1F7Dd0290Fe3a2e35b9C91AEFb37                         |
| Acala                   | 12                | 787        | 0xebA00cbe08992EdD08ed7793E07ad6063c807004                         |
| Klaytn                  | 13                | 1001       | 0xC7A13BE098720840dEa132D860fDfa030884b09A                         |
| Celo                    | 14                | 44787      | 0x05ca6037eC51F8b712eD2E6Fa72219FEaE74E153                         |
| Near                    | 15                |            | token.wormhole.testnet                                             |
| Moonbase alpha          | 16                | 1287       | 0xbc976D4b9D57E57c3cA52e1Fd136C45FF7955A96                         |
| Injective               | 19                | testnet    | inj1q0e70vhrv063eah90mu97sazhywmeegp7myvnh                         |
| Sui                     | 21                |            | 0x32422cb2f929b6a4e3f81b4791ea11ac2af896b310f3d9442aa1fe924ce0bab4 |
| Aptos                   | 22                |            | 0x576410486a2da45eee6c949c995670112ddf2fbeedab20350d506328eefc9d4f |
| Arbitrum                | 23                | 421613     | 0x23908A62110e21C04F3A4e011d24F901F911744A                         |
| Optimism (Goerli)       | 24                | 420        | 0xC7A204bDBFe983FCD8d8E61D02b475D4073fF97e                         |
| Base                    | 30                | 84531      | 0xA31aa3FDb7aF7Db93d18DDA4e19F811342EDF780                         |

### Relayer Contracts

| Chain Name          | Wormhole Chain ID | Network ID | Address                                    |
| :------------------ | :---------------- | :--------- | :----------------------------------------- |
| Binance Smart Chain | 4                 | 97         | 0xda2592C43f2e10cBBA101464326fb132eFD8cB09 |
| Polygon (Mumbai)    | 5                 | 80001      | 0xFAd28FcD3B05B73bBf52A3c4d8b638dFf1c5605c |
| Avalanche (Fuji)    | 6                 | 43113      | 0xDDe6b89B7d0AD383FafDe6477f0d300eC4d4033e |
| Celo                | 14                | 44787      | 0xA92aa4f8CBE1c2d7321F1575ad85bE396e2bbE0D |
| Moonbase            | 16                | 1287       | 0x57523648FB5345CF510c1F12D346A18e55Aec5f5 |

### Default Relay Providers

| Chain Name          | Wormhole Chain ID | Network ID | Address                                    |
| :------------------ | :---------------- | :--------- | :----------------------------------------- |
| Binance Smart Chain | 4                 | 97         | 0xFAEd45351a0ddC272dc89c29c17e228278d2A24F |
| Polygon (Mumbai)    | 5                 | 80001      | 0x27196D91bD67C437a806Be3d824794C0260e7f4c |
| Avalanche (Fuji)    | 6                 | 43113      | 0x61CAE64b05Cb1fBfc9e810683c5C52F2C886640C |
| Celo                | 14                | 44787      | 0xc5156B6635DC04b692e4298332eab136e1B2055C |
| Moonbase            | 16                | 1287       | 0x8b5315217858B2feD71fcD7677DcC2a546C28C1B |

### NFT Bridge

| Chain Name              | Wormhole Chain ID | Network ID | Address                                      |
| :---------------------- | :---------------- | :--------- | :------------------------------------------- |
| Solana                  | 1                 | devnet     | 2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4 |
| Ethereum (Goerli)       | 2                 | 5          | 0xD8E4C2DbDd2e2bd8F1336EA691dBFF6952B1a6eB   |
| Ethereum (Sepolia)      | 10002             | 11155111   | 0x6a0B52ac198e4870e5F3797d5B403838a5bbFD99   |
| Binance Smart Chain     | 4                 | 97         | 0xcD16E5613EF35599dc82B24Cb45B5A93D779f1EE   |
| Polygon (Mumbai)        | 5                 | 80001      | 0x51a02d0dcb5e52F5b92bdAA38FA013C91c7309A9   |
| Avalanche (Fuji)        | 6                 | 43113      | 0xD601BAf2EEE3C028344471684F6b27E789D9075D   |
| Oasis (Emerald Testnet) | 7                 | 42261      | 0xC5c25B41AB0b797571620F5204Afa116A44c0ebA   |
| Aurora                  | 9                 | 1313161555 | 0x8F399607E9BA2405D87F5f3e1B78D950b44b2e24   |
| Fantom                  | 10                | 4002       | 0x63eD9318628D26BdCB15df58B53BB27231D1B227   |
| Karura                  | 11                | 686        | 0x0A693c2D594292B6Eb89Cb50EFe4B0b63Dd2760D   |
| Acala                   | 12                | 787        | 0x96f1335e0AcAB3cfd9899B30b2374e25a2148a6E   |
| Klaytn                  | 13                | 1001       | 0x94c994fC51c13101062958b567e743f1a04432dE   |
| Celo                    | 14                | 44787      | 0xaCD8190F647a31E56A656748bC30F69259f245Db   |
| Moonbase alpha          | 16                | 1287       | 0x98A0F4B96972b32Fcb3BD03cAeB66A44a6aB9Edb   |
| Arbitrum                | 23                | 421613     | 0xEe3dB83916Ccdc3593b734F7F2d16D630F39F1D0   |
| Optimism (Goerli)       | 24                | 420        | 0x23908A62110e21C04F3A4e011d24F901F911744A   |
| Base                    | 30                | 84531      | 0xF681d1cc5F25a3694E348e7975d7564Aa581db59   |

## Devnet / Tilt

### Core Bridge

| Chain Name          | Wormhole Chain ID | Network ID | Address                                                            |
| :------------------ | :---------------- | :--------- | :----------------------------------------------------------------- |
| Solana              | 1                 |            | Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o                        |
| Ethereum            | 2                 |            | 0xC89Ce4735882C9F0f0FE26686c53074E09B0D550                         |
| Terra               | 3                 |            | terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5                       |
| Binance Smart Chain | 4                 |            | 0xC89Ce4735882C9F0f0FE26686c53074E09B0D550                         |
| Algorand            | 8                 |            | 4                                                                  |
| NEAR                | 15                |            | wormhole.test.near                                                 |
| Terra2              | 18                |            | terra14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9ssrc8au   |
| Sui                 | 21                |            | 0x5a5160ca3c2037f4b4051344096ef7a48ebf4400b3f385e57ea90e1628a8bde0 |
| Aptos               | 22                |            | 0xde0036a9600559e295d5f6802ef6f3f802f510366e0c23912b0655d972166017 |
| Wormholechain       | 3104              |            | wormhole1ap5vgur5zlgys8whugfegnn43emka567dtq0jl                    |

### Token Bridge

| Chain Name          | Wormhole Chain ID | Network ID | Address                                                            |
| :------------------ | :---------------- | :--------- | :----------------------------------------------------------------- |
| Solana              | 1                 |            | B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE                       |
| Ethereum            | 2                 |            | 0x0290FB167208Af455bB137780163b7B7a9a10C16                         |
| Terra               | 3                 |            | terra10pyejy66429refv3g35g2t7am0was7ya7kz2a4                       |
| Binance Smart Chain | 4                 |            | 0x0290FB167208Af455bB137780163b7B7a9a10C16                         |
| Algorand            | 8                 |            | 6                                                                  |
| NEAR                | 15                |            | token.test.near                                                    |
| Terra2              | 18                |            | terra1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrquka9l6   |
| Sui                 | 21                |            | 0xa6a3da85bbe05da5bfd953708d56f1a3a023e7fb58e5a824a3d4de3791e8f690 |
| Aptos               | 22                |            | 0x84a5f374d29fc77e370014dce4fd6a55b58ad608de8074b0be5571701724da31 |
| Wormholechain       | 3104              |            | wormhole1zugu6cajc4z7ue29g9wnes9a5ep9cs7yu7rn3z                    |

### NFT Bridge

| Chain Name          | Wormhole Chain ID | Network ID | Address                                      |
| :------------------ | :---------------- | :--------- | :------------------------------------------- |
| Solana              | 1                 |            | NFTWqJR8YnRVqPDvTJrYuLrQDitTG5AScqbeghi4zSA  |
| Ethereum            | 2                 |            | 0x26b4afb60d6c903165150c6f0aa14f8016be4aec   |
| Terra               | 3                 |            | terra1plju286nnfj3z54wgcggd4enwaa9fgf5kgrgzl |
| Binance Smart Chain | 4                 |            | 0x26b4afb60d6c903165150c6f0aa14f8016be4aec   |
