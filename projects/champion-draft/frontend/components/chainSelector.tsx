import { Network } from "../pages";

type ChainSelectorProps = {
  networks: Record<string, Network>;
  setNetwork: (_: string) => void;
  selectedNetworkName: string;
};

const ChainSelector = ({
  networks,
  setNetwork,
  selectedNetworkName,
}: ChainSelectorProps) => {
  return (
    <span>
      {Object.keys(networks).map((key) => (
        <button
          className={
            "mx-4 btn btn-blue" +
            (key === selectedNetworkName ? " bg-blue-900" : "")
          }
          onClick={() => setNetwork(key)}
        >
          {key}
        </button>
      ))}
    </span>
  );
};

export default ChainSelector;
