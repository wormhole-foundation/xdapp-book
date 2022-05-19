#!/usr/bin/python3
"""
Copyright 2022 Wormhole Project Contributors

Licensed under the Apache License, Version 2.0 (the "License");

you may not use this file except in compliance with the License.

You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

"""

from algosdk import account, mnemonic, abi
from algosdk.encoding import decode_address, encode_address
from algosdk.future import transaction
from algosdk.logic import get_application_address
from algosdk.v2client.algod import AlgodClient
from base64 import b64decode
from pyteal.ast import *
from pyteal.compiler import *
from pyteal.ir import  *
from pyteal.types import *
from typing import List, Tuple, Dict, Any, Optional, Union
import pprint
import sys

class PendingTxnResponse:
    def __init__(self, response: Dict[str, Any]) -> None:
        self.poolError: str = response["pool-error"]
        self.txn: Dict[str, Any] = response["txn"]

        self.applicationIndex: Optional[int] = response.get("application-index")
        self.assetIndex: Optional[int] = response.get("asset-index")
        self.closeRewards: Optional[int] = response.get("close-rewards")
        self.closingAmount: Optional[int] = response.get("closing-amount")
        self.confirmedRound: Optional[int] = response.get("confirmed-round")
        self.globalStateDelta: Optional[Any] = response.get("global-state-delta")
        self.localStateDelta: Optional[Any] = response.get("local-state-delta")
        self.receiverRewards: Optional[int] = response.get("receiver-rewards")
        self.senderRewards: Optional[int] = response.get("sender-rewards")

        self.innerTxns: List[Any] = response.get("inner-txns", [])
        self.logs: List[bytes] = [b64decode(l) for l in response.get("logs", [])]

class Account:
    """Represents a private key and address for an Algorand account"""

    def __init__(self, privateKey: str) -> None:
        self.sk = privateKey
        self.addr = account.address_from_private_key(privateKey)
        print (privateKey)
        print ("    " + self.getMnemonic())
        print ("    " + self.addr)

    def getAddress(self) -> str:
        return self.addr

    def getPrivateKey(self) -> str:
        return self.sk

    def getMnemonic(self) -> str:
        return mnemonic.from_private_key(self.sk)

    @classmethod
    def FromMnemonic(cls, m: str) -> "Account":
        return cls(mnemonic.to_private_key(m))


def fullyCompileContract(client: AlgodClient, contract: Expr) -> bytes:
    teal = compileTeal(contract, mode=Mode.Application, version=6)
    response = client.compile(teal)
    return response

def clear_app():
    return Int(1)

devMode = True

def approve_app():
    me = Global.current_application_address()

    # This bit of magic causes the line number of the assert to show
    # up in the small bit of info shown when an assert trips.  This
    # tells you the actual line number of the assert that caused the
    # txn to fail.
    def MagicAssert(a) -> Expr:
        if devMode:
            from inspect import currentframe
            return Assert(And(a, Int(currentframe().f_back.f_lineno)))
        else:
            return Assert(a)

    # potential badness
    def assert_common_checks(e) -> Expr:
        return MagicAssert(And(
            e.rekey_to() == Global.zero_address(),
            e.close_remainder_to() == Global.zero_address(),
            e.asset_close_to() == Global.zero_address()
        ))

    def sendMessage():
        return Seq(
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields(
                {
                    TxnField.type_enum: TxnType.ApplicationCall,
                    TxnField.application_id: App.globalGet(Bytes("coreid")),
                    TxnField.application_args: [Bytes("publishMessage"), Txn.application_args[1], Itob(Int(0))],
                    TxnField.accounts: [Txn.accounts[1]],
                    TxnField.note: Bytes("publishMessage"),
                    TxnField.fee: Int(0),
                }
            ),
            InnerTxnBuilder.Submit(),
            # It is the way...
            Approve()
        )

    @Subroutine(TealType.uint64)
    def checkedGet(v) -> Expr:
        maybe = App.globalGetEx(Txn.application_id(), v)
        # If we assert here, it means we have not registered the emitter
        return Seq(maybe, MagicAssert(maybe.hasValue()), maybe.value())
        
    def receiveMessage():
        off = ScratchVar()
        emitter = ScratchVar()
        sequence = ScratchVar()
        tidx = ScratchVar()

        return Seq([
            # First, lets make sure we are looking at the correct vaa version...
            MagicAssert(Btoi(Extract(Txn.application_args[1], Int(0), Int(1))) == Int(1)),

            # From the vaa, I will grab the emitter and sequence number
            off.store(Btoi(Extract(Txn.application_args[1], Int(5), Int(1))) * Int(66) + Int(14)), # The offset of the chain/emitter
            emitter.store(Extract(Txn.application_args[1], off.load(), Int(34))),
            sequence.store(Btoi(Extract(Txn.application_args[1], off.load() + Int(34), Int(8)))),

            # Should be going up and never repeating.. If you want
            # something that can take messages in any order, look at
            # checkForDuplicate() in the token_bridge contract.  It is
            # kind of a heavy lift but it can be done
            MagicAssert(sequence.load() > checkedGet(emitter.load())),
            App.globalPut(emitter.load(), sequence.load()),

            # Now lets check to see if this vaa was actually signed by
            # the guardians.  We do this by confirming that the
            # previous txn in the group was to the wormhole core and
            # against the verifyVAA method.  If that passed, then the
            # vaa must be legit
            MagicAssert(Txn.group_index() > Int(0)),
            tidx.store(Txn.group_index() - Int(1)),
            MagicAssert(And(
                # Lets see if the vaa we are about to process was actually verified by the core
                Gtxn[tidx.load()].type_enum() == TxnType.ApplicationCall,
                Gtxn[tidx.load()].application_id() == App.globalGet(Bytes("coreid")),
                Gtxn[tidx.load()].application_args[0] == Bytes("verifyVAA"),
                Gtxn[tidx.load()].sender() == Txn.sender(),

                # we are all taking about the same vaa?
                Gtxn[tidx.load()].application_args[1] == Txn.application_args[1],

                # We all opted into the same accounts?
                Gtxn[tidx.load()].accounts[0] == Txn.accounts[0],
                Gtxn[tidx.load()].accounts[1] == Txn.accounts[1],
                Gtxn[tidx.load()].accounts[2] == Txn.accounts[2],
                )),

            # check for hackery
            assert_common_checks(Gtxn[tidx.load()]),
            assert_common_checks(Txn),

            # ... boiler plate is done... 
            # What is the offset into the vaa of the actual payload?
            off.store(Btoi(Extract(Txn.application_args[1], Int(5), Int(1))) * Int(66) + Int(57)), 

            # Lets extract it and log it...
            MagicAssert(Len(Txn.application_args[1]) > off.load()),

            Log(Extract(Txn.application_args[1], off.load(), Len(Txn.application_args[1]) - off.load())),

            # It is the way...
            Approve()
        ])

    # You could wrap your governance in a vaa from a trusted
    # governance emitter.  For the purposes of this demo, we are
    # skipping that.  Again, you could look at the core contract or
    # the portal contract in wormhole to see examples of doing
    # governance with vaa's.

    def registerEmitter():
        return Seq([

            # The chain comes in as 8 bytes, we will take the last two bytes, append the emitter to it, and set it to zero
            App.globalPut(Concat(Txn.application_args[2], Txn.application_args[1]), Int(0)),

            # It is the way...
            Approve()
        ])

    METHOD = Txn.application_args[0]

    router = Cond(
        [METHOD == Bytes("registerEmitter"), registerEmitter()],
        [METHOD == Bytes("receiveMessage"), receiveMessage()],
        [METHOD == Bytes("sendMessage"), sendMessage()],
    )

    on_create = Seq( [
        App.globalPut(Bytes("coreid"), Btoi(Txn.application_args[0])),
        Return(Int(1))
    ])

    on_update = Seq( [
        Return(Int(0))
    ] )

    on_delete = Seq( [
        Return(Int(0))
    ] )

    on_optin = Seq( [
        Return(Int(1))
    ] )

    return Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.UpdateApplication, on_update],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete],
        [Txn.on_completion() == OnComplete.OptIn, on_optin],
        [Txn.on_completion() == OnComplete.NoOp, router]
    )

def get_test_app(client: AlgodClient) -> Tuple[bytes, bytes]:
    APPROVAL_PROGRAM = fullyCompileContract(client, approve_app())
    CLEAR_STATE_PROGRAM = fullyCompileContract(client, clear_app())

    return APPROVAL_PROGRAM, CLEAR_STATE_PROGRAM

def waitForTransaction(
        client: AlgodClient, txID: str, timeout: int = 10
) -> PendingTxnResponse:
    lastStatus = client.status()
    lastRound = lastStatus["last-round"]
    startRound = lastRound
    
    while lastRound < startRound + timeout:
        pending_txn = client.pending_transaction_info(txID)
    
        if pending_txn.get("confirmed-round", 0) > 0:
            return PendingTxnResponse(pending_txn)
    
        if pending_txn["pool-error"]:
            raise Exception("Pool error: {}".format(pending_txn["pool-error"]))
    
        lastStatus = client.status_after_block(lastRound + 1)
    
        lastRound += 1
    
    raise Exception(
        "Transaction {} not confirmed after {} rounds".format(txID, timeout)
    )


if __name__ == "__main__":
    #algod_address = "https://testnet-api.algonode.cloud"
    #algod_address = "https://mainnet-api.algonode.cloud"
    algod_address = sys.argv[3]
    algod_token="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

    client = AlgodClient(algod_token, algod_address)

    approval, clear = get_test_app(client)

    globalSchema = transaction.StateSchema(num_uints=2, num_byte_slices=40)
    # localSchema is IMPORTANT.. you need 16 byte slices
    localSchema = transaction.StateSchema(num_uints=0, num_byte_slices=16) 
        
    sender = Account.FromMnemonic(sys.argv[2])

    coreid = int(sys.argv[1])

    txn = transaction.ApplicationCreateTxn(
            sender=sender.getAddress(),
            on_complete=transaction.OnComplete.NoOpOC,
            approval_program=b64decode(approval["result"]),
            clear_program=b64decode(clear["result"]),
            global_schema=globalSchema,
            local_schema=localSchema,
            sp=client.suggested_params(),
            app_args = [coreid]
    )
        
    signedTxn = txn.sign(sender.getPrivateKey())
        
    print("creating app")
    client.send_transaction(signedTxn)
        
    response = waitForTransaction(client, signedTxn.get_txid())

    messenger=response.applicationIndex

    #print("done.. Handing it some money")
    txn = transaction.PaymentTxn(sender = sender.getAddress(), sp = client.suggested_params(), receiver = get_application_address(response.applicationIndex), amt = 100000)
    signedTxn = txn.sign(sender.getPrivateKey())
    client.send_transaction(signedTxn)

    #pprint.pprint({"testapp": str(testapp), "address": get_application_address(testapp), "emitterAddress": decode_address(get_application_address(testapp)).hex()})
    print("App ID:", messenger)
    print("Address: ", get_application_address(messenger))
