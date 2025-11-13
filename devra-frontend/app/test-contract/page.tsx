"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  useMintDataset,
  useListDataset,
  useTotalSupply,
  useUserBalance,
  useDatasetInfo,
  useCancelListing,
  useBuyDataset,
} from "../../lib/contracts/useDataset";
import {
  DATASET_NFT_ADDRESS,
  formatWND,
  getContractExplorerUrl,
  getTxExplorerUrl,
  getDeploymentTxUrl,
  parseWND,
} from "@/lib/contracts/config";

export default function TestContractPage() {
  const { address, isConnected } = useAccount();

  // Form states
  const [mintCid, setMintCid] = useState("QmTestDataset123456789");
  const [listTokenId, setListTokenId] = useState("");
  const [listPrice, setListPrice] = useState("1.5");
  const [viewTokenId, setViewTokenId] = useState("");
  const [buyTokenId, setBuyTokenId] = useState("");
  const [cancelTokenId, setCancelTokenId] = useState("");

  // Contract hooks
  const {
    mint,
    isPending: isMinting,
    isSuccess: mintSuccess,
    hash: mintHash,
  } = useMintDataset();
  const {
    list,
    isPending: isListing,
    isSuccess: listSuccess,
    hash: listHash,
  } = useListDataset();
  const {
    cancel,
    isPending: isCanceling,
    isSuccess: cancelSuccess,
    hash: cancelHash,
  } = useCancelListing();
  const {
    buy,
    isPending: isBuying,
    isSuccess: buySuccess,
    hash: buyHash,
  } = useBuyDataset();
  const { total } = useTotalSupply();
  const { balance } = useUserBalance(address);
  const { dataset, refetch: refetchDataset } = useDatasetInfo(
    viewTokenId ? parseInt(viewTokenId) : undefined
  );

  // Handlers
  const handleMint = async () => {
    if (!mintCid.trim()) {
      alert("Please enter an IPFS CID");
      return;
    }
    try {
      await mint(mintCid);
    } catch (error: any) {
      console.error("Mint error:", error);
      alert(`Minting failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleList = async () => {
    if (!listTokenId || !listPrice) {
      alert("Please enter token ID and price");
      return;
    }
    try {
      await list(parseInt(listTokenId), listPrice);
    } catch (error: any) {
      console.error("List error:", error);
      alert(`Listing failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleCancel = async () => {
    if (!cancelTokenId) {
      alert("Please enter token ID");
      return;
    }
    try {
      await cancel(parseInt(cancelTokenId));
    } catch (error: any) {
      console.error("Cancel error:", error);
      alert(`Cancel failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleBuy = async () => {
    if (!buyTokenId) {
      alert("Please enter token ID");
      return;
    }
    if (!dataset || !dataset.listed) {
      alert("Please load dataset info first and ensure it is listed");
      return;
    }
    try {
      await buy(parseInt(buyTokenId), dataset.price);
    } catch (error: any) {
      console.error("Buy error:", error);
      alert(`Purchase failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleViewDataset = () => {
    if (viewTokenId) {
      refetchDataset();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-pink-500">
        <div className="text-center bg-[#1e1d1d] p-8 rounded-2xl border border-pink-500/20">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Connect Your Wallet
          </h1>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to test the contract
          </p>
          <a
            href="/connect"
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            Connect Wallet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-pink-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#1e1d1d] rounded-2xl p-6 md:p-8 mb-6 border border-pink-500/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Contract Test Dashboard
              </h1>
              <p className="text-gray-400">
                Test your DatasetNFT smart contract on Westend Asset Hub
              </p>
            </div>
            <a
              href="/"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              ← Home
            </a>
          </div>

          {/* Contract Info Card */}
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs mb-2">Contract Address</p>
                <div className="flex items-center gap-2">
                  <code className="bg-black/30 px-3 py-2 rounded text-white text-xs flex-1 truncate">
                    {DATASET_NFT_ADDRESS}
                  </code>
                  <a
                    href={getContractExplorerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-pink-500/20 hover:bg-pink-500/30 p-2 rounded transition flex-shrink-0"
                    title="View on Blockscout"
                  >
                    <ExternalLink size={16} className="text-pink-400" />
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Total Minted</p>
                  <p className="text-white font-bold text-xl">{total}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Your NFTs</p>
                  <p className="text-white font-bold text-xl">{balance}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Network</p>
                  <p className="text-white font-bold text-sm">Westend</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <a
                href={getDeploymentTxUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 text-xs flex items-center gap-1"
              >
                View Deployment Transaction <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mint NFT */}
          <div className="bg-[#1e1d1d] rounded-2xl p-6 border border-green-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              🎨 Mint Dataset NFT
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IPFS CID
                </label>
                <input
                  type="text"
                  value={mintCid}
                  onChange={(e) => setMintCid(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
                  placeholder="QmXYZ..."
                />
                <p className="text-gray-400 text-xs mt-1">
                  Enter the IPFS CID of your dataset
                </p>
              </div>
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isMinting && <Loader2 size={18} className="animate-spin" />}
                {isMinting ? "Minting..." : "Mint NFT"}
              </button>
              {mintSuccess && mintHash && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-green-400 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-green-400 text-sm font-medium mb-1">
                        ✅ Minted successfully!
                      </p>
                      <a
                        href={getTxExplorerUrl(mintHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-300 hover:text-green-200 text-xs flex items-center gap-1"
                      >
                        View Transaction <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List for Sale */}
          <div className="bg-[#1e1d1d] rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              📋 List for Sale
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token ID
                </label>
                <input
                  type="number"
                  value={listTokenId}
                  onChange={(e) => setListTokenId(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
                  placeholder="1"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (WND)
                </label>
                <input
                  type="text"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
                  placeholder="1.5"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Enter price in WND tokens
                </p>
              </div>
              <button
                onClick={handleList}
                disabled={isListing || !listTokenId}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isListing && <Loader2 size={18} className="animate-spin" />}
                {isListing ? "Listing..." : "List for Sale"}
              </button>
              {listSuccess && listHash && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-blue-400 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-blue-400 text-sm font-medium mb-1">
                        ✅ Listed successfully!
                      </p>
                      <a
                        href={getTxExplorerUrl(listHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200 text-xs flex items-center gap-1"
                      >
                        View Transaction <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Dataset Info */}
          <div className="bg-[#1e1d1d] rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              🔍 View Dataset Info
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={viewTokenId}
                  onChange={(e) => setViewTokenId(e.target.value)}
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition"
                  placeholder="Token ID"
                  min="1"
                />
                <button
                  onClick={handleViewDataset}
                  disabled={!viewTokenId}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition"
                >
                  Load
                </button>
              </div>

              {dataset && (
                <div className="space-y-3 bg-black/20 rounded-lg p-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">CID Hash</p>
                    <code className="bg-black/30 px-3 py-2 rounded text-white block text-xs break-all">
                      {dataset.cid}
                    </code>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">AI Score</p>
                      <p className="text-white font-medium text-lg">
                        {dataset.score}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Price</p>
                      <p className="text-white font-medium text-lg">
                        {formatWND(dataset.price)} WND
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Creator</p>
                    <code className="bg-black/30 px-3 py-2 rounded text-white block text-xs break-all">
                      {dataset.creator}
                    </code>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <p className="text-gray-400 text-xs">Status</p>
                    <p
                      className={`font-medium text-sm ${
                        dataset.listed ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      {dataset.listed ? "✅ Listed" : "❌ Not Listed"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buy Dataset */}
          <div className="bg-[#1e1d1d] rounded-2xl p-6 border border-yellow-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              💰 Buy Dataset
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token ID
                </label>
                <input
                  type="number"
                  value={buyTokenId}
                  onChange={(e) => {
                    setBuyTokenId(e.target.value);
                    setViewTokenId(e.target.value); // Auto-load dataset info
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition"
                  placeholder="1"
                  min="1"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Load dataset info first to see price
                </p>
              </div>
              <button
                onClick={handleBuy}
                disabled={isBuying || !buyTokenId || !dataset?.listed}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isBuying && <Loader2 size={18} className="animate-spin" />}
                {isBuying
                  ? "Buying..."
                  : dataset
                  ? `Buy for ${formatWND(dataset.price)} WND`
                  : "Buy Dataset"}
              </button>
              {buySuccess && buyHash && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-yellow-400 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-yellow-400 text-sm font-medium mb-1">
                        ✅ Purchase successful!
                      </p>
                      <a
                        href={getTxExplorerUrl(buyHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-300 hover:text-yellow-200 text-xs flex items-center gap-1"
                      >
                        View Transaction <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cancel Listing */}
          <div className="bg-[#1e1d1d] rounded-2xl p-6 border border-red-500/20 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              ❌ Cancel Listing
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token ID
                </label>
                <input
                  type="number"
                  value={cancelTokenId}
                  onChange={(e) => setCancelTokenId(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                  placeholder="1"
                  min="1"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCancel}
                  disabled={isCanceling || !cancelTokenId}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isCanceling && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {isCanceling ? "Canceling..." : "Cancel Listing"}
                </button>
              </div>
            </div>
            {cancelSuccess && cancelHash && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={18}
                    className="text-red-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-red-400 text-sm font-medium mb-1">
                      ✅ Listing canceled!
                    </p>
                    <a
                      href={getTxExplorerUrl(cancelHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-300 hover:text-red-200 text-xs flex items-center gap-1"
                    >
                      View Transaction <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-[#1e1d1d] rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              <p>
                Deployed by:{" "}
                <code className="text-white">0x88f713...3547fe</code>
              </p>
              <p className="text-xs mt-1">Block: 13194547 | Nov 11, 2025</p>
            </div>
            <div className="flex gap-4">
              <a
                href={getContractExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1"
              >
                Contract <ExternalLink size={14} />
              </a>
              <a
                href={getDeploymentTxUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1"
              >
                Deployment <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
