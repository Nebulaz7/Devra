import type { Chain } from "wagmi/chains";
import { createConfig, createStorage, http } from "wagmi";
import { metaMask } from "@wagmi/connectors";

// Westend Asset Hub configuration
export const westendAssetHub = {
  id: 420420421,
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

export const config = createConfig({
  chains: [westendAssetHub],
  connectors: [
    metaMask(),
  ],
  storage: createStorage({
    storage: typeof window !== "undefined" ? localStorage : undefined,
    key: "devra-wallet",
  }),
  transports: {
  [westendAssetHub.id]: http(
    "https://westend-asset-hub-eth-rpc.polkadot.io"
  ),
}
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
