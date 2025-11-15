"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Tag,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { blo } from "blo";
import toast from "react-hot-toast";
import {
  useUserBalance,
  useDatasetInfo,
  useListDataset,
  useCancelListing,
} from "@/lib/contracts/useDataset";
import {
  DATASET_NFT_ADDRESS,
  formatWND,
  parseWND,
  getTxExplorerUrl,
  getTokenExplorerUrl,
} from "@/lib/contracts/config";
import Banner from "./components/Banner";
import MintDatasetModal from "./components/MintDatasetModal";
import DatasetStats from "./components/DatasetStats";

interface DatasetDisplay {
  tokenId: number;
  name: string;
  cid: string;
  score: number;
  price: bigint;
  creator: string;
  isListed: boolean;
  createdAt?: number;
}

interface ListModalData {
  tokenId: number;
  currentPrice?: string;
  isUpdate: boolean;
}

export default function Datasets() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const {
    balance: nftBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useUserBalance(address);

  const [datasets, setDatasets] = useState<DatasetDisplay[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalData, setListModalData] = useState<ListModalData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const itemsPerPage = 10;

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      router.push("/connect");
    }
  }, [isConnected, router]);

  // Fetch datasets when user connects
  useEffect(() => {
    if (address && isConnected) {
      fetchDatasets();
    }
  });

  const fetchDatasets = async () => {
    if (!address || nftBalance === 0) {
      setIsLoadingDatasets(false);
      return;
    }

    setIsLoadingDatasets(true);
    try {
      // Mock data for now - replace with actual contract calls
      // In production, you'd iterate through token IDs and fetch data for each
      const mockDatasets: DatasetDisplay[] = [];

      // TODO: Implement actual dataset fetching
      // for (let i = 1; i <= nftBalance; i++) {
      //   const dataset = await useDatasetInfo(i);
      //   if (dataset) mockDatasets.push(dataset);
      // }

      setDatasets(mockDatasets);
      toast.success(`Loaded ${mockDatasets.length} datasets`);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Failed to load datasets");
    } finally {
      setIsLoadingDatasets(false);
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
    const totalDatasets = nftBalance;
    const listedCount = datasets.filter((d) => d.isListed).length;
    const avgQuality =
      datasets.length > 0
        ? `${Math.round(
            datasets.reduce((acc, d) => acc + d.score, 0) / datasets.length
          )}%`
        : "0%";
    const totalValue = datasets
      .filter((d) => d.isListed && d.price)
      .reduce((acc, d) => acc + parseFloat(formatWND(d.price)), 0)
      .toFixed(4);

    return { totalDatasets, listedCount, avgQuality, totalValue };
  };

  const totalPages = Math.ceil(datasets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDatasets = datasets.slice(startIndex, endIndex);
  const stats = calculateStats();

  const getStatusBadge = (score: number) => {
    if (score >= 80)
      return {
        label: "Verified",
        color: "bg-green-500/10 text-green-500 border-green-500/20",
      };
    if (score >= 50)
      return {
        label: "Pending",
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      };
    return {
      label: "Failed",
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    };
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Recently";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-400">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-black text-white">
      <Banner />
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <DatasetStats
          totalDatasets={stats.totalDatasets}
          listedCount={stats.listedCount}
          totalValue={stats.totalValue}
          avgQuality={stats.avgQuality}
          isLoading={isLoadingBalance}
        />

        {/* Datasets Table */}
        <div className="rounded-2xl border border-pink-500/20 overflow-hidden bg-black/40 backdrop-blur-sm">
          <div className="flex border-b border-pink-500/20 px-6 py-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-xl">
                <Database className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  My Datasets
                </h2>
                <p className="text-xs text-gray-400">
                  {nftBalance} dataset{nftBalance === 1 ? "" : "s"} owned
                </p>
              </div>
            </div>
            <div>
              <motion.button
                onClick={() => setMintModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium flex items-center gap-2 transition-all shadow-lg shadow-pink-500/25"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Upload Dataset</span>
                <span className="sm:hidden">Upload</span>
              </motion.button>
            </div>
          </div>

          {isLoadingDatasets || isLoadingBalance ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Loading your datasets...
                </p>
              </div>
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FolderOpen className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No datasets yet
              </h3>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Start by minting your first dataset NFT. Upload, verify, and
                tokenize your data on the blockchain.
              </p>
              <button
                onClick={() => setMintModalOpen(true)}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 cursor-pointer text-white rounded-full transition-colors font-medium flex items-center gap-2 shadow-lg shadow-pink-500/25"
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Dataset
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-500/10">
                    {currentDatasets.map((dataset) => {
                      const statusBadge = getStatusBadge(dataset.score);
                      const isProcessing = actionLoading === dataset.tokenId;
                      const avatarUrl = blo(dataset.creator as `0x${string}`);

                      return (
                        <motion.tr
                          key={dataset.tokenId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={avatarUrl}
                                  alt="Creator"
                                  className="w-10 h-10 rounded-lg border-2 border-pink-500/20"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                                  <Database className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white group-hover:text-pink-500 transition-colors">
                                  Dataset #{dataset.tokenId}
                                </p>
                                <p className="text-xs text-gray-400 font-mono">
                                  {dataset.cid.slice(0, 8)}...
                                  {dataset.cid.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                                  style={{ width: `${dataset.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-white">
                                {dataset.score}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {dataset.isListed ? (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold text-white">
                                  {formatWND(dataset.price)} WND
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
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      window.open(
                                        getTokenExplorerUrl(dataset.tokenId),
                                        "_blank"
                                      );
                                      toast.success("Opening in explorer");
                                    }}
                                    className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group"
                                    title="View on Explorer"
                                  >
                                    <ExternalLink className="w-4 h-4 text-blue-500" />
                                  </button>
                                  {dataset.isListed ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          openListModal(
                                            dataset.tokenId,
                                            formatWND(dataset.price)
                                          )
                                        }
                                        className="p-2 hover:bg-yellow-500/10 rounded-lg transition-colors group"
                                        title="Update Price"
                                      >
                                        <Edit className="w-4 h-4 text-yellow-500" />
                                      </button>
                                      <CancelListingButton
                                        tokenId={dataset.tokenId}
                                        onSuccess={fetchDatasets}
                                        onLoading={(loading) =>
                                          setActionLoading(
                                            loading ? dataset.tokenId : null
                                          )
                                        }
                                      />
                                    </>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        openListModal(dataset.tokenId)
                                      }
                                      className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 border border-pink-500/20"
                                    >
                                      <Tag className="w-4 h-4" />
                                      List
                                    </button>
                                  )}
                                </>
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
                <div className="px-6 py-4 border-t border-pink-500/20 flex items-center justify-between bg-white/5">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, datasets.length)} of {datasets.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          refetchBalance();
          fetchDatasets();
          toast.success("Dataset minted successfully!");
        }}
      />

      {/* List/Update Price Modal */}
      <ListPriceModal
        isOpen={listModalOpen}
        onClose={() => {
          setListModalOpen(false);
          setListModalData(null);
        }}
        tokenId={listModalData?.tokenId}
        currentPrice={listModalData?.currentPrice}
        isUpdate={listModalData?.isUpdate || false}
        onSuccess={fetchDatasets}
      />
    </div>
  );
}

// Cancel Listing Button Component
function CancelListingButton({
  tokenId,
  onSuccess,
  onLoading,
}: {
  tokenId: number;
  onSuccess: () => void;
  onLoading: (loading: boolean) => void;
}) {
  const { cancel, isPending, isSuccess } = useCancelListing();

  useEffect(() => {
    onLoading(isPending);
  }, [isPending, onLoading]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Listing cancelled successfully!");
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this listing?")) return;

    try {
      await cancel(tokenId);
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error(error.message || "Failed to cancel listing");
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group disabled:opacity-50"
      title="Cancel Listing"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <XIcon className="w-4 h-4 text-red-500" />
      )}
    </button>
  );
}

// List Price Modal Component
function ListPriceModal({
  isOpen,
  onClose,
  tokenId,
  currentPrice,
  isUpdate,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  tokenId?: number;
  currentPrice?: string;
  isUpdate: boolean;
  onSuccess: () => void;
}) {
  const [price, setPrice] = useState(currentPrice || "");
  const { list, isPending, isSuccess } = useListDataset();

  useEffect(() => {
    if (isOpen) {
      setPrice(currentPrice || "");
    }
  }, [isOpen, currentPrice]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(isUpdate ? "Price updated!" : "Listed successfully!");
      onSuccess();
      onClose();
    }
  }, [isSuccess, isUpdate, onSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId || parseFloat(price) <= 0) return;

    try {
      await list(tokenId, price);
    } catch (error: any) {
      console.error("List error:", error);
      toast.error(error.message || "Failed to list dataset");
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
              className="bg-gradient-to-br from-[#1e1d1d] to-[#2a2929] rounded-2xl border border-pink-500/20 max-w-md w-full shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Tag className="w-6 h-6 text-pink-500" />
                  {isUpdate ? "Update Price" : "List for Sale"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Set the price in WND tokens
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Price (WND)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.0000"
                      disabled={isPending}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      WND
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum: 0.0001 WND
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 border border-white/10 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !price || parseFloat(price) <= 0}
                    className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-pink-500/25"
                  >
                    {isPending ? (
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
