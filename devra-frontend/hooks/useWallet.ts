import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MOONBASE_CHAIN_ID } from "../app/contracts/contractAddress";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        const network = await provider.getNetwork();

        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setIsConnected(true);
          setChainId(Number(network.chainId));
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setAccount(null);
      setIsConnected(false);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setAccount(address);
      setIsConnected(true);
      setChainId(Number(network.chainId));

      // Switch to Moonbase Alpha if not already
      if (Number(network.chainId) !== MOONBASE_CHAIN_ID) {
        await switchToMoonbase();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const switchToMoonbase = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${MOONBASE_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${MOONBASE_CHAIN_ID.toString(16)}`,
              chainName: "Moonbase Alpha",
              nativeCurrency: {
                name: "DEV",
                symbol: "DEV",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
              blockExplorerUrls: ["https://moonbase.moonscan.io/"],
            },
          ],
        });
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
  };

  const isCorrectNetwork = chainId === MOONBASE_CHAIN_ID;

  return {
    account,
    isConnected,
    chainId,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToMoonbase,
  };
}
