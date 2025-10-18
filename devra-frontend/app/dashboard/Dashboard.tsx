"use client";

import React from "react";
import { FileText, Coins, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: "up" | "down";
  trendValue?: string;
}

const StatCard = ({ icon, title, value, trend, trendValue }: StatCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all shadow-lg"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-2.5 bg-white/5 rounded-lg">{icon}</div>
      {trend && trendValue && (
        <div
          className={`flex items-center gap-1 text-xs ${
            trend === "up" ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend === "up" && <TrendingUp className="w-3 h-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{title}</div>
  </motion.div>
);

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back! Here&apos;s an overview of your activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FileText className="w-6 h-6 text-[#ec4899]" />}
          title="Total Datasets"
          value="24"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-[#6366f1]" />}
          title="Active Listings"
          value="8"
        />
        <StatCard
          icon={<Coins className="w-6 h-6 text-[#10b981]" />}
          title="Total Earned"
          value="1,250"
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          icon={<Coins className="w-6 h-6 text-[#f97316]" />}
          title="Total Spent"
          value="850"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            {
              title: "Healthcare Dataset Purchased",
              time: "2 hours ago",
              status: "completed",
            },
            {
              title: "Climate Data Listed",
              time: "5 hours ago",
              status: "pending",
            },
            {
              title: "Financial Records Verified",
              time: "1 day ago",
              status: "completed",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {activity.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  activity.status === "completed"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
