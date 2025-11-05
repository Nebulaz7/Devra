import React from "react";
import {
  Database,
  FileText,
  CheckCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface DatasetStatsProps {
  totalDatasets: number;
  totalValue: string;
  avgQuality: string;
  isLoading?: boolean;
}

export default function DatasetStats({
  totalDatasets,
  totalValue,
  avgQuality,
  isLoading = false,
}: DatasetStatsProps) {
  const stats = [
    {
      label: "Total Datasets",
      value: totalDatasets.toString(),
      icon: Database,
      color: "text-pink-600",
    },
    {
      label: "Listed for Sale",
      value: "0", // Will be calculated from blockchain
      icon: FileText,
      color: "text-pink-600",
    },
    {
      label: "Avg Quality",
      value: avgQuality,
      icon: CheckCircle,
      color: "text-pink-600",
    },
    {
      label: "Total Value",
      value: `${totalValue} DEV`,
      icon: TrendingUp,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">{stat.label}</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              ) : (
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              )}
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
