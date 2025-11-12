"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  TrendingUp,
  Shield,
  ExternalLink,
  Sparkles,
  CheckCircle,
  Database,
} from "lucide-react";
import { blo } from "blo";
import { formatWND } from "@/lib/contracts/config";
import toast from "react-hot-toast";

interface DatasetCardProps {
  dataset: {
    tokenId: number;
    name?: string;
    creator: string;
    price: bigint;
    score: number;
    cid: string;
    isListed: boolean;
  };
  onPurchase: () => void;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, onPurchase }) => {
  const avatarUrl = blo(dataset.creator as `0x${string}`);

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getQualityBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, scale: 1.0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-gradient-to-br from-gray-900 to-black border border-pink-500/20 rounded-2xl overflow-hidden hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/20 transition-all"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />

      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Creator"
                className="w-14 h-14 rounded-xl border-2 border-pink-500/30 group-hover:border-pink-500/60 transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center border-2 border-black">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate group-hover:text-pink-500 transition-colors">
                {dataset.name || `Dataset #${dataset.tokenId}`}
              </h3>
              <p className="text-gray-400 text-xs font-mono truncate">
                {dataset.creator.slice(0, 6)}...{dataset.creator.slice(-4)}
              </p>
            </div>
          </div>

          {/* Quality Badge */}
          <div
            className={`px-3 py-1.5 rounded-full border ${getQualityBg(
              dataset.score
            )}`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles
                className={`w-3.5 h-3.5 ${getQualityColor(dataset.score)}`}
              />
              <span
                className={`text-xs font-bold ${getQualityColor(
                  dataset.score
                )}`}
              >
                {dataset.score}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 group-hover:border-pink-500/20 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-xs text-gray-500">Token ID</p>
            </div>
            <p className="text-white font-bold text-sm">#{dataset.tokenId}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10 group-hover:border-pink-500/20 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <p className="text-xs text-gray-500">Status</p>
            </div>
            <p className="text-green-400 font-bold text-sm">Verified</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10 group-hover:border-pink-500/20 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <p className="text-xs text-gray-500">Score</p>
            </div>
            <p
              className={`font-bold text-sm ${getQualityColor(dataset.score)}`}
            >
              {dataset.score >= 80
                ? "High"
                : dataset.score >= 60
                ? "Good"
                : "Fair"}
            </p>
          </div>
        </div>

        {/* CID Preview */}
        {/* <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs text-gray-500 mb-1">IPFS CID</p>
          <p className="text-white font-mono text-xs truncate">
            {dataset.cid.startsWith("0x") ? dataset.cid.slice(2) : dataset.cid}
          </p>
        </div> */}

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white group-hover:text-pink-500 transition-colors">
                {formatWND(dataset.price)}
              </span>
              <span className="text-sm text-gray-400">WND</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.0 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPurchase}
            className="px-5 py-3  cursor-pointer bg-pink-500  hover:bg-pink-600 text-white rounded-full font-medium flex items-center gap-2 shadow-sm shadow-pink-500/25 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Now
          </motion.button>
        </div>

        {/* View Details Link */}
        <Link
          href={`/marketplace/${dataset.tokenId}`}
          passHref
          onClick={() => {
            toast.success("Opening dataset details...");
            // Navigate to details page
          }}
          className="w-full py-2 text-sm cursor-pointer text-gray-400 hover:text-pink-500 transition-colors flex items-center justify-center gap-1 group/link"
        >
          View Details
          <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default DatasetCard;
