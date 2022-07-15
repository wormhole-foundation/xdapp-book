import * as ethers from "ethers";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Network } from "../pages";

type ChampionUpgradeProps = {
  provider: ethers.providers.Web3Provider;
  network: Network;
  abi: any;
  hash: string | null;
  playerKind: string;
};

const ChampionUpgrade = ({
  provider,
  network,
  abi,
  hash,
  playerKind,
}: ChampionUpgradeProps) => {
  const [upgrades, setUpgrades] = useState<number[]>([]);
  const [upgradePoints, setUpgradePoints] = useState(0);
  const upgradeNames = [
    "Attack + 5",
    "Defense + 2",
    "Speed + 5",
    "Crit Rate + 8%",
  ];
  const [disabled, setDisabled] = useState(true);
  const [audienceVotes, setAudienceVotes] = useState(0);

  const contract = useMemo(
    () =>
      new ethers.Contract(network.deployedAddress, abi, provider.getSigner()),
    [network]
  );

  useEffect(() => {
    if (hash == null) {
      return;
    }
    getUpgrades(hash);
  }, [hash]);

  const getUpgradePoints = async (hash: string) => {
    const champion = await contract.champions(hash);
    setUpgradePoints(champion.stats.upgradePoints);
    if (champion.stats.upgradePoints > 0) {
      setDisabled(false);
    }
  };

  const getUpgrades = async (hash: string) => {
    await getUpgradePoints(hash);
    if (playerKind == "audience") {
      await getVotes();
    }
    const up = await contract.getUpgrades(hash);
    const allUpgrades = [];
    for (let i = 0; i < 4; i++) {
      if ((up >> (3 - i)) & 1) {
        allUpgrades.push(i);
      }
    }
    setUpgrades(allUpgrades);
  };

  const router = useRouter();

  const onUpgrade = async (choice: number) => {
    setDisabled(true);
    try {
      await (await contract.upgrade(hash, choice + 1)).wait();
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      else window.alert("Upgrade failed for unknown reason.");
    }
    try {
      await getUpgradePoints(hash);
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      else window.alert("Upgrade failed for unknown reason.");
    }

    router.reload();
  };

  const onOptIn = () => {
    contract
      .optIn(hash)
      .then((blockFinalize) => {
        blockFinalize.wait().then(() => {
          router.reload();
        });
      })
      .catch((e) => {
        console.log(e);
        if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      });
  };

  const onVote = async (choice: number) => {
    setDisabled(true);
    try {
      await (await contract.audienceSubmitVote(choice + 1)).wait();
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      else window.alert("Vote failed for unknown reason");
      setDisabled(false);
    }
    try {
      await getVotes();
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      else window.alert("Unable to get your votes");
    }
    router.reload();
  };

  const getVotes = async () => {
    if (playerKind == "audience") {
      const member = await contract.audience(provider.getSigner().getAddress());
      setAudienceVotes(member.points);
      if (member.points != 0) {
        setDisabled(false);
      }
    }
  };

  if (hash == null) {
    return <></>;
  }

  return (
    <>
      <div className="overflow-hidden rounded shadow-lg">
        <div className="px-6 py-4">
          <div className="font-bold text-l">
            {playerKind == "fighter"
              ? `Upgrade points remaining: ${upgradePoints}`
              : `Votes remaining: ${audienceVotes}`}
          </div>
          <p className="mt-3 text-center text-gray-700 grid grid-cols-2 gap-5">
            {upgrades.map((up) => {
              return (
                <button
                  className={
                    disabled
                      ? "bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
                      : "btn btn-blue"
                  }
                  disabled={disabled}
                  onClick={() => {
                    if (playerKind == "fighter") onUpgrade(up);
                    else onVote(up);
                  }}
                >
                  {upgradeNames[up]}
                </button>
              );
            })}
            {playerKind == "fighter" && (
              <button
                className={
                  false
                    ? "col-span-2 bg-green-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
                    : "col-span-2 bg-green-500 text-white font-bold py-2 px-4 rounded"
                }
                disabled={false}
                onClick={() => onOptIn()}
              >
                Opt In for Next Round
              </button>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChampionUpgrade;
