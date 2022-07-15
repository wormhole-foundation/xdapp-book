import { readFileSync } from "fs";
import { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BattleSummary from "../components/battleSummary";
import { useWeb3Provider } from "../util/hooks";
import * as ethers from "ethers";
import { Config, Network } from ".";
import { getUsersNetworkIdentifier } from "../util/chainConnection";

export const getStaticProps: GetStaticProps = async () => {
  let config = JSON.parse(
    readFileSync("../xdapp.config.json").toString()
  ) as Config;

  let networks = config.networks;

  let abi = JSON.parse(
    readFileSync("../chains/evm/out/CoreGame.sol/CoreGame.json").toString()
  ).abi;
  console.log(abi);

  return {
    props: {
      networks: networks,
      abi,
    },
  };
};

export type BattleInfo = {
  battleEvents: ethers.Event[];
  battleOutcome: ethers.Event[];
};

type BattleProps = {
  networks: Record<string, Network>;
  abi: any;
};

const Battle: NextPage<BattleProps> = ({ networks, abi }) => {
  const router = useRouter();
  const params = router.query;
  const championHash = params.hash;
  const opponentVaa = params.vaa;
  const provider = useWeb3Provider();

  // figure out which chain the user is connecting from
  const [usersNetwork, setUsersNetwork] = useState<Network | null>(null);
  const getUsersNetwork = async (provider: ethers.providers.Web3Provider) => {
    let identifier = await getUsersNetworkIdentifier(provider);
    console.log("Connecting from ", identifier);
    setUsersNetwork(networks[identifier]);
  };
  useEffect(() => {
    if (provider === undefined) {
      return;
    }
    getUsersNetwork(provider);
  }, [provider]);

  console.log(params);

  const [battleInfo, setBattleInfo] = useState<BattleInfo | null>(null);
  const [battleStarted, setBattleStarted] = useState<boolean>(false);

  const startBattle = async (
    network: Network,
    provider: ethers.providers.Web3Provider
  ) => {
    console.log("Starting battle");
    let contract = new ethers.Contract(
      network.deployedAddress,
      abi,
      provider.getSigner()
    );
    let vaaAsBytes = Buffer.from(opponentVaa, "base64");
    console.log("vaaAsBytes", vaaAsBytes);
    console.log(championHash);
    console.log("b10 hash", ethers.BigNumber.from(championHash).toString());
    let tx = await contract.crossChainBattle(championHash, vaaAsBytes);
    console.log("tx", tx);
    let receipt = await tx.wait();
    console.log("receipt", receipt);

    const battleEvents = receipt.events.filter(
      (event) => event.event === "battleEvent"
    );
    const battleOutcome = receipt.events.find(
      (event) => event.event === "battleOutcome"
    );
    console.log({ battleEvents, battleOutcome });
    setBattleInfo({ battleEvents, battleOutcome });
  };

  useEffect(() => {
    console.log("inside");
    if (battleStarted) {
      return;
    }
    if (provider === undefined) {
      console.log("provider null");
      return;
    }
    if (usersNetwork === null) {
      console.log("network; null");
      return;
    }
    startBattle(usersNetwork, provider).catch((e) => {
      console.log(e);
      if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      else window.alert("Battle failed for unknown reason.");
      router.back();
    });

    setBattleStarted(true);
  }, [usersNetwork]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      {battleInfo === null ? (
        "Fighting..."
      ) : (
        <>
          <BattleSummary battleInfo={battleInfo} />
          <button className="btn btn-blue" onClick={() => router.back()}>
            Back
          </button>
        </>
      )}
    </div>
  );
};

export default Battle;
