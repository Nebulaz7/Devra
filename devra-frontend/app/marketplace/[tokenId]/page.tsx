"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  TrendingUp,
  Calendar,
  User,
  Lock,
  ShoppingCart,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Tag,
  Database,
  Sparkles,
  Info,
  Download,
  Key,
} from "lucide-react";
import { useAccount } from "wagmi";
import { blo } from "blo";
import toast from "react-hot-toast";
import TopNav from "@/app/components/sidebar";
import {
  useDatasetInfo,
  useBuyDataset,
  useNFTOwner,
} from "@/lib/contracts/useDataset";
import { formatWND, getTxExplorerUrl } from "@/lib/contracts/config";

const CATEGORIES = [
  "Medicine",
  "Computer Vision",
  "NLP",
  "Finance",
  "Audio",
  "Gaming",
];

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const tokenId = params.tokenId
    ? parseInt(params.tokenId as string)
    : undefined;

  const { dataset, isLoading, refetch } = useDatasetInfo(tokenId);
  const { owner } = useNFTOwner(tokenId);
  const { buy, isPending: isBuying, isSuccess, hash } = useBuyDataset();

  const [selectedCategories] = useState(CATEGORIES.slice(0, 3)); // Mock for now
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Purchase successful!", {
        icon: "🎉",
        duration: 5000,
      });
      refetch();
    }
  }, [isSuccess, hash, refetch]);

  const isOwner = address?.toLowerCase() === owner?.toLowerCase();
  const hasPurchased = isOwner; // Can be expanded to check purchase history

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      router.push("/connect");
      return;
    }

    if (!dataset || !dataset.listed) {
      toast.error("This dataset is not available for purchase");
      return;
    }

    if (!tokenId) return;

    try {
      toast.loading("Processing purchase...", { id: "purchase" });
      await buy(tokenId, dataset.price);
      toast.success("Purchase completed!", { id: "purchase" });
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Purchase failed", { id: "purchase" });
    }
  };

  const handleDownload = async () => {
    if (!hasPurchased) {
      toast.error("You must purchase this dataset first!", {
        icon: "🔒",
      });
      return;
    }

    if (!dataset) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Step 1: Show decryption process
      toast.loading("Decrypting dataset...", { id: "download" });

      // TODO: Call backend API to decrypt and get IPFS CID
      // For now, using mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Get decrypted CID from backend
      const response = await fetch("/api/decrypt-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          walletAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to decrypt dataset");
      }

      const { decryptedCid } = await response.json();

      // Step 3: Download from IPFS
      toast.loading("Downloading from IPFS...", { id: "download" });

      // Open IPFS gateway in new tab
      const ipfsUrl = `https://ipfs.io/ipfs/${decryptedCid}`;
      window.open(ipfsUrl, "_blank");

      toast.success("Download started! Check your browser.", {
        id: "download",
        icon: "📥",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Download error:", error);
      setDownloadError(error.message || "Failed to download dataset");
      toast.error("Download failed", { id: "download" });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <TopNav activeTab="/marketplace" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading dataset details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dataset || !tokenId) {
    return (
      <div className="min-h-screen bg-black">
        <TopNav activeTab="/marketplace" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Dataset Not Found
            </h2>
            <p className="text-gray-400 mb-6">
              This dataset doesn't exist or has been removed
            </p>
            <button
              onClick={() => router.push("/marketplace")}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-all"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = blo(dataset.creator as `0x${string}`);

  return (
    <div className="min-h-screen bg-black">
      <TopNav activeTab="/marketplace" />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/marketplace")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/20 rounded-2xl p-8"
              >
                <div className="flex items-start gap-6">
                  <img
                    src={avatarUrl}
                    alt="Creator"
                    className="w-20 h-20 rounded-2xl border-2 border-pink-500/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                          Dataset #{tokenId}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <User className="w-4 h-4" />
                          <span>Created by</span>
                          <span className="font-mono text-pink-500">
                            {dataset.creator.slice(0, 6)}...
                            {dataset.creator.slice(-4)}
                          </span>
                        </div>
                      </div>
                      {dataset.listed && (
                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                          <span className="text-green-500 font-medium text-sm">
                            Listed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedCategories.map((category) => (
                        <span
                          key={category}
                          className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-500 text-xs font-medium"
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {category}
                        </span>
                      ))}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Minted on {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI Score Visualization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/20 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      AI Quality Score
                    </h2>
                    <p className="text-sm text-gray-400">
                      Verified by advanced AI algorithms
                    </p>
                  </div>
                </div>

                {/* Score Circle */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-white/10"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 552 }}
                      animate={{
                        strokeDashoffset: 552 - (552 * dataset.score) / 100,
                      }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      style={{
                        strokeDasharray: 552,
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
                    >
                      {dataset.score}%
                    </motion.span>
                    <span className="text-sm text-gray-400 mt-1">
                      Quality Score
                    </span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Data Integrity</p>
                    <p className="text-lg font-bold text-white">Verified</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Security</p>
                    <p className="text-lg font-bold text-white">High</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Completeness</p>
                    <p className="text-lg font-bold text-white">
                      {dataset.score}%
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/20 rounded-2xl p-8"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-pink-500" />
                  Dataset Description
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  This is a high-quality, AI-verified dataset perfect for
                  training machine learning models. The data has been thoroughly
                  validated and encrypted for security. Once purchased, you'll
                  receive full access to the decrypted dataset via IPFS.
                </p>
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-400 mb-1">
                        Encrypted & Secure
                      </p>
                      <p className="text-blue-300/70">
                        Dataset content is encrypted and stored on IPFS. Access
                        is granted only after purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Technical Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/20 rounded-2xl p-8"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-pink-500" />
                  Technical Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Token ID</p>
                    <p className="text-white font-mono font-semibold">
                      #{tokenId}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Blockchain</p>
                    <p className="text-white font-semibold">
                      Westend Asset Hub
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Token Standard</p>
                    <p className="text-white font-semibold">ERC-721</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Storage</p>
                    <p className="text-white font-semibold">IPFS (Encrypted)</p>
                  </div>
                </div>

                <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">
                    CID Hash (Encrypted)
                  </p>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <p className="text-white font-mono text-sm truncate">
                      {dataset.cid.slice(0, 20)}...{dataset.cid.slice(-8)}
                    </p>
                  </div>
                  <p className="text-xs text-yellow-500 mt-2">
                    🔒 Full CID will be revealed after purchase
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Purchase/Download Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 bg-gradient-to-br from-gray-900 to-black border border-pink-500/30 rounded-2xl p-6 space-y-6"
              >
                {/* Price */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Current Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {formatWND(dataset.price)}
                    </span>
                    <span className="text-xl text-gray-400">WND</span>
                  </div>
                </div>

                {/* Owner Badge */}
                {hasPurchased && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        {isOwner ? "You own this dataset" : "Already purchased"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Purchase Button (if not purchased) */}
                {!hasPurchased && dataset.listed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePurchase}
                    disabled={isBuying || !isConnected}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-pink-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Purchase NFT
                      </>
                    )}
                  </motion.button>
                )}

                {/* Download Button (if purchased) */}
                {hasPurchased && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Decrypting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Dataset
                      </>
                    )}
                  </motion.button>
                )}

                {/* Download Error */}
                {downloadError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Download Failed</p>
                        <p className="text-xs text-red-300/70 mt-1">
                          {downloadError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!dataset.listed && !hasPurchased && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">
                        Not available for purchase
                      </span>
                    </div>
                  </div>
                )}

                {/* Transaction Hash */}
                {hash && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-400 mb-2 font-medium">
                      ✅ Purchase Successful!
                    </p>
                    <a
                      href={getTxExplorerUrl(hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-300 hover:text-green-200 flex items-center gap-1 transition-colors"
                    >
                      View Transaction
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Download Instructions (if purchased) */}
                {hasPurchased && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-400 mb-1">
                          Access Granted!
                        </p>
                        <p className="text-green-300/70 text-xs">
                          Click "Download Dataset" to decrypt and access your
                          data via IPFS.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Cards */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Secure Purchase</p>
                      <p className="text-gray-400 text-xs">
                        Smart contract protected transaction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">
                        Encrypted Storage
                      </p>
                      <p className="text-gray-400 text-xs">
                        Data is encrypted and stored on IPFS
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <TrendingUp className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">5% Royalty</p>
                      <p className="text-gray-400 text-xs">
                        Creator earns royalties on resales
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-3">Creator</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt="Creator"
                      className="w-10 h-10 rounded-lg border border-pink-500/30"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-mono text-sm truncate">
                        {dataset.creator}
                      </p>
                      <p className="text-xs text-gray-500">Dataset Creator</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
