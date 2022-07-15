import * as ethers from "ethers";

type MetamaskButtonProps = {
  provider: ethers.providers.Web3Provider;
  setConnected: (_: boolean) => void;
};

const MetamaskButton = ({ provider, setConnected }: MetamaskButtonProps) => {
  const requestAccount = async () => {
    await console.log(provider.getNetwork());
    // we must make this request so that wallet providers can prompt the user to accept
    await provider.send("eth_requestAccounts", []);

    setConnected(true);
  };

  if (
    process.browser === false ||
    typeof (window as any).ethereum !== "undefined"
  ) {
    return (
      <div>
        <button onClick={(_) => requestAccount()} className="btn btn-blue">
          Connect Wallet
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col space-y-4">
        <button className="btn btn-disabled">Connect Wallet</button>
        <p className="text-red">Wallet provider not detected</p>
      </div>
    );
  }
};

export default MetamaskButton;
