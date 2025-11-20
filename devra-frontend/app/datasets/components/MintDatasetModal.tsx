"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Brain,
  Lock,
  Database,
  Shield,
  Sparkles,
  Tags,
  FileText,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMintDataset } from "@/lib/contracts/useDataset";
import { useWallet } from "@/hooks/useWallet";

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
    datasetId: "", // Add this field
  });
  const [error, setError] = useState<string | null>(null);

  const { address } = useWallet();

  const { mint } = useMintDataset({
    onSuccess: async (tokenId: number) => {
      console.log("✅ NFT minted, tokenId:", tokenId);

      toast.success(`NFT minted successfully! Token ID: ${tokenId}`, {
        id: "minting",
      });

      // Update backend with tokenId
      if (formData.datasetId) {
        try {
          await fetch(
            `https://devra-px58.onrender.com/blockchain/dataset/${formData.datasetId}/token/${tokenId}`,
            {
              method: "POST",
            }
          );
          console.log("Backend updated with tokenId");
        } catch (err) {
          console.error("Failed to update backend tokenId:", err);
        }
      }

      setFormStep("success");

      // Auto-close after success
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 3000);
    },
    onError: (err: unknown) => {
      console.error("❌ Minting failed:", err);
      let errorMessage = "Minting failed";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === "string") errorMessage = err;

      toast.error(errorMessage, { id: "minting" });
      setError(errorMessage);
      setFormStep("details");
    },
  });

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

  // 1️⃣ Define your mint hook with callbacks
  const handleStartProcess = async () => {
    const walletAddress = address;

    // 1️⃣ Check wallet
    if (!walletAddress || walletAddress.trim() === "") {
      setError("Please connect your wallet first");
      toast.error("Wallet not connected");
      return;
    }

    // 2️⃣ Validate form
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

    setError(null);
    setFormStep("processing");
    toast.loading("Uploading and verifying dataset...", { id: "minting" });

    try {
      // 3️⃣ Upload dataset to backend
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
      if (!datasetId) throw new Error("No dataset ID returned from server");

      setFormData((prev) => ({ ...prev, datasetId }));

      // 4️⃣ Wait for IPFS upload (poll backend for status)
      toast.loading("Processing and uploading to IPFS...", { id: "minting" });

      let dataset;
      let attempts = 0;
      const maxAttempts = 60;
      while (attempts < maxAttempts) {
        const statusResponse = await fetch(
          `https://devra-px58.onrender.com/blockchain/dataset/${datasetId}`
        );
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.data.status === "uploaded") {
            dataset = statusData.data;
            break;
          }
        }
        await new Promise((r) => setTimeout(r, 1000));
        attempts++;
      }

      if (!dataset || dataset.status !== "uploaded") {
        throw new Error("Dataset upload to IPFS timeout or failed");
      }

      // 5️⃣ Trigger minting
      toast.loading("Minting your dataset NFT...", { id: "minting" });
      await mint(dataset.cid); // ✅ Hook handles success/error and tokenId

      // Do NOT await tokenId here — let the hook callback handle success
      toast.loading("Awaiting blockchain confirmation...", { id: "minting" });
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
                      AI-verified and encrypted dataset minting
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

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="m-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">Error Occurred</p>
                      <p className="text-sm text-red-300/70">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Backend Integration Notice */}
              <div className="m-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-400 mb-1">
                      Backend Integration Pending
                    </p>
                    <p className="text-blue-300/70">
                      Full AI verification, encryption, and IPFS storage will be
                      implemented when backend is ready. Currently minting with
                      placeholder data.
                    </p>
                  </div>
                </div>
              </div>

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

                  {/* Actions */}
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
                        formData.categories.length === 0
                      }
                      className="flex-1 px-6 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      Mint Dataset
                    </button>
                  </div>

                  {/* Info */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/20">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                        <div className="text-sm">
                          <p className="font-semibold text-white mb-2">
                            Secure 5-Step Process:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-400">
                            <div className="flex items-center gap-2">
                              <Brain className="w-3 h-3 text-pink-500" />
                              AI Quality Analysis
                            </div>
                            <div className="flex items-center gap-2">
                              <Lock className="w-3 h-3 text-pink-500" />
                              Data Encryption
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="w-3 h-3 text-pink-500" />
                              IPFS Storage
                            </div>
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-pink-500" />
                              NFT Minting
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      Processing Your Dataset
                    </h3>
                    <p className="text-gray-400">
                      Please wait while we verify, encrypt, and mint your
                      dataset NFT...
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
                    <p className="text-gray-400 mb-8">
                      Your dataset NFT has been created and is now live on the
                      blockchain
                    </p>
                    <p className="text-sm text-gray-500">
                      Closing automatically...
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
