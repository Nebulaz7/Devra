import React from "react";
import {
  Database,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

interface DatasetStatsProps {
  totalDatasets: number;
  listedCount: number;
  avgQuality: string;
  totalValue: string;
  isLoading?: boolean;
}

export default function DatasetStats({
  totalDatasets,
  listedCount,
  avgQuality,
  totalValue,
  isLoading = false,
}: DatasetStatsProps) {
  const stats = [
    {
      label: "Total Datasets",
      value: totalDatasets.toString(),
      icon: Database,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
    {
      label: "Listed for Sale",
      value: listedCount.toString(),
      icon: ShoppingBag,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Avg Quality",
      value: avgQuality,
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Total Value",
      value: `${totalValue} WND`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-black/60 backdrop-blur-sm rounded-xl p-6 border ${stat.borderColor} hover:border-pink-500/40 transition-all group cursor-pointer hover:shadow-lg hover:shadow-pink-500/10`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-2">{stat.label}</p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-white group-hover:text-pink-500 transition-colors">
                  {stat.value}
                </p>
              )}
            </div>
            <div
              className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform`}
            >
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
