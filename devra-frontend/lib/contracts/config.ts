// Contract configuration for Westend Asset Hub
export const WESTEND_ASSET_HUB = {
  chainId: 420420421, // Westend Asset Hub Chain ID
  name: "Westend Asset Hub",
  rpcUrl: "https://westend-asset-hub-eth-rpc.polkadot.io",
  blockExplorer: "https://blockscout-asset-hub.parity-chains-scw.parity.io",
  nativeCurrency: {
    name: "Westend",
    symbol: "WND",
    decimals: 12,
  },
  faucet: "https://faucet.polkadot.io/westend?parachain=1000",
} as const;

// Your deployed DatasetNFT contract on Westend Asset Hub
export const DATASET_NFT_ADDRESS =
  "0x25e485Fc5492Ce1c65cFd438De6D64eB62335CD7" as const;

// Deployment transaction
export const DEPLOYMENT_TX =
  "0x6989a015b168afdb191a80897e1b8fab93f847d153bffab8cc1939593cfcd070" as const;

// Block explorer links
export const getContractExplorerUrl = () =>
  `${WESTEND_ASSET_HUB.blockExplorer}/address/${DATASET_NFT_ADDRESS}`;

export const getTxExplorerUrl = (txHash: string) =>
  `${WESTEND_ASSET_HUB.blockExplorer}/tx/${txHash}`;

export const getTokenExplorerUrl = (tokenId: number) =>
  `${WESTEND_ASSET_HUB.blockExplorer}/token/${DATASET_NFT_ADDRESS}/instance/${tokenId}`;

export const getDeploymentTxUrl = () =>
  `${WESTEND_ASSET_HUB.blockExplorer}/tx/${DEPLOYMENT_TX}`;

// Helper to format prices (WND has 12 decimals)
export function formatWND(wei: bigint): string {
  return (Number(wei) / 1e12).toFixed(4);
}

export function parseWND(wnd: string): bigint {
  return BigInt(Math.floor(parseFloat(wnd) * 1e12));
}
