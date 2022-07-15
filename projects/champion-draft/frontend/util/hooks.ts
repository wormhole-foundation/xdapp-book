import * as ethers from "ethers";
import { useMemo } from "react";

export const useWeb3Provider = (dependencies?: any[]) => {
  if (process.browser === false) {
    return;
  }

  const provider = useMemo(
    () => new ethers.providers.Web3Provider((window as any).ethereum),
    dependencies
  );
  provider.getSigner();

  return provider;
};


