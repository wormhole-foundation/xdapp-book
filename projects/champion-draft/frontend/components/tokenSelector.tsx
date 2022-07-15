import { useState } from "react";
import * as ethers from "ethers";
import { Network } from "../pages/index";
import * as interfaceChecker from "../util/ercInterfaces";

type TokenSelectorProps = {
  provider: ethers.providers.Web3Provider;
  network: Network;
  abi: any;
  setChampionHash: (_: string | null) => void;
};

const TokenSelector = ({
  network,
  provider,
  abi,
  setChampionHash,
}: TokenSelectorProps) => {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const lookupToken = async () => {
    if (contractAddress === "") {
    }

    const contract = new ethers.Contract(
      network.deployedAddress,
      abi,
      provider.getSigner()
    );

    try {
      interfaceChecker.isErc721(contractAddress, provider);
    } catch (e) {
      console.error(e);
      setErrorMessage("Not ERC721 compatible");
      return;
    }

    const newHash = await contract.getChampionHash(contractAddress, tokenId);
    if ((await contract.champions(newHash)).championHash.toString() !== "0") {
      setChampionHash(newHash);
      return;
    }

    const tx = await contract.registerNFT(contractAddress, tokenId);
    const receipt = await tx.wait();

    const championHash = await contract.getChampionHash(
      contractAddress,
      tokenId
    );
    setChampionHash(championHash);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div>
        Contract Address:
        <input
          type="text"
          className="w-full border"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.currentTarget.value)}
        />
      </div>
      <div className="">
        Token ID:
        <input
          type="text"
          className="w-full border"
          value={tokenId}
          onChange={(e) => setTokenId(e.currentTarget.value)}
        />
      </div>
      {errorMessage !== "" && (
        <div className="font-red-500">{errorMessage}</div>
      )}
      <button className="btn btn-blue" onClick={lookupToken}>
        Fight
      </button>
    </div>
  );
};

export default TokenSelector;
