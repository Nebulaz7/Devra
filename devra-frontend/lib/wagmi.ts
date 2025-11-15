import type { Chain } from "wagmi/chains";
import { createConfig, createStorage, http } from "wagmi";
import { injected } from "@wagmi/connectors";
import type { EIP1193Provider } from "viem";

// Westend Asset Hub configuration
export const westendAssetHub = {
  id: 420420421, // Westend Asset Hub Chain ID
  name: "Westend Asset Hub",
  nativeCurrency: {
    name: "Westend",
    symbol: "WND",
    decimals: 12,
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-asset-hub.parity-chains-scw.parity.io",
    },
  },
  rpcUrls: {
    default: {
      http: ["https://westend-asset-hub-eth-rpc.polkadot.io"],
    },
  },
  testnet: true,
} as const satisfies Chain;

type WindowWithTalisman = Window & {
  talisman?: {
    ethereum?: EIP1193Provider;
  };
};

const getTalismanProvider = () => {
  if (typeof window === "undefined") return undefined;
  return (window as WindowWithTalisman).talisman?.ethereum;
};

export const config = createConfig({
  chains: [westendAssetHub],
  connectors: [
    injected({
      target: "metaMask",
    }),
    injected({
      target: () => ({
        id: "talisman",
        name: "Talisman",
        provider: getTalismanProvider,
      }),
    }),
  ],
  storage: createStorage({
    storage: typeof window !== "undefined" ? localStorage : undefined,
    key: "devra-wallet",
  }),
  transports: {
    [westendAssetHub.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
