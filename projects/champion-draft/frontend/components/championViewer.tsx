import * as ethers from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Network } from "../pages";
import ChainSelector from "./chainSelector";
import ChampionCard from "./championCard";

type ChampionViewerProps = {
  // the ethers provider that allows us to call contracts on chain
  provider: ethers.providers.Web3Provider;
  // the list of networks that this cross-chain app is running on
  networks: Record<string, Network>;
  // the abi for the EVM CoreGame contract
  abi: string;
  serverBaseURL: string;
  hash: null | string;
  // the callback to fire when the user chooses to start a battle
  buttonOnClick: (opponentVaa: string, championHash: string) => void;
  buttonText: string;
};

const ChampionViewer = ({
  networks,
  provider,
  abi,
  serverBaseURL,
  hash,
  buttonOnClick,
  buttonText,
}: ChampionViewerProps) => {
  const [champions, setChampions] = useState<object[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(
    networks[Object.keys(networks)[0]]
  );
  const [selectedNetworkName, setSelectedNetworkName] = useState<string>(
    Object.keys(networks)[0]
  );
  const [lastChampionIdx, setLastChampionIdx] = useState(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const contract = useMemo(
    () =>
      new ethers.Contract(
        selectedNetwork.deployedAddress,
        abi,
        new ethers.providers.JsonRpcProvider(selectedNetwork.rpc)
      ),
    [selectedNetwork]
  );

  // parses an emitted findVAA event into a `VaaInfo`
  const getChampion = async (hash: string): Promise<object> => {
    const champion = await contract.champions(hash);
    return champion;
  };

  // query all pre-existing findVAA events and load them into state
  const fetchChampions = async () => {
    setIsLoading(true);

    let url = new URL(serverBaseURL + "champions");
    url.searchParams.append("chain", selectedNetworkName);

    const res = await fetch(url.toString());

    if (res.status == 200) {
      let data = await res.json();
      const championInfos = await Promise.all(data.map(getChampion));

      setChampions(championInfos);
    }
    setIsLoading(false);
  };

  // when this component loads, we need to fetch the initial (pre-existing) set of champions
  useEffect(() => {
    fetchChampions();
  }, [contract]);

  return (
    <div className="flex flex-col items-center p-4 m-8">
      <ChainSelector
        selectedNetworkName={selectedNetworkName}
        setNetwork={(key: string) => {
          setSelectedNetwork(networks[key]);
          setSelectedNetworkName(key);
        }}
        networks={networks}
      />
      <div className="mt-9 grid grid-cols-3 gap-4">
        {isLoading
          ? "Loading..."
          : champions.map(
              (championData) =>
                championData.championHash != 0 &&
                (hash === null ||
                  championData.championHash.toHexString() !== hash) && (
                  <ChampionCard
                    champion={championData}
                    serverBaseURL={serverBaseURL}
                    networkName={selectedNetworkName}
                    isSelf={false}
                    buttonOnClick={buttonOnClick}
                    buttonText={buttonText}
                  />
                )
            )}
      </div>
    </div>
  );
};

export default ChampionViewer;
