import * as ethers from "ethers";
import erc165Abi from "../abi/IERC165";

const makeInterfaceChecker =
  (interfaceIdentifier: number) =>
  (address: string, provider: ethers.providers.Provider) => {
    const contract = new ethers.Contract(address, erc165Abi.abi, provider);
    return contract.supportsInterface(interfaceIdentifier);
  };

// function to check if a given `address` corresponds to a contract that implements ERC 721
export const isErc721 = makeInterfaceChecker(0x80ac58cd);
// function to check if a given `address` corresponds to a contract that implements ERC 721 with extension "Metadata"
export const isErc721Metadata = makeInterfaceChecker(0x5b5e139f);
// function to check if a given `address` corresponds to a contract that implements ERC 721 with extension "Enumerable"
export const isErc721Enumerable = makeInterfaceChecker(0x780e9d63);

