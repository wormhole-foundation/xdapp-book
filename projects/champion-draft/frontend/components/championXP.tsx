import * as ethers from "ethers";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Network } from "../pages";

type ChampionXPProps = {
  contract: ethers.Contract;
  usersNetwork: Network;
  serverBaseURL: string;
  userNetworkName: string;
  hash: string | null;
  playerKind: string;
};

const ChampionXP = ({
  contract,
  usersNetwork,
  serverBaseURL,
  userNetworkName,
  hash,
  playerKind,
}: ChampionXPProps) => {
  if (!contract || !hash || !playerKind) return <></>;

  const [battleVAAs, setBattleVAAs] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [voteVAAs, setVoteVAAs] = useState<string[]>([]);

  useEffect(() => {
    if (hash == null) {
      return;
    }
    if (playerKind == "fighter") getXP(hash);
    else getVotes(hash);
  }, [hash, playerKind]);

  const getXP = async (hash: string) => {
    setIsLoading(true);
    let url = new URL(serverBaseURL + "battles");
    url.searchParams.append("chain", userNetworkName);
    url.searchParams.append("champion", hash);

    const res = await fetch(url.toString());
    if (res.status == 200) {
      let data = await res.json();
      setBattleVAAs(data);
    }
    setIsLoading(false);
  };

  const getVotes = async (hash: string) => {
    setIsLoading(true);
    let url = new URL(serverBaseURL + "votes");
    url.searchParams.append("chain", userNetworkName);
    url.searchParams.append("champion", hash);

    const res = await fetch(url.toString());
    if (res.status == 200) {
      try {
        let data = await res.json();
        setVoteVAAs(data);
      } catch (e) {
        console.log(e);
      }
    }
    setIsLoading(false);
  };

  const router = useRouter();

  const onClaimXP = async (seq: string) => {
    setDisabled(true);

    const emitterAddr = String(await contract.getMessengerAddr())
      .substring(2)
      .padStart(64, "0");

    let url = `http://localhost:7071/v1/signed_vaa/${
      usersNetwork.wormholeChainId
    }/${emitterAddr}/${seq.toString()}`;

    let response = await fetch(url);
    let data = await response.json();

    try {
      await (
        await contract.claimXP(hash, Buffer.from(data.vaaBytes, "base64"))
      ).wait();
      let url = new URL(serverBaseURL + "removebattle");
      url.searchParams.append("chain", userNetworkName);
      url.searchParams.append("champion", hash);
      url.searchParams.append("seq", seq);

      const res = await fetch(url.toString());
      if (res.status == 200) {
        console.log("successfully removed seq", seq);
      }
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      setDisabled(false);
    }
    router.reload();
  };

  const onClaimVote = async (seq: string) => {
    setDisabled(true);

    const emitterAddr = String(await contract.getMessengerAddr())
      .substring(2)
      .padStart(64, "0");

    let url = `http://localhost:7071/v1/signed_vaa/${
      usersNetwork.wormholeChainId
    }/${emitterAddr}/${seq.toString()}`;

    let response = await fetch(url);
    let data = await response.json();

    try {
      await (
        await contract.audienceClaimPoints(Buffer.from(data.vaaBytes, "base64"))
      ).wait();
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.data) window.alert(e.data.data.reason);
      else window.alert("Unable to claim Vote vaa.");
      setDisabled(false);
    }

    router.reload();
  };

  return (
    <>
      <div className="overflow-hidden rounded shadow-lg">
        <div className="px-6 py-4">
          <div className="font-bold text-l">
            Claim Your {playerKind == "fighter" ? "XP" : "Votes"} Here
          </div>
          <p className="mt-3 text-center text-gray-700 grid grid-cols-2 gap-5">
            {playerKind == "fighter" ? (
              <>
                {battleVAAs.map((vaa) => {
                  return (
                    <button
                      className={
                        disabled
                          ? "bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
                          : "btn btn-blue"
                      }
                      disabled={disabled}
                      onClick={() => onClaimXP(vaa)}
                    >
                      Battle VAA {vaa}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {voteVAAs.map((vaa) => {
                  return (
                    <button
                      className={
                        disabled
                          ? "bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
                          : "btn btn-blue"
                      }
                      disabled={disabled}
                      onClick={() => onClaimVote(vaa)}
                    >
                      Vote VAA {vaa}
                    </button>
                  );
                })}
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChampionXP;
