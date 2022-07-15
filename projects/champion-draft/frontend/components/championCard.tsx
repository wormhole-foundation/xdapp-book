import { useEffect, useState } from "react";
import SkillBar from "react-skillbars";

type ChampionCardProps = {
  // the ethers provider that allows us to call contracts on chain
  champion: any;
  serverBaseURL: string;
  networkName: string;
  isSelf: boolean;
  // the callback to fire when the user chooses to start a battle
  buttonOnClick: (opponentVaa: string, championHash: string) => void;
  buttonText: string;
};

const ChampionCard = ({
  champion,
  serverBaseURL,
  networkName,
  isSelf,
  buttonOnClick,
  buttonText,
}: ChampionCardProps) => {
  if (champion == null) {
    return <></>;
  }

  const xp = [{ type: "XP", level: champion.stats.xp / champion.stats.level }];

  const [imageURI, setImageURI] = useState(null);
  const [name, setName] = useState("Unknown name");

  const onClick = () => {
    let url = new URL(serverBaseURL + "championVaa");
    url.searchParams.append("chain", networkName);
    url.searchParams.append("champion", champion.championHash.toHexString());

    fetch(url.toString())
      .then((res) => {
        res.json().then((vaa) => {
          buttonOnClick(vaa, champion.championHash.toHexString());
        });
      })
      .catch();
  };

  useEffect(() => {
    let url = "http://localhost:5000/metadataevm?id=";
    let uriArr = champion.uri.split("/");
    url += uriArr[uriArr.length - 1];
    fetch(url).then((res) => {
      res.json().then((data) => {
        setName(data.name);
        setImageURI(data.image);
      });
    });
  }, [champion]);

  return (
    <div className="max-w-sm overflow-hidden rounded shadow-lg">
      {imageURI && <img className="w-full" src={imageURI} />}
      <div className="px-6 py-4">
        <span className="">
          <span className="max-w-sm text-xl font-bold truncate">{name}</span>
          <span className="float-right text-md">
            Lvl. {champion.stats.level}
          </span>
        </span>
        <SkillBar skills={xp} height={10} />
        <div className="text-xs truncate text-ellipsis">
          Champion Hash: {champion.championHash.toHexString()}
        </div>
        <p className="text-xs truncate text-ellipsis">
          Owner Hash: {champion.owner.toString()}
        </p>
        <p className="mt-3 text-center text-gray-700 grid grid-cols-2 gap-8">
          <p>
            Attack: {champion.stats.attack}{" "}
            {isSelf && (
              <div className="text-xs">Votes: {champion.votes.attack}</div>
            )}
          </p>
          <p>
            Defense: {champion.stats.defense}{" "}
            {isSelf && (
              <div className="text-xs">Votes: {champion.votes.defense}</div>
            )}
          </p>
          <p>
            Speed: {champion.stats.speed}{" "}
            {isSelf && (
              <div className="text-xs">Votes: {champion.votes.speed}</div>
            )}
          </p>
          <p>
            Crit Rate: {champion.stats.crit_rate}%{" "}
            {isSelf && (
              <div className="text-xs">Votes: {champion.votes.crit_rate}</div>
            )}
          </p>
          <p className="col-span-2">
            Can battle at round{" "}
            {champion.round % 2 == 1 ? champion.round - 1 : champion.round}
          </p>
        </p>
      </div>
      {!isSelf && (
        <div className="px-6 pb-6 text-center">
          <button
            className="bg-red-300 btn hover:bg-red-400"
            onClick={() => onClick()}
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChampionCard;
