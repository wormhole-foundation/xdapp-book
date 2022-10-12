import { readdirSync, readFileSync } from "fs";
import {
  CommonEnv,
  ExecutorEnv,
  getLogger,
  initLogger,
  Mode,
  run,
} from "relayer-engine";
import { EnvType } from "relayer-plugin-interface";
import { MessengerRelayerPlugin, XDappConfig } from "./plugin";

async function main() {
  const xDappConfig: XDappConfig = JSON.parse(
    readFileSync("./xdapp.config.json").toString()
  );
  const messengerABI = JSON.parse(
    readFileSync("./chains/evm/out/Messenger.sol/Messenger.json").toString()
  ).abi;

  const registeredContracts = readdirSync("./deployinfo")
    .filter((fname) => fname.split(".").length === 3)
    .map((fname) => {
      const file = JSON.parse(readFileSync(`./deployinfo/${fname}`).toString());
      const network = fname.split(".")[0];
      const chainId = xDappConfig.networks[network].wormholeChainId;
      return { chainId, contractAddress: file.address };
    });

  const relayerConfig = {
    logLevel: "debug",
    redisHost: "localhost",
    redisPort: 6379,
    pluginURIs: [],
    envType: EnvType.LOCALHOST,
    mode: Mode.BOTH,
    supportedChains: Object.entries(xDappConfig.networks).map(
      ([networkName, network]) => {
        return {
          chainId: network.wormholeChainId,
          chainName: networkName,
          nodeUrl: network.rpc,
          nativeCurrencySymbol: network.wormholeChainId === 1 ? "SOL" : "ETH",
          bridgeAddress: network.bridgeAddress,
        };
      }
    ),
  };
  await initLogger(relayerConfig.logLevel);
  const plugin = new MessengerRelayerPlugin(
    relayerConfig,
    { registeredContracts, xDappConfig, messengerABI },
    getLogger()
  );
  await run({
    plugins: [plugin],
    configs: {
      executorEnv: {
        // @ts-ignore
        privateKeys: Object.fromEntries(
          Object.values(xDappConfig.networks).map((network) => {
            return [network.wormholeChainId, [network.privateKey]];
          })
        ),
      },
      listenerEnv: { spyServiceHost: "localhost:7073" },
      commonEnv: relayerConfig as CommonEnv,
    },
    mode: Mode.BOTH,
    envType: EnvType.LOCALHOST,
  });
}

main().then((e) => {
  console.error(e);
  process.exit(1);
});
