// hooks/usePolkadot.ts
"use client";

import { useState, useEffect } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider } from "@polkadot/api";

export const usePolkadot = () => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        // Dynamically import extension-dapp only on client side
        const extensionDapp = await import("@polkadot/extension-dapp");

        // 1. Enable the extension
        const extensions = await extensionDapp.web3Enable("Devra");
        if (extensions.length === 0) {
          console.error("Polkadot extension not found.");
          return;
        }

        // 2. Get all accounts
        const allAccounts = await extensionDapp.web3Accounts();
        setAccounts(allAccounts);
        if (allAccounts.length > 0) {
          setSelectedAccount(allAccounts[0]);
        }

        // 3. Connect to the Paseo testnet
        // You can find public endpoints for Paseo and its parachains
        const provider = new WsProvider("wss://rpc.ibp.network/paseo");
        const apiInstance = await ApiPromise.create({ provider });
        setApi(apiInstance);
      } catch (error) {
        console.error("Error setting up Polkadot:", error);
      }
    };

    setup();

    // Clean up the connection on component unmount
    return () => {
      api?.disconnect();
    };
  }, []); // The empty dependency array ensures this runs once on mount

  return {
    api,
    accounts,
    selectedAccount,
    setSelectedAccount,
  };
};
