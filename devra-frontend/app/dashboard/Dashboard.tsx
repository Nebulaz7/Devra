"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  User,
  Database,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProfileBannerProps {
  walletAddress: string;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  link?: string;
}

interface Transaction {
  id: string;
  type: "mint" | "purchase" | "sale";
  dataset: string;
  amount: string;
  timestamp: string;
  status: "completed" | "pending";
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}

const Avatar = ({ size }: { address: string; size: number }) => {
  return (
    <div
      className="rounded-full sm:rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
      style={{
        width: size,
        height: size,
        borderRadius: `50%`,
        fontSize: size / 6,
      }}
    >
      <Image
        src="avatars/love.svg"
        alt="User Avatar"
        width={size}
        height={size}
      />
    </div>
  );
};

const ProfileBanner = ({ walletAddress }: ProfileBannerProps) => {
  // Use a default size for SSR, then update on client
  const [avatarSize, setAvatarSize] = useState(120);

  useEffect(() => {
    // Only run on client side
    const updateSize = () => {
      if (window.innerWidth < 640) {
        setAvatarSize(72);
      } else if (window.innerWidth < 1024) {
        setAvatarSize(100);
      } else {
        setAvatarSize(120);
      }
    };

    // Set initial size
    updateSize();

    // Update on resize
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-16 sm:mb-20 lg:mb-24"
    >
      {/* Banner Background */}
      <div
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='oklch(65.6% 0.241 354.308)'/%3E%3C/svg%3E")`,
        }}
        className="h-32 sm:h-40 lg:h-48 relative border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Profile Info */}
      <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-6 lg:left-8 right-4 sm:right-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative">
            <div
              style={{
                borderRadius: `50%`,
              }}
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl bg-[#0f0f17] p-0.5 sm:p-1 border-2 border-white/20 shadow-xl"
            >
              <Avatar address={walletAddress} size={avatarSize} />
            </div>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#0f0f17] flex items-center justify-center border-2 border-pink-500 shadow-lg">
              <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-500" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
              <span className="hidden sm:inline">
                {walletAddress.slice(0, 8)}...
              </span>
              <span className="sm:hidden">{walletAddress.slice(0, 6)}...</span>
            </h1>
            <button
              onClick={() =>
                window.open(
                  //      `https://calibration.filscan.io/address/${walletAddress}`,
                  "_blank",
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs sm:text-sm w-fit text-gray-300 hover:text-white group"
            >
              <span className="font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  link,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...(link
        ? {
            onClick: () => (window.location.href = link),
            style: { cursor: "pointer" },
          }
        : {})}
      className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 md:p-6 hover:border-pink-500/30 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="p-2 sm:p-2.5 rounded-lg bg-pink-500/10 text-pink-500 group-hover:bg-pink-500/20 transition-colors">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
              trend.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <h3 className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">{title}</h3>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
    </motion.div>
  );
};

// Transaction Item Component
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const getTypeStyles = (type: Transaction["type"]) => {
    switch (type) {
      case "mint":
        return { bg: "bg-blue-500/10", text: "text-blue-500", label: "Minted" };
      case "purchase":
        return {
          bg: "bg-green-500/10",
          text: "text-green-500",
          label: "Purchased",
        };
      case "sale":
        return { bg: "bg-pink-500/10", text: "text-pink-500", label: "Sold" };
    }
  };

  const styles = getTypeStyles(transaction.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
    >
      <div className={`p-2 rounded-lg ${styles.bg}`}>
        <Database className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm sm:text-base text-white font-medium truncate">
            {transaction.dataset}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}
          >
            {styles.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{transaction.timestamp}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm sm:text-base font-semibold text-white">
          {transaction.amount}
        </p>
        <span
          className={`text-xs ${
            transaction.status === "completed"
              ? "text-green-500"
              : "text-yellow-500"
          }`}
        >
          {transaction.status}
        </span>
      </div>
    </motion.div>
  );
};

// Setting Item Component
const SettingItem = ({
  icon,
  title,
  description,
  action,
}: SettingItemProps) => {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
      <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 text-gray-400 group-hover:bg-pink-500/10 group-hover:text-pink-500 transition-all">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm sm:text-base text-white font-medium mb-0.5">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-gray-400 truncate">
          {description}
        </p>
      </div>
      <button className="text-xs sm:text-sm text-pink-500 hover:text-pink-400 font-medium transition-colors">
        {action}
      </button>
    </div>
  );
};

export default function Dashboard() {
  // Mock data
  const stats = [
    {
      title: "Datasets Minted",
      value: "24",
      subtitle: "Total datasets created",
      icon: <Database className="w-5 h-5 sm:w-6 sm:h-6" />,
      trend: { value: "+12%", isPositive: true },
      link: "/datasets",
    },
    {
      title: "Datasets Purchased",
      value: "15",
      subtitle: "Successfully acquired",
      icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
      trend: { value: "+8%", isPositive: true },
      link: "/datasets",
    },
    {
      title: "Total Spent",
      value: "12.5 PAS",
      subtitle: "≈ $24,750 USD",
      icon: <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />,
      trend: { value: "-5%", isPositive: false },
    },
    {
      title: "Total Received",
      value: "32.8 PAS",
      subtitle: "≈ $65,100 USD",
      icon: <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />,
      trend: { value: "+18%", isPositive: true },
    },
  ];

  const recentTransactions: Transaction[] = [
    {
      id: "1",
      type: "mint",
      dataset: "Medical Records Q4 2024",
      amount: "2.5 PAS",
      timestamp: "2 hours ago",
      status: "completed",
    },
    {
      id: "2",
      type: "sale",
      dataset: "Climate Data Analysis",
      amount: "5.2 PAS",
      timestamp: "5 hours ago",
      status: "completed",
    },
    {
      id: "3",
      type: "purchase",
      dataset: "Financial Market Insights",
      amount: "3.1 PAS",
      timestamp: "1 day ago",
      status: "completed",
    },
    {
      id: "4",
      type: "mint",
      dataset: "IoT Sensor Data 2024",
      amount: "1.8 PAS",
      timestamp: "2 days ago",
      status: "pending",
    },
  ];

  const settings = [
    {
      icon: <Bell className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Notifications",
      description: "Manage your notification preferences",
      action: "Configure",
    },
    {
      icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Security",
      description: "Two-factor authentication enabled",
      action: "Manage",
    },
    {
      icon: <Palette className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Appearance",
      description: "Customize your dashboard theme",
      action: "Edit",
    },
  ];

  return (
    <div className="mt-16 sm:mt-18 md:mt-20 min-h-screen bg-black">
      {/* Profile Banner */}
      <div className="p-3 xs:p-4 sm:p-5 md:p-6">
        <ProfileBanner walletAddress="0x1234ihdiuhsuisjiu" />
      </div>

      {/* Main Content */}
      <div className="px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 pb-8 sm:pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Transactions & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 md:p-6"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                  Recent Transactions
                </h2>
                <Link
                  href="/marketplace"
                  className="text-xs sm:text-sm cursor-pointer text-pink-500 hover:text-pink-400 font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Settings Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 md:p-6"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                  Quick Settings
                </h2>
              </div>
              <div className="space-y-2">
                {settings.map((setting, index) => (
                  <SettingItem key={index} {...setting} />
                ))}
              </div>
              <div className="mt-4 sm:mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/settings"
                  className="w-full py-2 sm:py-2.5 px-4 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 font-medium text-sm sm:text-base transition-colors"
                >
                  View All Settings
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
