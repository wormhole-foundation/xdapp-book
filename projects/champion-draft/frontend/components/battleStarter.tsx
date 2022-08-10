import * as ethers from "ethers";
import { useEffect, useState } from "react";
import { Network } from "../pages";
import BattleSummary from "./battleSummary";

type BattleStarterProps = {
  provider: ethers.providers.Web3Provider;
  contract: ethers.Contract;
  network: Network;
  abi: any;
};


export type BattleInfo = {
  battleEvents: ethers.Event[];
  battleOutcome: ethers.Event[];
};

const BattleStarter = ({
  provider,
  contract,
  network,
  abi,
}: BattleStarterProps) => {
  const [opponentVaa, setOpponentVaa] = useState<string>("");
  const [championHash, setChamptionHash] = useState<string>("");
  const [battleInfo, setBattleInfo] = useState<BattleInfo | null>(null);

  useEffect(() => {
    const listener = (event) => {
      console.log("Battle Event: ", event);
    };

    contract.on("battleEvent", listener);
    return () => {
      contract.off("battleEvent", listener);
    };
  }, []);

  useEffect(() => {
    const listener = (event) => {
      console.log("Battle Outcome: ", event);
    };

    contract.on("battleOutcome", listener);
    return () => {
      contract.off("battleOutcome", listener);
    };
  }, []);

  const startBattle = async () => {
    let contract = new ethers.Contract(
      network.deployedAddress,
      abi,
      provider.getSigner()
    );
    let vaaAsBytes = Buffer.from(opponentVaa, "base64");
    let tx = await contract.crossChainBattle(championHash, vaaAsBytes);
    let receipt = await tx.wait();

    const battleEvents = receipt.events.filter(event => event.event === "battleEvent");
    const battleOutcome = receipt.events.find(event => event.event === "battleOutcome");
    setBattleInfo({battleEvents, battleOutcome});
  };

  return (
    <div className="flex flex-col items-center p-6 m-6 border w-5/6">
      Arena:
      <br />
      Opponent vaa:
      <input
        type="text"
        className="w-full m-6 border"
        value={opponentVaa}
        onChange={(e) => setOpponentVaa(e.currentTarget.value)}
      />
      My champion hash:
      <input
        type="text"
        className="w-full m-6 border"
        value={championHash}
        onChange={(e) => setChamptionHash(e.currentTarget.value)}
      />
      <button className="btn btn-blue" onClick={() => startBattle()}>
        Start Battle
      </button>
      {battleInfo !== null && <BattleSummary battleInfo={battleInfo} />}
    </div>
  );
};

export default BattleStarter;
