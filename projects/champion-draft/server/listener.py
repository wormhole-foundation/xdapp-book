from web3 import Web3
import backoff
import urllib.request
import redis
import asyncio
import json
import threading
import nest_asyncio
nest_asyncio.apply()

class EVMListener:

    def __init__(self, name, gameContract, redisDatabase, wormholeURL):
        self.name = name

        self.gameContract = gameContract
        self.redisDatabase = redisDatabase
        self.wormholeURL = wormholeURL

        self.registerFilter = self.gameContract.events.championRegistered.createFilter(fromBlock='latest')
        self.outcomeFilter = self.gameContract.events.battleOutcome.createFilter(fromBlock='latest')

        loop = asyncio.get_event_loop()
        t = threading.Thread(target=self.startListen, args=(loop, ))
        t.start()
    
    def startListen(self, loop):
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(
                asyncio.gather(
                    self.listen(2)))
        finally:
            # close loop to free up system resources
            loop.close()

    async def listen(self, interval):
        while True:
            for championRegistered in self.registerFilter.get_new_entries():
                print(championRegistered)
                championHash = championRegistered.args.championHash
                self.redisDatabase.sadd(f"{self.name}-champions", hex(championHash))
                
                # find vaa
                # championObject = self.gameContract.functions.champions(championHash).call()
                # print(championObject)
                # vaaSeq = championObject[3]
                vaaSeq = championRegistered.args.vaa
                # TODO: Make this async
                vaa = self.fetchVaa(vaaSeq)
                self.redisDatabase.set(f"{self.name}-vaas-id-{hex(championHash)}", vaa)

            for battleOutcome in self.outcomeFilter.get_new_entries():
                print("new battle outcome event", battleOutcome)
                winner = hex(battleOutcome.args.winnerHash)
                loser = hex(battleOutcome.args.loserHash)
                vaa = battleOutcome.args.vaa
                self.redisDatabase.sadd(f"{self.name}-battles-{winner}", vaa)
                self.redisDatabase.sadd(f"{self.name}-battles-{loser}", vaa)
                self.redisDatabase.sadd(f"{self.name}-votes-{winner}", vaa)
                self.redisDatabase.sadd(f"{self.name}-votes-{loser}", vaa)
            await asyncio.sleep(interval)

    @backoff.on_exception(backoff.expo,
                      urllib.error.HTTPError,
                      max_time=60)
    def fetchVaa(self, vaaSeq):
        url = self.wormholeURL + str(vaaSeq)
        print("reading from", url)
        contents = json.loads(urllib.request.urlopen(url).read().decode())
        print("contents", contents)
        return contents["vaaBytes"]

    def getChampions(self):
        print(self.redisDatabase.smembers(f"{self.name}-champions"))
        return list(map(lambda x: x.decode('utf-8'), self.redisDatabase.smembers(f"{self.name}-champions")))
    
    def getChampionVaa(self, championHash):
        return self.redisDatabase.get(f"{self.name}-vaas-id-{championHash}").decode('utf-8')

    def getBattles(self, championHash):
        return list(map(lambda x: x.decode('utf-8'), self.redisDatabase.smembers(f"{self.name}-battles-{championHash}")))
    
    def removeBattle(self, championHash, seq):
        self.redisDatabase.srem(f"{self.name}-battles-{championHash}", seq)

    def getVotes(self, championHash):
        return list(map(lambda x: x.decode('utf-8'), self.redisDatabase.smembers(f"{self.name}-votes-{championHash}")))
    
    def removeVote(self, championHash, seq):
        self.redisDatabase.srem(f"{self.name}-votes-{championHash}", seq)

def formatMessengerAddress(address):
    address = address[2:]
    return address.zfill(64)

def destroyRedis(r):
    r.flushdb()

if __name__ == "__main__":
    # Load configs
    f = open("../xdapp.config.json")
    config = json.load(f)
    abiPath = "../chains/evm/out/CoreGame.sol/CoreGame.json"
    abiFile = open(abiPath)
    abi = json.load(abiFile)["abi"]
    evm0 = config["networks"]["evm0"]

    # Create contract
    provider = Web3(Web3.HTTPProvider(evm0["rpc"]))
    deployedAddress = Web3.toChecksumAddress(evm0["deployedAddress"])
    gameContract = provider.eth.contract(address=deployedAddress, abi=abi)

    # Create redis
    r = redis.Redis(host='localhost', port=6379)

    # Create wormhole base url
    baseURL = config["wormhole"]["restAddress"]
    messengerAddress = gameContract.functions.getMessengerAddr().call()
    messengerAddress = formatMessengerAddress(messengerAddress)
    evm0ChainId = evm0["wormholeChainId"]
    wormholeURL = f"{baseURL}/v1/signed_vaa/{evm0ChainId}/{messengerAddress}/"
    
    listener = EVMListener(
        "evm0-test",
        gameContract,
        r,
        wormholeURL
        )

    nonce = provider.eth.get_transaction_count('0x5ce9454909639D2D17A3F753ce7d93fa0b9aB12E')
    
    register_txn = gameContract.functions.registerNFT(
        '0xaf5C4C6C7920B4883bC6252e9d9B8fE27187Cf68',
        0,
    ).buildTransaction({
        'gas': 70000,
        'gasPrice': provider.toWei('1', 'gwei'),
        # 'from': adress,
        'nonce': nonce
    }) 

    print(register_txn)

    signed_register = provider.eth.account.sign_transaction(register_txn, private_key=evm0["privateKey"])

    tx_hash = provider.eth.send_raw_transaction(signed_register.rawTransaction)
    tx_receipt = provider.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Transaction successful with hash: { tx_receipt.transactionHash.hex() }")

    print(listener.getChampions())
    