import fs from 'fs';
import ethers from 'ethers';
import { promisify } from "util";
const exec = promisify(require("child_process").exec);

export class EVMMessenger{
    rpc:string;
    coreBridge:string;
    deployedAddress: string;

    constructor(nodeUrl:string, wormholeCoreBridge:string, deployedAddress?:string) {
        this.rpc = nodeUrl;
        this.coreBridge = wormholeCoreBridge;
        this.deployedAddress = deployedAddress as string;
    }

    public async deploy(networkName:string, privateKey:string) {
        let cmd = `cd chains/evm && forge build && forge create --legacy --rpc-url ${this.rpc} --private-key ${privateKey} src/Messenger.sol:Messenger --constructor-args ${this.coreBridge} && exit`;
        const { stdout, stderr } = await exec(cmd);
        console.log(stdout);

        const deploymentAddress = stdout
                                    .split("Deployed to: ")[1]
                                    .split("\n")[0]
                                    .trim();
    
        let config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());
        config.networks[networkName].deployedAddress = deploymentAddress;
        fs.writeFileSync('./xdapp.config.json', JSON.stringify(config, null, 2));       
        this.deployedAddress = deploymentAddress;
    }

    public getContract(): ethers.Contract {
        const messenger = new ethers.Contract(
            this.deployedAddress,
            JSON.parse(
                fs.readFileSync("./chains/evm/out/Messenger.sol/Messenger.json").toString()
            ).abi,    
        )

        // let tx = messenger.registerApplicationContracts(
        //     chainID,
        //     foreignAddress
        // );    
       
        return messenger;
    } 
}

/**
    const signer = new ethers.Wallet(srcNetwork.privateKey).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );
    const messenger = new ethers.Contract(
        srcDeploymentInfo.address,
        JSON.parse(
            fs
                .readFileSync(
                    "./chains/evm/out/Messenger.sol/Messenger.json"
                )
                .toString()
        ).abi,
        signer
    );
    const tx = await messenger.registerApplicationContracts(
        targetNetwork.wormholeChainId,
        emitterBuffer
    ); */
