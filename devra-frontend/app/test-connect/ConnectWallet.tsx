// components/ConnectWallet.tsx
"use client";

import { usePolkadotContext } from "../providers/PolkadotProvider";

export const ConnectWallet = () => {
  const { accounts, selectedAccount, setSelectedAccount, api } =
    usePolkadotContext();

  if (!api) {
    return <div>Loading Polkadot API...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div>
        Please install the Polkadot .js extension and create an account.
      </div>
    );
  }

  return (
    <div>
      <h3>Connected to Paseo Testnet</h3>
      {selectedAccount ? (
        <div>
          <p>Connected Account:</p>
          <p>
            <strong>{selectedAccount.meta.name}</strong> (
            {selectedAccount.address})
          </p>
        </div>
      ) : (
        <p>No account selected.</p>
      )}

      {accounts.length > 1 && (
        <div>
          <label htmlFor="account-select">Choose an account:</label>
          <select
            id="account-select"
            value={selectedAccount?.address}
            onChange={(e) => {
              const selected = accounts.find(
                (acc) => acc.address === e.target.value,
              );
              if (selected) {
                setSelectedAccount(selected);
              }
            }}
          >
            {accounts.map((account) => (
              <option key={account.address} value={account.address}>
                {account.meta.name} ({account.address.slice(0, 6)}...
                {account.address.slice(-6)})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
