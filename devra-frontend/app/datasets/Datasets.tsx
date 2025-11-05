"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  Database,
  Plus,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  DollarSign,
  Edit,
  X as XIcon,
  Loader2,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CONTRACT_ADDRESS } from "../contracts/contractAddress";
import { CONTRACT_ABI } from "../contracts/devraDatasets";
import Banner from "./components/Banner";
import MintDatasetModal from "./components/MintDatasetModal";
import DatasetStats from "./components/DatasetStats";

interface BlockchainDataset {
  tokenId: number;
  name: string;
  description: string;
  ipfsCid: string;
  aiScore: number;
  status: number;
  createdAt: bigint;
  creator: string;
  isListed: boolean;
  price?: string;
  seller?: string;
}

interface ListModalData {
  tokenId: number;
  currentPrice?: string;
  isUpdate: boolean;
}

export default function Datasets() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [datasets, setDatasets] = useState<BlockchainDataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalData, setListModalData] = useState<ListModalData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    checkWalletAndFetchData();
  }, []);

  const checkWalletAndFetchData = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      router.push("/connect");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      if (accounts.length === 0 || Number(network.chainId) !== 1287) {
        router.push("/connect");
        return;
      }

      const address = accounts[0].address;
      setWalletAddress(address);
      await fetchDatasets(address, provider);
    } catch (error) {
      console.error("Error:", error);
      router.push("/connect");
    }
  };

  const fetchDatasets = async (
    address: string,
    provider: ethers.BrowserProvider
  ) => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      // Get all token IDs owned by user
      const tokenIds: bigint[] = await contract.getTokensByOwner(address);

      // Fetch details for each token
      const datasetPromises = tokenIds.map(async (tokenId) => {
        const info = await contract.getDatasetInfo(tokenId);
        const listingInfo = await contract.getListingInfo(tokenId);

        return {
          tokenId: Number(tokenId),
          name: info.name,
          description: info.description,
          ipfsCid: info.ipfsCid,
          aiScore: Number(info.aiScore),
          status: Number(info.status),
          createdAt: info.createdAt,
          creator: info.originalCreator,
          isListed: listingInfo.isActive,
          price: listingInfo.isActive
            ? ethers.formatEther(listingInfo.price)
            : undefined,
          seller: listingInfo.seller,
        };
      });

      const fetchedDatasets = await Promise.all(datasetPromises);
      setDatasets(fetchedDatasets);
    } catch (error) {
      console.error("Error fetching datasets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListForSale = async (tokenId: number, priceInEther: string) => {
    if (!walletAddress) return;

    setActionLoading(tokenId);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const priceInWei = ethers.parseEther(priceInEther);
      const tx = await contract.listForSale(
        tokenId,
        priceInWei,
        ethers.ZeroAddress
      );
      await tx.wait();

      // Refresh data
      await fetchDatasets(walletAddress, provider);
      setListModalOpen(false);
      setListModalData(null);
    } catch (error: any) {
      console.error("Error listing:", error);
      alert(error.message || "Failed to list dataset");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePrice = async (tokenId: number, newPrice: string) => {
    if (!walletAddress) return;

    setActionLoading(tokenId);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const priceInWei = ethers.parseEther(newPrice);
      const tx = await contract.updatePrice(tokenId, priceInWei);
      await tx.wait();

      await fetchDatasets(walletAddress, provider);
      setListModalOpen(false);
      setListModalData(null);
    } catch (error: any) {
      console.error("Error updating price:", error);
      alert(error.message || "Failed to update price");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelListing = async (tokenId: number) => {
    if (!walletAddress) return;
    if (!confirm("Are you sure you want to cancel this listing?")) return;

    setActionLoading(tokenId);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const tx = await contract.cancelListing(tokenId);
      await tx.wait();

      await fetchDatasets(walletAddress, provider);
    } catch (error: any) {
      console.error("Error canceling:", error);
      alert(error.message || "Failed to cancel listing");
    } finally {
      setActionLoading(null);
    }
  };

  const openListModal = (tokenId: number, currentPrice?: string) => {
    setListModalData({
      tokenId,
      currentPrice,
      isUpdate: !!currentPrice,
    });
    setListModalOpen(true);
  };

  const calculateStats = () => {
    const totalDatasets = datasets.length;
    const avgQuality =
      datasets.length > 0
        ? `${Math.round(
            datasets.reduce((acc, d) => acc + d.aiScore, 0) / datasets.length
          )}%`
        : "0%";
    const totalValue = datasets
      .filter((d) => d.isListed && d.price)
      .reduce((acc, d) => acc + parseFloat(d.price!), 0)
      .toFixed(2);

    return { totalDatasets, avgQuality, totalValue };
  };

  const totalPages = Math.ceil(datasets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDatasets = datasets.slice(startIndex, endIndex);
  const stats = calculateStats();

  const getStatusBadge = (status: number) => {
    const badges = {
      0: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500" },
      1: { label: "Verified", color: "bg-green-500/10 text-green-500" },
      2: { label: "Failed", color: "bg-red-500/10 text-red-500" },
      3: { label: "Rejected", color: "bg-gray-500/10 text-gray-500" },
    };
    return badges[status as keyof typeof badges] || badges[0];
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-black text-white">
      <Banner />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Mint Button */}

        {/* <motion.button
            onClick={() => setMintModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-medium flex items-center gap-2 transition-all"
          >
            <Upload className="w-5 h-5" />
            Mint New Dataset
          </motion.button> */}

        {/* Stats */}
        <DatasetStats
          totalDatasets={stats.totalDatasets}
          totalValue={stats.totalValue}
          avgQuality={stats.avgQuality}
          isLoading={isLoading}
        />

        {/* Datasets Table */}
        <div className="rounded-2xl border border-pink-500/20 overflow-hidden bg-black/40 backdrop-blur-sm">
          <div className="flex border-b border-pink-500/20 px-6 py-4 items-center justify-between">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Datasets
            </h1>
            <div>
              <motion.button
                onClick={() => setMintModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r cursor-pointer bg-pink-500/90 hover:bg-pink-600 text-white rounded-full font-medium flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Upload Dataset
              </motion.button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FolderOpen className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No datasets yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start by minting your first dataset NFT
              </p>
              <button
                onClick={() => setMintModalOpen(true)}
                className="px-6 py-3 bg-pink-500/90 hover:bg-pink-600 cursor-pointer text-white rounded-full transition-colors font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload Dataset
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-pink-500/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
                        Dataset
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-500/10">
                    {currentDatasets.map((dataset) => {
                      const statusBadge = getStatusBadge(dataset.status);
                      const isProcessing = actionLoading === dataset.tokenId;

                      return (
                        <motion.tr
                          key={dataset.tokenId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                <Database className="w-5 h-5 text-pink-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {dataset.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Token #{dataset.tokenId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-pink-500" />
                              <span className="text-sm font-semibold text-white">
                                {dataset.aiScore}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {dataset.isListed ? (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold text-white">
                                  {dataset.price} DEV
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                Not listed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {formatDate(dataset.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                              ) : dataset.isListed ? (
                                <>
                                  <button
                                    onClick={() =>
                                      openListModal(
                                        dataset.tokenId,
                                        dataset.price
                                      )
                                    }
                                    className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group"
                                    title="Update Price"
                                  >
                                    <Edit className="w-4 h-4 text-blue-500" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCancelListing(dataset.tokenId)
                                    }
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                                    title="Cancel Listing"
                                  >
                                    <XIcon className="w-4 h-4 text-red-500" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openListModal(dataset.tokenId)}
                                  className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                  <Tag className="w-4 h-4" />
                                  List for Sale
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-pink-500/20 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, datasets.length)} of {datasets.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-pink-500 text-white"
                                : "hover:bg-white/10 text-gray-400"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mint Modal */}
      <MintDatasetModal
        isOpen={mintModalOpen}
        onClose={() => setMintModalOpen(false)}
        onSuccess={() => {
          if (walletAddress) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            fetchDatasets(walletAddress, provider);
          }
        }}
        walletAddress={walletAddress}
      />

      {/* List/Update Price Modal */}
      <ListPriceModal
        isOpen={listModalOpen}
        onClose={() => {
          setListModalOpen(false);
          setListModalData(null);
        }}
        onSubmit={(price) => {
          if (listModalData) {
            if (listModalData.isUpdate) {
              handleUpdatePrice(listModalData.tokenId, price);
            } else {
              handleListForSale(listModalData.tokenId, price);
            }
          }
        }}
        currentPrice={listModalData?.currentPrice}
        isUpdate={listModalData?.isUpdate || false}
        isLoading={actionLoading !== null}
      />
    </div>
  );
}

// List Price Modal Component
function ListPriceModal({
  isOpen,
  onClose,
  onSubmit,
  currentPrice,
  isUpdate,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (price: string) => void;
  currentPrice?: string;
  isUpdate: boolean;
  isLoading: boolean;
}) {
  const [price, setPrice] = useState(currentPrice || "");

  useEffect(() => {
    if (isOpen) {
      setPrice(currentPrice || "");
    }
  }, [isOpen, currentPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(price) > 0) {
      onSubmit(price);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e1d1d] rounded-2xl border border-pink-500/20 max-w-md w-full"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">
                  {isUpdate ? "Update Price" : "List for Sale"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Set the price in DEV tokens
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Price (DEV)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !price || parseFloat(price) <= 0}
                    className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : isUpdate ? (
                      "Update Price"
                    ) : (
                      "List Dataset"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
