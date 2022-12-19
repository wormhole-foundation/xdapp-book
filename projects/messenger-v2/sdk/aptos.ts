import {
  generateSignAndSubmitEntryFunction,
  hexToUint8Array,
} from "@certusone/wormhole-sdk";
import { 
  AptosAccount, 
  AptosClient, 
  Types,
} from "aptos";
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
  bridgeAddress = "";

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
    const sender = new AptosAccount(hexToUint8Array(privateKey));
    const payload:Types.EntryFunctionPayload = {
      function: `${this.coreMessages}::messenger::init_messenger`,
      type_arguments: [],
      arguments: [
        sender.address()
      ],
    };

    const tx = await generateSignAndSubmitEntryFunction(
      this.client,
      sender,
      payload
    );
    
    const res = await this.client.waitForTransactionWithResult(tx.hash);
    //console.log(JSON.stringify(res, null, 2));
    return res.hash;
  }

  public async getEmitterAddress(): Promise<string> {
    let resourceAccAddress = AptosAccount.getResourceAccountAddress(
      `${this.coreMessages}`,
      Buffer.from("messenger_state")
    );

    let state = await this.client.getAccountResource(
      resourceAccAddress,
      `${this.coreMessages}::messenger::State`
    );

    console.log(state);
    return Number((state.data as any).emitter_cap.emitter).toString(16).padStart(64, '0');
  }

  // Regster Network
  public registerNetwork(bridgeAddress:string, chainID: number, foreignAddress: Buffer | Uint8Array):Types.EntryFunctionPayload  {

    const payload = {
      function: `${this.coreMessages}::messenger::register_emitter`,
      type_arguments: [],
      arguments: [
        chainID, 
        Buffer.from(foreignAddress)
      ],
    }
    return payload;
  }

  // Emit Message
  public sendMessage(message:String) {
    const payload = {
      function: `${this.coreMessages}::messenger::send_message`,
      type_arguments: [],
      arguments: [
        Buffer.from(message)
      ],
    }
    return payload;
  }
  
  // Submit Message
  public submitMessage(message: string) {
    const payload = {
      function: `${this.coreMessages}::messenger::receive_message`,
      type_arguments: [],
      arguments: [
        Buffer.from(message, 'base64')
      ],
    }
    return payload;
  } 
  
  // Get Message
  public async getMessage() {
    let resourceAccAddress = AptosAccount.getResourceAccountAddress(
      `${this.coreMessages}`,
      Buffer.from("messenger_state")
    );

    let state = await this.client.getAccountResource(
      resourceAccAddress,
      `${this.coreMessages}::messenger::State`
    );
    return (state.data as any).current_message;
  }


}
