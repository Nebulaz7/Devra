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
} from "lucide-react";
import { mintDataset } from "@/lib/contractInteractions";

interface MintDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
}

type Step =
  | "upload"
  | "ai-verification"
  | "encryption"
  | "ipfs-storage"
  | "minting"
  | "success";

interface StepStatus {
  step: Step;
  title: string;
  description: string;
  icon: React.ElementType;
  status: "pending" | "processing" | "completed" | "error";
}

export default function MintDatasetModal({
  isOpen,
  onClose,
  onSuccess,
  walletAddress,
}: MintDatasetModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null as File | null,
  });
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string>("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps: StepStatus[] = [
    {
      step: "upload",
      title: "Upload Dataset",
      description: "Select and upload your dataset file",
      icon: Upload,
      status:
        currentStep === "upload"
          ? "processing"
          : formData.file
          ? "completed"
          : "pending",
    },
    {
      step: "ai-verification",
      title: "AI Verification",
      description: "AI model analyzes dataset quality",
      icon: Brain,
      status:
        currentStep === "ai-verification"
          ? "processing"
          : aiScore !== null
          ? "completed"
          : "pending",
    },
    {
      step: "encryption",
      title: "Encryption",
      description: "Securing your dataset",
      icon: Lock,
      status:
        currentStep === "encryption"
          ? "processing"
          : currentStep === "ipfs-storage" ||
            currentStep === "minting" ||
            currentStep === "success"
          ? "completed"
          : "pending",
    },
    {
      step: "ipfs-storage",
      title: "IPFS Storage",
      description: "Storing on decentralized network",
      icon: Database,
      status:
        currentStep === "ipfs-storage"
          ? "processing"
          : ipfsCid
          ? "completed"
          : "pending",
    },
    {
      step: "minting",
      title: "Minting NFT",
      description: "Creating your dataset NFT",
      icon: Sparkles,
      status:
        currentStep === "minting"
          ? "processing"
          : currentStep === "success"
          ? "completed"
          : "pending",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB");
      return;
    }

    // Validate file type
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

  const handleStartProcess = async () => {
    if (!formData.name || !formData.description || !formData.file) {
      setError("Please fill all fields and upload a file");
      return;
    }

    setError(null);
    await processAIVerification();
  };

  // Step 2: AI Verification
const processAIVerification = async () => {
  setCurrentStep("ai-verification");

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("file", formData.file!);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);

    const response = await fetch("http://localhost:5000/datasets/verify", {
      method: "POST",
      body: formDataToSend,
    });

    if (!response.ok) throw new Error("AI verification failed");

    const data = await response.json();
    console.log("✅ Verification result:", data);

    const score =
      data.verification?.scores
        ? Object.values(data.verification.scores)[0] ?? null
        : null;

    setAiScore(score as number | null);

    // ⚠️ Here's the important fix:
    // data.fileData is the base64-encoded dataset buffer
    await processEncryption(data.fileData);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "AI verification failed");
    setCurrentStep("upload");
  }
};

  // Step 3 & 4: Encryption and IPFS Storage
const processEncryption = async (base64File: string) => {
  setCurrentStep("encryption");

  try {
    const response = await fetch("http://localhost:5000/datasets/encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64File }), // send base64 data here
    });

    if (!response.ok) throw new Error("Encryption failed");

    const data = await response.json();
    console.log("🔐 Encryption result:", data);

    // Now pass the encrypted file path to next step
    await processIPFSStorage(data.encryption.encryptedPath);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Encryption failed");
    setCurrentStep("upload");
  }
};

const processIPFSStorage = async (filePath: string) => {
  setCurrentStep("ipfs-storage");

  try {
    const response = await fetch("http://localhost:5000/datasets/store-ipfs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath }), // renamed correctly
    });

    if (!response.ok) throw new Error("IPFS storage failed");

    const data = await response.json();
    console.log("🌐 IPFS upload result:", data);

    setIpfsCid(data.cid);

    // Proceed to minting (you already have this)
    await processMinting(data.cid);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "IPFS storage failed");
    setCurrentStep("upload");
  }
};

  // Step 5, 6, 7: Mint NFT and Update with AI Score
  const processMinting = async (cid: string) => {
    setCurrentStep("minting");

    try {
      // Mint the NFT on blockchain
      const id = await mintDataset(
        walletAddress,
        cid,
        formData.name,
        formData.description
      );

      if (!id) {
        throw new Error("Failed to extract token ID");
      }

      setTokenId(id);

      // Update NFT with AI score
      await updateNFTMetadata(id, aiScore!);

      // Success!
      setCurrentStep("success");

      // Auto-close and refresh after 4 seconds
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Minting failed");
      setCurrentStep("upload");
    }
  };

  const updateNFTMetadata = async (tokenId: number, score: number) => {
    try {
      // Call backend to update NFT attributes with AI score
      await fetch("/api/update-nft-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, aiScore: score }),
      });
    } catch (err) {
      console.error("Failed to update metadata:", err);
      // Don't fail the entire process if metadata update fails
    }
  };

  const handleClose = () => {
    if (currentStep === "upload" || currentStep === "success") {
      setFormData({ name: "", description: "", file: null });
      setCurrentStep("upload");
      setAiScore(null);
      setIpfsCid("");
      setTokenId(null);
      setError(null);
      onClose();
    }
  };

  const getStepIcon = (step: StepStatus) => {
    const Icon = step.icon;
    if (step.status === "completed") {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (step.status === "processing") {
      return <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />;
    }
    return <Icon className="w-5 h-5 text-gray-500" />;
  };

  const canClose = currentStep === "upload" || currentStep === "success";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={canClose ? handleClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1e1d1d] border border-pink-500/20 w-full max-h-[100vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-pink-500" />
                    Mint Dataset NFT
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    AI-verified and encrypted dataset minting
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={!canClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="p-6 bg-white/5">
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                        step.status === "completed"
                          ? "bg-green-500/10 border-green-500/30"
                          : step.status === "processing"
                          ? "bg-pink-500/10 border-pink-500/50 shadow-lg shadow-pink-500/20"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex-shrink-0">{getStepIcon(step)}</div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            step.status === "completed"
                              ? "text-green-500"
                              : step.status === "processing"
                              ? "text-pink-500"
                              : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {step.description}
                        </p>
                      </div>
                      {step.status === "completed" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-red-500 font-medium">Error</p>
                      <p className="text-sm text-red-400/70">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Success State */}
              {currentStep === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-6 mt-4 p-6 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Successfully Minted!
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-400">
                        Token ID: <span className="font-mono">{tokenId}</span>
                      </p>
                      <p className="text-green-400">
                        AI Quality Score:{" "}
                        <span className="font-bold">{aiScore}%</span>
                      </p>
                      <p className="text-green-400">
                        IPFS CID:{" "}
                        <span className="font-mono text-xs">
                          {ipfsCid.slice(0, 20)}...
                        </span>
                      </p>
                    </div>
                    <p className="text-gray-400 mt-4 text-xs">
                      Closing automatically...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Form - Only show on upload step */}
              {currentStep === "upload" && (
                <div className="p-6 space-y-6">
                  {/* Dataset Name */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Dataset Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Medical Records Q4 2024"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
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
                      placeholder="Describe your dataset..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 resize-none"
                      required
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
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
                        className="flex items-center justify-center gap-3 w-full px-4 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:border-pink-500/50 transition-all cursor-pointer"
                      >
                        {formData.file ? (
                          <div className="text-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-white font-medium">
                              {formData.file.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-pink-500" />
                            <div className="text-center">
                              <p className="text-white font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-sm text-gray-400">
                                ZIP, CSV, or JSON (max 100MB)
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleStartProcess}
                      disabled={
                        !formData.name ||
                        !formData.description ||
                        !formData.file
                      }
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-500/50"
                    >
                      <Sparkles className="w-4 h-4" />
                      Start Minting Process
                    </button>
                  </div>

                  {/* Info */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3 text-xs text-gray-400">
                      <Shield className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-white mb-1">
                          Secure Minting Process:
                        </p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>AI verification analyzes dataset quality</li>
                          <li>Dataset is encrypted before storage</li>
                          <li>
                            Stored on decentralized IPFS via Crust Network
                          </li>
                          <li>NFT minted with AI score metadata</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing State */}
              {currentStep !== "upload" && currentStep !== "success" && (
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-white font-medium mb-2">
                    Processing your dataset...
                  </p>
                  <p className="text-sm text-gray-400">
                    This may take a few moments. Please dont close this window.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
