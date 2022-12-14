import {
  generateSignAndSubmitEntryFunction,
  hexToUint8Array,
} from "@certusone/wormhole-sdk";
import { AptosAccount, AptosClient } from "aptos";
import { promisify } from "util";
const exec = promisify(require("child_process").exec);

/**
 * Creates and returns transactions to be submitted by clients
 */
export class AptosMessenger {
  client: AptosClient;
  customOpts = {
    gas_unit_price: "100",
    max_gas_amount: "30000",
  };
  coreMessages = "";

  constructor(nodeUrl: string, coreMessages: string) {
    this.client = new AptosClient(nodeUrl);
    this.coreMessages = coreMessages;
  }

  /**
   * Compiles and publishes the Messenger code
   */
  public async deploy(privateKey: string): Promise<string> {
    let cmd = `cd chains/aptos && aptos move compile --save-metadata && aptos move publish --private-key ${privateKey} --url ${this.client.nodeUrl} --assume-yes`;
    const { stdout, stderr } = await exec(cmd);

    console.log("Initalizing Aptos Messenger module...");
    // Initialize the module to register its emitter capability
    const APTOS_NODE_URL = "http://localhost:8080/";
    const client = new AptosClient(APTOS_NODE_URL);
    const sender = new AptosAccount(hexToUint8Array(privateKey));

    const payload = {
      function: `${this.coreMessages}::messenger::init_messenger`,
      type_arguments: [],
      arguments: [],
    };
    const tx = await generateSignAndSubmitEntryFunction(
      client,
      sender,
      payload
    );
    const res = await client.waitForTransactionWithResult(tx.hash);
    console.log(JSON.stringify(res, null, 2));
    return res.hash;
  }
}
