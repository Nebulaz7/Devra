"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  Lock,
  Database,
  Shield,
  Sparkles,
  ChevronRight,
  Tags,
  FileText,
} from "lucide-react";
import { mintDataset } from "@/lib/contractInteractions";

interface MintDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
}

type FormStep = "details" | "processing";
type ProcessStep =
  | "ai-verification"
  | "encryption"
  | "ipfs-storage"
  | "minting"
  | "success";

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
  walletAddress,
}: MintDatasetModalProps) {
  const [formStep, setFormStep] = useState<FormStep>("details");
  const [currentProcessStep, setCurrentProcessStep] =
    useState<ProcessStep | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null as File | null,
    categories: [] as string[],
  });
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string>("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processSteps = [
    {
      step: "ai-verification" as ProcessStep,
      title: "AI Verification",
      description: "Analyzing dataset quality",
      icon: Brain,
    },
    {
      step: "encryption" as ProcessStep,
      title: "Encryption",
      description: "Securing your data",
      icon: Lock,
    },
    {
      step: "ipfs-storage" as ProcessStep,
      title: "IPFS Storage",
      description: "Decentralized storage",
      icon: Database,
    },
    {
      step: "minting" as ProcessStep,
      title: "Minting NFT",
      description: "Creating your NFT",
      icon: Sparkles,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB");
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
      return;
    }

    setFormData({ ...formData, file });
    setError(null);
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleStartProcess = async () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.file ||
      formData.categories.length === 0
    ) {
      setError(
        "Please fill all fields, upload a file, and select at least one category"
      );
      return;
    }

    setError(null);
    setFormStep("processing");
    await processAIVerification();
  };

  const processAIVerification = async () => {
    setCurrentProcessStep("ai-verification");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", formData.file!);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categories", JSON.stringify(formData.categories));

      const response = await fetch("/api/verify-dataset", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("AI verification failed");

      const data = await response.json();
      setAiScore(data.score);
      await processEncryption(data.fileId);
    } catch (err: any) {
      setError(err.message || "AI verification failed");
      setFormStep("details");
    }
  };

  const processEncryption = async (fileId: string) => {
    setCurrentProcessStep("encryption");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await processIPFSStorage(fileId);
    } catch (err: any) {
      setError(err.message || "Encryption failed");
      setFormStep("details");
    }
  };

  const processIPFSStorage = async (fileId: string) => {
    setCurrentProcessStep("ipfs-storage");

    try {
      const response = await fetch("/api/store-ipfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) throw new Error("IPFS storage failed");

      const data = await response.json();
      setIpfsCid(data.cid);
      await processMinting(data.cid);
    } catch (err: any) {
      setError(err.message || "IPFS storage failed");
      setFormStep("details");
    }
  };

  const processMinting = async (cid: string) => {
    setCurrentProcessStep("minting");

    try {
      const id = await mintDataset(
        walletAddress,
        cid,
        formData.name,
        formData.description
      );

      if (!id) throw new Error("Failed to extract token ID");

      setTokenId(id);
      await updateNFTMetadata(id, aiScore!, formData.categories);
      setCurrentProcessStep("success");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 4000);
    } catch (err: any) {
      setError(err.message || "Minting failed");
      setFormStep("details");
    }
  };

  const updateNFTMetadata = async (
    tokenId: number,
    score: number,
    categories: string[]
  ) => {
    try {
      await fetch("/api/update-nft-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, aiScore: score, categories }),
      });
    } catch (err) {
      console.error("Failed to update metadata:", err);
    }
  };

  const handleClose = () => {
    if (formStep === "details" || currentProcessStep === "success") {
      setFormData({ name: "", description: "", file: null, categories: [] });
      setFormStep("details");
      setCurrentProcessStep(null);
      setAiScore(null);
      setIpfsCid("");
      setTokenId(null);
      setError(null);
      onClose();
    }
  };

  const canClose = formStep === "details" || currentProcessStep === "success";

  const getStepStatus = (step: ProcessStep) => {
    if (currentProcessStep === "success")
      return step === "success" ? "current" : "completed";
    if (!currentProcessStep) return "pending";

    const stepOrder = [
      "ai-verification",
      "encryption",
      "ipfs-storage",
      "minting",
    ];
    const currentIndex = stepOrder.indexOf(currentProcessStep);
    const stepIndex = stepOrder.indexOf(step);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

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

          <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gradient-to-br from-[#1e1d1d] to-[#2a2929] border border-pink-500/30  w-full max-h-[100vh] overflow-y-auto shadow-2xl"
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
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
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
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Tags className="w-4 h-4 text-pink-500" />
                      Categories * (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                        {formData.categories.length} categor
                        {formData.categories.length === 1 ? "y" : "ies"}{" "}
                        selected
                      </p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
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
                      className="flex-1 px-6 py-4 bg-pink-500 hover:bg-pink-500 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      Mint dataset
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
                              <CheckCircle className="w-3 h-3 text-pink-500" />
                              AI Quality Analysis
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-pink-500" />
                              Data Encryption
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-pink-500" />
                              IPFS Storage
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-pink-500" />
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
              {formStep === "processing" &&
                currentProcessStep !== "success" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8"
                  >
                    {/* Stepper */}
                    <div className="mb-12">
                      <div className="flex items-center justify-between max-w-3xl mx-auto">
                        {processSteps.map((step, index) => {
                          const status = getStepStatus(step.step);
                          const Icon = step.icon;

                          return (
                            <React.Fragment key={step.step}>
                              <div className="flex flex-col items-center relative z-10">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                                    status === "completed"
                                      ? "bg-green-500 shadow-lg shadow-green-500/50"
                                      : status === "current"
                                      ? "bg-pink-500 shadow-lg shadow-pink-500/50 animate-pulse"
                                      : "bg-white/10 border-2 border-white/20"
                                  }`}
                                >
                                  {status === "completed" ? (
                                    <CheckCircle className="w-8 h-8 text-white" />
                                  ) : status === "current" ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                  ) : (
                                    <Icon className="w-7 h-7 text-gray-500" />
                                  )}
                                </motion.div>
                                <p
                                  className={`text-sm font-semibold text-center max-w-[100px] ${
                                    status === "pending"
                                      ? "text-gray-500"
                                      : "text-white"
                                  }`}
                                >
                                  {step.title}
                                </p>
                                <p className="text-xs text-gray-500 text-center mt-1">
                                  {step.description}
                                </p>
                              </div>

                              {index < processSteps.length - 1 && (
                                <div className="flex-1 h-1 mx-2 -mt-12 relative">
                                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                                  <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{
                                      width:
                                        status === "completed" ? "100%" : "0%",
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-pink-500 rounded-full"
                                  />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Processing Message */}
                    <div className="text-center max-w-md mx-auto">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 3,
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
                        dataset NFT. This usually takes 30-60 seconds.
                      </p>
                    </div>
                  </motion.div>
                )}

              {/* Success Step */}
              {currentProcessStep === "success" && (
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

                    <div className="space-y-4 bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Token ID</span>
                        <span className="text-white font-mono font-bold text-lg">
                          #{tokenId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          AI Quality Score
                        </span>
                        <span className="text-green-400 font-bold text-lg">
                          {aiScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">IPFS CID</span>
                        <span className="text-pink-400 font-mono text-sm">
                          {ipfsCid.slice(0, 15)}...
                        </span>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <span className="text-gray-400 text-sm block mb-2">
                          Categories
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-6">
                      Closing automatically in a few seconds...
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
