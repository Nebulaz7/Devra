// app/page.tsx
import { ConnectWallet } from "./ConnectWallet";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>My Polkadot dApp</h1>
      <ConnectWallet />
    </main>
  );
}
