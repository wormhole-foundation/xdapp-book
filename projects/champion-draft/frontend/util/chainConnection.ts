import { ethers } from "ethers";

export const getUsersNetworkIdentifier = async (
  provider: ethers.providers.Web3Provider
) => {
  if (
    (await provider.send("net_version", [])) ===
    (await new ethers.providers.JsonRpcProvider("http://localhost:8545").send(
      "net_version",
      []
    ))
  ) {
    return "evm0";
  } else if (
    (await provider.send("net_version", [])) ===
    (await new ethers.providers.JsonRpcProvider("http://localhost:8546").send(
      "net_version",
      []
    ))
  ) {
    return "evm1";
  } else {
    throw new Error("Unrecognized chain");
  }
};

