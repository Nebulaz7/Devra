import { ethers } from "ethers";
import { useMemo } from "react";
import { CONTRACT_ABI } from "../app/contracts/devraDatasets";
import { CONTRACT_ADDRESS } from "../app/contracts/contractAddress";

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useContract() {
  const contract = useMemo(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, []);

  return contract;
}

export async function getContractWithSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
