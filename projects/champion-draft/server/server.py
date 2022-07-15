from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS
import redis
import json
import asyncio
from listener import EVMListener, formatMessengerAddress
from web3 import Web3

app = Flask(__name__)
CORS(app)

f = open("../xdapp.config.json")
config = json.load(f)

abiPath = "../chains/evm/out/CoreGame.sol/CoreGame.json"
abiFile = open(abiPath)
abi = json.load(abiFile)["abi"]

redisConfig = config["server"]["redis"]
redisDatabase = redis.Redis(host=redisConfig["host"], port=redisConfig["port"])

chainListeners = {}

def setup(name):
    chainConfig = config["networks"][name]

    # Create contract
    provider = Web3(Web3.HTTPProvider(chainConfig["rpc"]))
    deployedAddress = Web3.toChecksumAddress(chainConfig["deployedAddress"])
    gameContract = provider.eth.contract(address=deployedAddress, abi=abi)

    # Create wormhole base url
    baseURL = config["wormhole"]["restAddress"]
    messengerAddress = gameContract.functions.getMessengerAddr().call()
    messengerAddress = formatMessengerAddress(messengerAddress)
    chainId = chainConfig["wormholeChainId"]
    wormholeURL = f"{baseURL}/v1/signed_vaa/{chainId}/{messengerAddress}/"

    listener = EVMListener(
        name,
        gameContract,
        redisDatabase,
        wormholeURL)

    chainListeners[name] = listener

setup("evm0")
setup("evm1")

@app.route("/healthz")
def healthz():
    return "<p>Server up and running!</p>"

@app.route("/champions")
def champions():
    chainName = request.args.get('chain')
    if chainName not in chainListeners:
        return jsonify([])
    
    return jsonify(chainListeners[chainName].getChampions())


@app.route("/championVaa")
def championVaa():
    chainName = request.args.get('chain')
    if chainName not in chainListeners:
        return jsonify([])
    championHash = request.args.get('champion')
    if championHash == "" or len(championHash) != 66:
        return jsonify("error: please include a 32 bit champion hash in the URL query prefixed with 0x"), 400
    if championHash[0:2] != "0x":
        return jsonify("error: please enter champion hash in hex prefixed with 0x"), 400
    
    return jsonify(chainListeners[chainName].getChampionVaa(championHash))

@app.route("/battles")
def battles():
    chainName = request.args.get('chain')
    championHash = request.args.get('champion')
    if championHash == "" or len(championHash) != 66:
        return jsonify("error: please include a 32 bit champion hash in the URL query prefixed with 0x"), 400
    if championHash[0:2] != "0x":
        return jsonify("error: please enter champion hash in hex prefixed with 0x"), 400

    if chainName not in chainListeners:
        return jsonify([])
    
    return jsonify(chainListeners[chainName].getBattles(championHash))

@app.route("/removebattle")
def removeBattle():
    chainName = request.args.get('chain')
    championHash = request.args.get('champion')
    if championHash == "" or len(championHash) != 66:
        return jsonify("error: please include a 32 bit champion hash in the URL query prefixed with 0x"), 400
    if championHash[0:2] != "0x":
        return jsonify("error: please enter champion hash in hex prefixed with 0x"), 400
    seq = request.args.get('seq')

    if chainName not in chainListeners:
        return jsonify([])
    
    return jsonify(chainListeners[chainName].removeBattle(championHash, seq))

@app.route("/votes")
def votes():
    chainName = request.args.get('chain')
    championHash = request.args.get('champion')
    if championHash == "" or len(championHash) != 66:
        return jsonify("error: please include a 32 bit champion hash in the URL query prefixed with 0x"), 400
    if championHash[0:2] != "0x":
        return jsonify("error: please enter champion hash in hex prefixed with 0x"), 400

    if chainName not in chainListeners:
        return jsonify([])
    
    return jsonify(chainListeners[chainName].getVotes(championHash))



@app.route("/metadataevm")
def metadataevm():
    id = request.args.get('id')

    print("metadata got", id)
    
    if id == "1":
        return jsonify({
            "name": "Ape #7116",
            "image": "https://img.seadn.io/files/30b22cc7be97ee48126dd1b6fd9647fe.png"
        })
    elif id == "0":
        return jsonify({
            "name": "Ape #7429",
            "image": "https://img.seadn.io/files/72b1af99df25c0482fd638471213dada.png"
        })



# @app.route("/removebattle")
# def removeBattle():
#     chainName = request.args.get('chain')
#     championHash = request.args.get('champion')
#     if championHash == "" or len(championHash) != 66:
#         return "error: please include a 32 bit champion hash in the URL query prefixed with 0x"
#     if championHash[0:2] != "0x":
#         return "error: please enter champion hash in hex prefixed with 0x"
#     seq = request.args.get('seq')

#     if chainName not in chainListeners:
#         return jsonify([])
    
#     return jsonify(chainListeners[chainName].removeBattle(championHash, seq))