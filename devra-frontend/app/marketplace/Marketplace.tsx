"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  Loader2,
  Package,
  TrendingUp,
  Star,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useAllDatasets } from "@/lib/contracts/useDataset";
import Banner from "./components/Banner";
import DatasetCard from "./components/DatasetCard";

const CATEGORIES = [
  "All",
  "Medicine",
  "Computer Vision",
  "NLP",
  "Finance",
  "Audio",
  "Gaming",
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Listed", icon: Clock },
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "price-low", label: "Price: Low to High", icon: Star },
  { value: "price-high", label: "Price: High to Low", icon: Star },
];

interface Dataset {
  tokenId: number;
  name?: string;
  creator: string;
  price: bigint;
  score: number;
  cid: string;
  isListed: boolean;
}

const Marketplace = () => {
  const { address, isConnected } = useAccount();
  
  // Use the new hook to fetch all datasets
  const { 
    datasets: allDatasets, 
    isLoading, 
    refetch: refetchDatasets,
    refetchTotal 
  } = useAllDatasets();

  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort whenever datasets or filters change
  useEffect(() => {
    filterAndSortDatasets();
  }, [allDatasets, searchQuery, selectedCategory, sortBy]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing marketplace...", { id: "refresh" });

    // Refetch total supply and datasets
    await refetchTotal();
    await refetchDatasets();

    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Marketplace refreshed!", { id: "refresh" });
    }, 1000);
  };

  const filterAndSortDatasets = () => {
    // Only show listed datasets
    let filtered = allDatasets.filter((d) => d.isListed);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.tokenId.toString().includes(searchQuery) ||
          d.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter (would need category data from backend/metadata)
    // if (selectedCategory !== "All") {
    //   filtered = filtered.filter(d => d.category === selectedCategory);
    // }

    // Sorting
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.score - a.score);
        break;
      case "price-low":
        filtered.sort((a, b) => Number(a.price - b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => Number(b.price - a.price));
        break;
      case "recent":
      default:
        filtered.sort((a, b) => b.tokenId - a.tokenId);
        break;
    }

    setFilteredDatasets(filtered);
  };

  const handlePurchase = (dataset: Dataset) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    // TODO: Implement purchase logic with useBuyDataset hook
    toast.success(`Purchasing Dataset #${dataset.tokenId}...`);
  };

  const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortBy);

  return (
    <div className="min-h-screen bg-black">
      <Banner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, token ID, or creator..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:border-pink-500/50 transition-all min-w-[200px] justify-between"
              >
                {currentSort && (
                  <>
                    <currentSort.icon className="w-5 h-5 text-pink-500" />
                    <span className="flex-1 text-left">
                      {currentSort.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 w-full bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowFilters(false);
                          toast.success(`Sorted by ${option.label}`);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                          sortBy === option.value
                            ? "bg-pink-500/10 text-pink-500"
                            : "text-white"
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory(category);
                  toast.success(`Filtered by ${category}`);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400">
              {filteredDatasets.length} dataset
              {filteredDatasets.length === 1 ? "" : "s"} found
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-1 text-pink-500 hover:text-pink-400 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading marketplace...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredDatasets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Datasets Found
            </h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : "No datasets are currently listed for sale. Mint and list your first dataset to get started!"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-all"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}

        {/* Dataset Grid */}
        {!isLoading && filteredDatasets.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDatasets.map((dataset) => (
              <DatasetCard
                key={dataset.tokenId}
                dataset={dataset}
                onPurchase={() => handlePurchase(dataset)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;