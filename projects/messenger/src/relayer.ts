import { readdirSync, readFileSync } from "fs";
import { getLogger, initLogger, Mode, run } from "relayer-engine";
import { EnvType } from "relayer-plugin-interface";
import { MessengerRelayerPlugin, XDappConfig } from "./plugin";

async function main() {
  const relayerConfig = JSON.parse(
    readFileSync("./relayer-config/executor.json").toString()
  );
  const xDappConfig: XDappConfig = JSON.parse(
    readFileSync("./xdapp.config.json").toString()
  );
  const messengerABI = readFileSync(
    "./chains/evm/out/Messenger.sol/Messenger.json"
  ).toString();

  const registeredContracts = readdirSync("./deployinfo")
    .filter((fname) => fname.split(".").length === 3)
    .map((fname) => {
      const file = JSON.parse(readFileSync(`./deployinfo/${fname}`).toString());
      const network = fname.split(".")[0];
      const chainId = xDappConfig.networks[network].wormholeChainId;
      return { chainId, contractAddress: file.address };
    });

  await initLogger(relayerConfig.logDir, relayerConfig.logLevel);
  const plugin = new MessengerRelayerPlugin(
    relayerConfig,
    { registeredContracts, xDappConfig, messengerABI },
    getLogger()
  );
  await run({
    plugins: [plugin],
    configs: "./relayer-config",
    mode: Mode.BOTH,
    envType: EnvType.LOCALHOST,
  });
}

main().then((e) => {
  console.error(e);
  process.exit(1);
});
