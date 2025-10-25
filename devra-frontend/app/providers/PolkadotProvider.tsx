// providers/PolkadotProvider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { ApiPromise } from "@polkadot/api";
import { usePolkadot } from "../../hooks/usePolkadot";

// Define the shape of the context data
interface PolkadotContextType {
  api: ApiPromise | null;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  setSelectedAccount: (account: InjectedAccountWithMeta) => void;
}

// Create the context with a default value
const PolkadotContext = createContext<PolkadotContextType | undefined>(
  undefined
);

// Create the provider component
export const PolkadotProvider = ({ children }: { children: ReactNode }) => {
  const polkadotState = usePolkadot();

  return (
    <PolkadotContext.Provider value={polkadotState as PolkadotContextType}>
      {children}
    </PolkadotContext.Provider>
  );
};

// Create a custom hook to use the Polkadot context
export const usePolkadotContext = () => {
  const context = useContext(PolkadotContext);
  if (context === undefined) {
    throw new Error(
      "usePolkadotContext must be used within a PolkadotProvider"
    );
  }
  return context;
};
