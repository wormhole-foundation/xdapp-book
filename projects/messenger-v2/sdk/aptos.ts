import { AptosAccount, AptosClient, TransactionBuilder, TransactionBuilderRemoteABI, TxnBuilderTypes, Types } from "aptos";
import { promisify } from "util";
const exec = promisify(require('child_process').exec);

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
    
    constructor (nodeUrl: string, coreMessages: string) {
        this.client = new AptosClient(nodeUrl);
        this.coreMessages = coreMessages;
    }

    /**
     * Compiles and publishes the Messenger code 
     */
    public async deploy(privateKey: string): Promise<string> {
        let cmd = `cd chains/aptos && aptos move compile && aptos move publish --private-key ${privateKey} --url ${this.client.nodeUrl} --assume-yes`
        const {stdout, stderr} =  await exec(cmd);

        console.log("Initalizing Aptos Messenger module...");
        // Initialize the module to register it's emitter capability
        const sender = new AptosAccount(Buffer.from(privateKey, 'hex'));

        const txBuilder = new TransactionBuilderRemoteABI(this.client, { sender: sender.address() })
        const payload = await txBuilder.build(
            `${this.coreMessages}::messenger::init_messenger`,
            [],
            []
        );

        const rawTx = await this.client.generateRawTransaction(sender.address(), payload);
        console.log("Raw TX Created.");
        const transactionRes = await this.client.generateSignSubmitTransaction(sender, rawTx);

        return transactionRes;
    }
}