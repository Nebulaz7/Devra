"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
  Tags,
  FileText,
  Info,
  ExternalLink,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMintDataset } from "@/lib/contracts/useDataset";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "wagmi";

interface MintDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormStep = "details" | "processing" | "success";

const CATEGORIES = [
  { id: "medicine", label: "Medicine" },
  { id: "text-classification", label: "Text Classification" },
  { id: "computer-vision", label: "Computer Vision" },
  { id: "sports", label: "Sports" },
  { id: "crypto", label: "Crypto" },
  { id: "finance", label: "Finance" },
  { id: "nlp", label: "NLP" },
  { id: "audio", label: "Audio" },
  { id: "climate", label: "Climate" },
  { id: "retail", label: "Retail" },
  { id: "social-media", label: "Social Media" },
  { id: "gaming", label: "Gaming" },
];

const WESTEND_ASSET_HUB_CHAIN_ID = "0x190f1b45"; // 420420421 in hex

export default function MintDatasetModal({
  isOpen,
  onClose,
  onSuccess,
}: MintDatasetModalProps) {
  const [formStep, setFormStep] = useState<FormStep>("details");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null as File | null,
    categories: [] as string[],
    datasetId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({
    step: 1,
    message: "Preparing upload...",
  });
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);

  const { address } = useWallet();
  const { data: balance } = useBalance({ address });

  // ✅ Use your existing mint hook
  const { mint, isMinting, hash } = useMintDataset({
    onSuccess: async (tokenId: number) => {
      console.log("✅ NFT minted successfully! Token ID:", tokenId);
      setMintedTokenId(tokenId);
      toast.success(`Dataset NFT minted! Token ID: ${tokenId}`, {
        id: "minting",
      });

      // Update backend with tokenId
      if (formData.datasetId) {
        try {
          await fetch(
            `https://devra-px58.onrender.com/blockchain/dataset/${formData.datasetId}/token/${tokenId}`,
            { method: "POST" }
          );
          console.log("✅ Backend updated with tokenId");
        } catch (err) {
          console.error("❌ Failed to update backend:", err);
        }
      }

      setFormStep("success");

      // Auto-close after 5 seconds
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 5000);
    },
    onError: (err: Error) => {
      console.error("❌ Minting failed:", err);
      toast.error(err.message || "Minting failed", { id: "minting" });
      setError(err.message);
      setFormStep("details");
    },
  });

  // Update txHash when hash changes
  React.useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB");
      toast.error("File size must be less than 100MB");
      return;
    }

    const allowedTypes = [
      "application/zip",
      "text/csv",
      "application/json",
      "application/x-zip-compressed",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".zip")) {
      setError("Only ZIP, CSV, and JSON files are allowed");
      toast.error("Only ZIP, CSV, and JSON files are allowed");
      return;
    }

    setFormData({ ...formData, file });
    setError(null);
    toast.success(`File "${file.name}" selected!`);
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    try {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      console.log("Current chain:", currentChainId);
      console.log("Expected chain:", WESTEND_ASSET_HUB_CHAIN_ID);

      if (currentChainId !== WESTEND_ASSET_HUB_CHAIN_ID) {
        toast.loading("Switching to Westend Asset Hub...", { id: "network" });

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: WESTEND_ASSET_HUB_CHAIN_ID }],
          });
          toast.success("Network switched!", { id: "network" });
        } catch (switchError: any) {
          // Chain not added to MetaMask
          if (switchError.code === 4902) {
            toast.loading("Adding Westend Asset Hub to MetaMask...", {
              id: "network",
            });

            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: WESTEND_ASSET_HUB_CHAIN_ID,
                  chainName: "Westend Asset Hub",
                  rpcUrls: ["https://westend-asset-hub-eth-rpc.polkadot.io"],
                  nativeCurrency: {
                    name: "WND",
                    symbol: "WND",
                    decimals: 12,
                  },
                  blockExplorerUrls: [
                    "https://blockscout-asset-hub.parity-chains-scw.parity.io",
                  ],
                },
              ],
            });

            toast.success("Network added and switched!", { id: "network" });
          } else {
            throw switchError;
          }
        }
      }
    } catch (err) {
      console.error("Network switch error:", err);
      throw new Error(
        "Failed to switch network. Please switch manually to Westend Asset Hub."
      );
    }
  };

  const handleStartProcess = async () => {
    const walletAddress = address;

    // 1️⃣ Validate wallet connection
    if (!walletAddress || walletAddress.trim() === "") {
      setError("Please connect your wallet first");
      toast.error("Wallet not connected");
      return;
    }

    // 2️⃣ Validate form fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.file ||
      formData.categories.length === 0
    ) {
      setError(
        "Please fill all fields, upload a file, and select at least one category"
      );
      toast.error("Please complete all required fields");
      return;
    }

    // 3️⃣ Check balance for gas
    if (balance && balance.value < 100000000000n) {
      setError("Insufficient WND balance for gas fees");
      toast.error(
        "You need WND for gas. Get it from: https://faucet.polkadot.io/westend?parachain=1000"
      );
      return;
    }

    setError(null);
    setFormStep("processing");

    try {
      // 4️⃣ Check and switch network if needed
      setUploadProgress({
        step: 1,
        message: "Checking network connection...",
      });
      await checkAndSwitchNetwork();

      // 5️⃣ Upload dataset to backend
      setUploadProgress({
        step: 1,
        message: "Uploading dataset to backend...",
      });
      toast.loading("Uploading dataset to backend...", { id: "minting" });

      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("categories", JSON.stringify(formData.categories));
      form.append("file", formData.file);
      form.append("owner", walletAddress);

      const uploadResponse = await fetch(
        `https://devra-px58.onrender.com/datasets/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errText}`);
      }

      const uploadData = await uploadResponse.json();
      const datasetId = uploadData.datasetRecord?.id;

      if (!datasetId) {
        throw new Error("No dataset ID returned from server");
      }

      setFormData((prev) => ({ ...prev, datasetId }));

      // 6️⃣ Poll backend for IPFS upload completion
      setUploadProgress({
        step: 2,
        message: "Encrypting and uploading to IPFS...",
      });
      toast.loading("Processing and uploading to IPFS...", { id: "minting" });

      let dataset;
      let attempts = 0;
      const maxAttempts = 120; // 60 seconds timeout

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(
          `https://devra-px58.onrender.com/blockchain/dataset/${datasetId}`
        );

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();

          if (statusData.data.status === "uploaded" && statusData.data.cid) {
            dataset = statusData.data;
            break;
          }
        }

        await new Promise((r) => setTimeout(r, 1000));
        attempts++;
      }

      if (!dataset || dataset.status !== "uploaded" || !dataset.cid) {
        throw new Error("Dataset upload to IPFS failed or timed out");
      }

      // 7️⃣ Mint NFT on Asset Hub
      setUploadProgress({
        step: 3,
        message: "Minting your dataset NFT on blockchain...",
      });
      toast.loading("Minting your dataset NFT on blockchain...", {
        id: "minting",
      });

      console.log("🎨 Minting with CID:", dataset.cid);

      // ✅ Pass ONLY the CID to mint (your contract auto-assigns to msg.sender)
      await mint(dataset.cid);

      // Success will be handled by onSuccess callback above
    } catch (err: unknown) {
      console.error("❌ Process error:", err);
      let errorMessage = "Process failed";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === "string") errorMessage = err;

      setError(errorMessage);
      toast.error(errorMessage, { id: "minting" });
      setFormStep("details");
    }
  };

  const handleClose = () => {
    if (formStep === "details" || formStep === "success") {
      setFormData({
        name: "",
        description: "",
        file: null,
        categories: [],
        datasetId: "",
      });
      setFormStep("details");
      setError(null);
      setTxHash(null);
      setMintedTokenId(null);
      setUploadProgress({ step: 1, message: "Preparing upload..." });
      onClose();
    }
  };

  const canClose = formStep === "details" || formStep === "success";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={canClose ? handleClose : undefined}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gradient-to-br from-[#1e1d1d] to-[#2a2929] border border-pink-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-pink-500/20 rounded-xl">
                        <Shield className="w-7 h-7 text-pink-500" />
                      </div>
                      Mint Dataset NFT
                    </h2>
                    <p className="text-sm text-gray-400 mt-2 ml-14">
                      Encrypted and verified dataset minting on Asset Hub
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={!canClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="m-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">Error</p>
                      <p className="text-sm text-red-300/70">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Info Notice */}
              <div className="m-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-400 mb-1">
                      Minting on Polkadot Asset Hub
                    </p>
                    <p className="text-blue-300/70">
                      Your dataset will be encrypted, uploaded to IPFS, and
                      minted as an NFT on Polkadot&apos;s Asset Hub testnet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Warning */}
              {address && balance && balance.value < 100000000000n && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="m-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-400 mb-1">
                        Low WND Balance
                      </p>
                      <p className="text-yellow-300/70 mb-2">
                        You may not have enough WND for gas fees. Get WND from
                        the faucet:
                      </p>
                      <a
                        href="https://faucet.polkadot.io/westend?parachain=1000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 underline"
                      >
                        Westend Asset Hub Faucet
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form Step */}
              {formStep === "details" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-6"
                >
                  {/* Dataset Name */}
                  <div>
                    <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pink-500" />
                      Dataset Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Medical Records Q4 2024"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pink-500" />
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your dataset in detail..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 resize-none transition-all"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Tags className="w-4 h-4 text-pink-500" />
                      Categories * (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CATEGORIES.map((category) => {
                        const isSelected = formData.categories.includes(
                          category.id
                        );
                        return (
                          <motion.button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "bg-pink-500/20 border-pink-500 shadow-lg shadow-pink-500/20"
                                : "bg-white/5 border-white/10 hover:border-pink-500/30"
                            }`}
                          >
                            <div
                              className={`text-xs font-medium ${
                                isSelected ? "text-pink-400" : "text-gray-400"
                              }`}
                            >
                              {category.label}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    {formData.categories.length > 0 && (
                      <p className="text-xs text-pink-400 mt-2">
                        {formData.categories.length} category
                        {formData.categories.length === 1 ? "" : "ies"} selected
                      </p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-pink-500" />
                      Upload Dataset File *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".zip,.csv,.json"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center gap-3 w-full px-6 py-10 bg-gradient-to-br from-white/5 to-white/10 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                          formData.file
                            ? "border-green-500/50 bg-green-500/5"
                            : "border-white/20 hover:border-pink-500/50 hover:bg-white/10"
                        }`}
                      >
                        {formData.file ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                          >
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-white font-semibold text-lg">
                              {formData.file.name}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                              {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-green-400 mt-1">
                              ✓ Ready to upload
                            </p>
                          </motion.div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-pink-500" />
                            <div className="text-center">
                              <p className="text-white font-semibold text-lg mb-1">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-sm text-gray-400">
                                ZIP, CSV, or JSON files
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Maximum file size: 100MB
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-6 py-4 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleStartProcess}
                      disabled={
                        !formData.name ||
                        !formData.description ||
                        !formData.file ||
                        formData.categories.length === 0 ||
                        isMinting
                      }
                      className="flex-1 px-6 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      {isMinting ? "Minting..." : "Mint Dataset"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Processing Step */}
              {formStep === "processing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12"
                >
                  <div className="text-center max-w-md mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                      {[
                        { num: 1, label: "Upload" },
                        { num: 2, label: "IPFS" },
                        { num: 3, label: "Mint" },
                      ].map((s, idx) => (
                        <React.Fragment key={s.num}>
                          <div className="flex flex-col items-center gap-2">
                            <motion.div
                              animate={
                                uploadProgress.step === s.num
                                  ? { scale: [1, 1.1, 1] }
                                  : {}
                              }
                              transition={{
                                duration: 1,
                                repeat:
                                  uploadProgress.step === s.num ? Infinity : 0,
                              }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                uploadProgress.step > s.num
                                  ? "bg-green-500 text-white"
                                  : uploadProgress.step === s.num
                                  ? "bg-pink-500 text-white"
                                  : "bg-white/10 text-gray-500"
                              }`}
                            >
                              {uploadProgress.step > s.num ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : uploadProgress.step === s.num ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                s.num
                              )}
                            </motion.div>
                            <span className="text-xs text-gray-400">
                              {s.label}
                            </span>
                          </div>
                          {idx < 2 && (
                            <div
                              className={`w-12 h-0.5 mb-6 transition-all ${
                                uploadProgress.step > s.num
                                  ? "bg-green-500"
                                  : "bg-white/10"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-6"
                    />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {uploadProgress.message}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Please don&apos;t close this window...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Success Step */}
              {formStep === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12"
                >
                  <div className="text-center max-w-lg mx-auto">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                      className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/50"
                    >
                      <CheckCircle className="w-14 h-14 text-white" />
                    </motion.div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Successfully Minted! 🎉
                    </h3>
                    <p className="text-gray-400 mb-2">
                      Your dataset NFT is now live on Polkadot Asset Hub
                    </p>

                    {/* Token ID Display */}
                    {mintedTokenId !== null && (
                      <div className="inline-block px-6 py-3 bg-pink-500/20 border border-pink-500/50 rounded-xl mb-6">
                        <p className="text-sm text-gray-400">Token ID</p>
                        <p className="text-3xl font-bold text-pink-400">
                          #{mintedTokenId}
                        </p>
                      </div>
                    )}

                    {/* Transaction Link */}
                    {txHash && (
                      <div className="mt-6 flex flex-col gap-3">
                        <a
                          href={`https://blockscout-asset-hub.parity-chains-scw.parity.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-500/20 border border-pink-500/50 rounded-xl text-pink-400 hover:bg-pink-500/30 transition-colors"
                        >
                          <span>View on Explorer</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mt-8">
                      Closing automatically in 5 seconds...
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
