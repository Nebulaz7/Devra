import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useState } from "react";
import { DATASET_NFT_ADDRESS, parseWND } from "./config";
import { DatasetNFTAbi } from "./DatasetNFT";
import { decodeEventLog } from 'viem';

/**
 * Hook for minting dataset NFTs
 */
export function useMintDataset() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  
  const [tokenId, setTokenId] = useState<number | undefined>(undefined);

  // Read total supply after successful mint
  const { data: totalSupply, refetch: refetchTotal } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi,
    functionName: "total",
    query: {
      enabled: false, // Only query when we trigger it
    },
  });

  const mint = async (ipfsCid: string) => {
    setTokenId(undefined);
    console.log("🎨 Minting with CID:", ipfsCid);
    
    return writeContract({
      address: DATASET_NFT_ADDRESS,
      abi: DatasetNFTAbi,
      functionName: "mint",
      args: [ipfsCid], // Contract only needs the CID
    });
  };

  // Query total supply when transaction succeeds
  useEffect(() => {
    if (isSuccess && receipt && !tokenId) {
      console.log("✅ Mint successful! Querying total supply for tokenId...");
      
      // Wait a bit for blockchain to update, then query
      setTimeout(() => {
        refetchTotal();
      }, 2000); // Increased delay to 2 seconds
    }
  }, [isSuccess, receipt, tokenId, refetchTotal]);

  // Extract tokenId from total supply
  useEffect(() => {
    if (totalSupply !== undefined && isSuccess && !tokenId) {
      const newTokenId = Number(totalSupply);
      console.log("🎉 EXTRACTED TOKEN ID:", newTokenId);
      setTokenId(newTokenId);
    }
  }, [totalSupply, isSuccess, tokenId]);

  return {
    mint,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    receipt,
    tokenId,
  };
}
/**
 * Hook for listing a dataset for sale
 */
export function useListDataset() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const list = async (tokenId: number, priceInWND: string) => {
    const priceInWei = parseWND(priceInWND);

    return writeContract({
      address: DATASET_NFT_ADDRESS,
      abi: DatasetNFTAbi, // Remove .abi
      functionName: "list",
      args: [BigInt(tokenId), priceInWei],
    });
  };

  return {
    list,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook for buying a dataset
 */
export function useBuyDataset() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buy = async (tokenId: number, price: bigint) => {
    return writeContract({
      address: DATASET_NFT_ADDRESS,
      abi: DatasetNFTAbi, // Remove .abi
      functionName: "buy",
      args: [BigInt(tokenId)],
      value: price,
    });
  };

  return {
    buy,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook for canceling a listing
 */
export function useCancelListing() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancel = async (tokenId: number) => {
    return writeContract({
      address: DATASET_NFT_ADDRESS,
      abi: DatasetNFTAbi,
      functionName: "cancel",
      args: [BigInt(tokenId)],
    });
  };

  return {
    cancel,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook for transferring an NFT
 */
export function useTransferNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = async (from: string, to: string, tokenId: number) => {
    return writeContract({
      address: DATASET_NFT_ADDRESS,
      abi: DatasetNFTAbi, // Remove .abi
      functionName: "transferFrom",
      args: [from, to, BigInt(tokenId)],
    });
  };

  return {
    transfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook for setting AI verification score (owner only)
 */
export function useSetScore() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setScore = async (tokenId: number, score: number) => {
    if (score < 0 || score > 100) {
      throw new Error("Score must be between 0 and 100");
    }

    return writeContract({
      address: DATASET_NFT_ADDRESS,
      abi: DatasetNFTAbi, // Remove .abi
      functionName: "setScore",
      args: [BigInt(tokenId), score],
    });
  };

  return {
    setScore,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// ============ READ HOOKS (View Functions) ============

// Add type for the dataset data tuple
type DatasetData = readonly [
  `0x${string}`, // cid
  bigint, // score
  bigint, // price
  `0x${string}`, // creator
  boolean // listed
];

/**
 * Hook for reading dataset info by tokenId
 */
export function useDatasetInfo(tokenId: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi,
    functionName: "data",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId && tokenId > 0,
    },
  }) as {
    data: DatasetData | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  // Log for debugging
  console.log("useDatasetInfo:", { tokenId, data, isLoading, error });

  return {
    dataset: data
      ? {
          cid: data[0],
          score: Number(data[1]),
          price: data[2],
          creator: data[3],
          listed: data[4],
        }
      : undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for reading total supply
 */
export function useTotalSupply() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi, // Remove .abi
    functionName: "total",
  });

  return {
    total: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for reading user's NFT balance
 */
export function useUserBalance(address?: string) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi, // Remove .abi
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for reading NFT owner
 */
export function useNFTOwner(tokenId?: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi, // Remove .abi
    functionName: "ownerOf",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  return {
    owner: data as `0x${string}` | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for reading contract owner
 */
export function useContractOwner() {
  const { data, isLoading, error } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi, // Remove .abi
    functionName: "owner",
  });

  return {
    contractOwner: data as `0x${string}` | undefined,
    isLoading,
    error,
  };
}

/**
 * Hook for reading token name
 */
export function useTokenName() {
  const { data } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi, // Remove .abi
    functionName: "name",
  });

  return data as string;
}

/**
 * Hook for reading token symbol
 */
export function useTokenSymbol() {
  const { data } = useReadContract({
    address: DATASET_NFT_ADDRESS,
    abi: DatasetNFTAbi, // Remove .abi
    functionName: "symbol",
  });

  return data as string;
}
