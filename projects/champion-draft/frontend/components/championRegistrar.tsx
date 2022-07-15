import * as ethers from "ethers";
import { useEffect, useState } from "react";
import { Network } from "../pages";
import * as storage from "../util/storage";
import ChampionCard from "./championCard";
import MetamaskButton from "./metamaskButton";
import TokenSelector from "./tokenSelector";

type ChampionRegistrarProps = {
  provider: ethers.providers.Web3Provider;
  network: Network;
  abi: any;
  championHash: string | null;
  setChampionHash: (_: string | null) => void;
  playerKind: string;
};

const ChampionRegistrar = ({
  provider,
  network,
  abi,
  championHash,
  setChampionHash,
  playerKind,
}: ChampionRegistrarProps) => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [championData, setChampionData] = useState<any | null>(null);

  const getChampionData = async () => {
    const contract = new ethers.Contract(
      network.deployedAddress,
      abi,
      provider.getSigner()
    );
    const champion = await contract.champions(championHash);
    console.log("getting champion data", champion);
    setChampionData(champion);
  };

  useEffect(() => {
    if (championHash === null) {
      return;
    }

    getChampionData();
  }, [championHash]);

  // set up listener to read championHash from storage and writeback when component unloads
  useEffect(() => {
    if (playerKind == "fighter") {
      if (championHash === null) {
        const result = storage.fetchChampionHash();
        if (result !== null) {
          setChampionHash(result);
        }
      } else {
        storage.saveChampionHash(championHash);
      }
    } else {
      if (championHash === null) {
        const result = storage.fetchDraftHash();
        if (result !== null) {
          setChampionHash(result);
        }
      } else {
        storage.saveDraftHash(championHash);
      }
    }
  }, [championHash]);

  return (
    <div className="">
      {championData !== null ? (
        <div className="flex flex-col justify-center">
          <ChampionCard champion={championData} isSelf={true} vaa="" />
          <button
            className="px-4 py-2 font-bold text-white bg-gray-500 rounded"
            onClick={() => {
              storage.removeChampionHash();
              storage.removeDraftHash();
              location.reload();
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-between w-64 px-4 py-8 rounded shadow-inner h-96 bg-neutral-300">
            <p className="text-center">
              {playerKind == "fighter"
                ? `You haven't registered a champion 😔`
                : `You haven't connected your wallet.`}
            </p>
            <p className="text-center">Want to change that?</p>
            <div className="flex items-center h-1/2">
              {walletConnected ? (
                <>
                  {playerKind == "fighter" && (
                    <TokenSelector
                      provider={provider}
                      abi={abi}
                      network={network}
                      setChampionHash={setChampionHash}
                    />
                  )}
                </>
              ) : (
                <MetamaskButton
                  setConnected={(b) => setWalletConnected(b)}
                  provider={provider}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChampionRegistrar;
