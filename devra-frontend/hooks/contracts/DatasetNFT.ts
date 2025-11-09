// devra-frontend/lib/contracts/DatasetNFT.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { passetHub } from "@/lib/wagmi";
import DatasetNFTAbi from "./DatasetNFT.json"; // Your ABI

export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS"; // Update after deployment

// Hook for minting NFT
export function useMintDataset() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mint = async (to: string, uri: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: DatasetNFTAbi.abi,
      functionName: "safeMint",
      args: [to, uri],
      chainId: passetHub.id,
    });
  };

  return { mint, isConfirming, isSuccess };
}

// Hook for reading NFTs
export function useMyNFTs(address?: string) {
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DatasetNFTAbi.abi,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  return { balance };
}
