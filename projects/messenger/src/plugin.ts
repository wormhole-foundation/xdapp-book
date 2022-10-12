import {
  ActionExecutor,
  CommonPluginEnv,
  ContractFilter,
  Plugin,
  PluginFactory,
  Providers,
  StagingArea,
  Workflow,
} from "relayer-plugin-interface";
import * as whSdk from "@certusone/wormhole-sdk";
import { Logger } from "winston";
import { ethers } from "ethers";
import { Connection as SolanaConnection } from "@solana/web3.js";
import { BaseVAA } from "./utils";
import { TextDecoder } from "util";

// todo: do we need this in the plugin or just the relayer??
whSdk.setDefaultWasm("node");

function create(
  commonConfig: CommonPluginEnv,
  pluginConfig: any,
  logger: Logger
): Plugin {
  console.log("Creating da plugin...");
  return new MessengerRelayerPlugin(commonConfig, pluginConfig, logger);
}

export interface MessengerRelayerPluginConfig {
  registeredContracts: { chainId: whSdk.ChainId; contractAddress: string }[];
  xDappConfig: XDappConfig;
  messengerABI: string;
}

type Network = string;

export interface XDappConfig {
  networks: Record<
    Network,
    {
      type: "evm";
      wormholeChainId: whSdk.ChainId;
      rpc: string;
      privateKey: string;
      bridgeAddress: string;
    }
  >;
  wormhole: {
    restAddress: string;
  };
}

// base64 encoded Buffer
type VAA = string;

export class MessengerRelayerPlugin implements Plugin<VAA> {
  readonly shouldSpy: boolean = true;
  readonly shouldRest: boolean = false;
  readonly demoteInProgress: boolean = true;
  static readonly pluginName: string = "MessengerRelayerPlugin";
  readonly pluginName = MessengerRelayerPlugin.pluginName;

  constructor(
    readonly relayerConfig: CommonPluginEnv,
    readonly pluginConfig: MessengerRelayerPluginConfig,
    readonly logger: Logger
  ) {
    this.logger.info("Messenger relayer plugin loaded");
    // todo: config validation
  }

  async consumeEvent(
    vaa: Buffer,
    stagingArea: { counter?: number }
  ): Promise<{ workflowData?: VAA; nextStagingArea: StagingArea }> {
    this.logger.info("Got VAA");
    return {
      workflowData: vaa.toString("base64"),
      nextStagingArea: {
        counter: stagingArea?.counter ? stagingArea.counter + 1 : 0,
      },
    };
  }

  async handleWorkflow(
    workflow: Workflow<VAA>,
    providers: Providers,
    execute: ActionExecutor
  ): Promise<void> {
    this.logger.info("Handling workflow...");
    const vaa = Buffer.from(workflow.data, "base64");
    const parsed = await this.parseVAA(vaa);
    this.logger.info("Got message: " + Buffer.from(parsed.payload).toString("utf-8"));
    await Promise.all(
      this.pluginConfig.registeredContracts.map(async (registeredContract) => {
        if (registeredContract.chainId === parsed.emitter_chain) {
          // do not submit to emitting chain
          return;
        }
        if (whSdk.isEVMChain(registeredContract.chainId)) {
          await this.submitOnEVM(
            vaa,
            providers.evm[registeredContract.chainId],
            execute,
            registeredContract.contractAddress,
            registeredContract.chainId
          );
        } else if (registeredContract.chainId === whSdk.CHAIN_ID_SOLANA) {
          await this.submitOnSolana(
            vaa,
            providers.solana,
            execute,
            registeredContract.contractAddress,
            registeredContract.chainId
          );
        } else {
          throw new Error("Unsupported Chain: " + registeredContract.chainId);
        }
      })
    );
    this.logger.info("Message submitted to all chains!!");
  }

  async submitOnEVM(
    vaa: Buffer,
    provider: ethers.providers.Provider,
    execute: ActionExecutor,
    contractAddress: string,
    chainId: whSdk.ChainId
  ) {
    const messenger = new ethers.Contract(
      contractAddress,
      this.pluginConfig.messengerABI,
      provider
    );
    const tx = await execute.onEVM({
      chainId,
      f: async ({ wallet }) => {
        return messenger.connect(wallet).receiveEncodedMsg(vaa);
      },
    });
    await tx.wait();

    const message = await messenger.getCurrentMsg();
    this.logger.info(`Current message now '${message}' on chain ${chainId}`);
  }

  async submitOnSolana(
    vaa: Buffer,
    provider: SolanaConnection,
    execute: ActionExecutor,
    contractAddress: string,
    chainId: whSdk.ChainId
  ) {
    throw new Error("Exercise for the reader...");
  }

  getFilters(): ContractFilter[] {
    return this.pluginConfig.registeredContracts.map((rc) => ({
      chainId: rc.chainId,
      emitterAddress: rc.contractAddress,
    }));
  }

  async parseVAA(vaa: Buffer | Uint8Array): Promise<BaseVAA> {
    try {
      const { parse_vaa } = await whSdk.importCoreWasm();
      return parse_vaa(new Uint8Array(vaa)) as BaseVAA;
    } catch (e) {
      this.logger.error("Failed to parse vaa");
      throw e;
    }
  }
}

const factory: PluginFactory = {
  create,
  pluginName: MessengerRelayerPlugin.pluginName,
};

export default factory;
