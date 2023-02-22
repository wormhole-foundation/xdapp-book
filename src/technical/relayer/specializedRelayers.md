# Specialized Relayers

Rather than home-rolling a relayer, it's recommended that integrators start from the existing [Spy Relayer](https://github.com/wormhole-foundation/wormhole/tree/main/relayer/spy_relayer) provided in the Wormhole Core Repository.

Additionally there's an extensible relayer (called the [Plugin Relayer](https://github.com/wormhole-foundation/wormhole/tree/feat/plugin_relayer/relayer/plugin_relayer)) currently in development.

<!-- To aid in the development of relayers, a extensible relayer implementation (called the [plugin relayer]()) has been provided in the Wormhole Core Repository.

It's recommended that integrators create their own plugin for the plugin relayer, rather than home-roll a relayer themselves. Using the plugin relayer allows integrators to take advantage of the robust hot-wallet and scheduling built into the relayer's kernel, as well as leveraging plugins which are built by other integrators.  -->
