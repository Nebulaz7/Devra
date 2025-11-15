"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Database,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Loader2,
  Coins,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { blo } from "blo";
import toast from "react-hot-toast";
import {
  DATASET_NFT_ADDRESS,
  formatWND,
  getContractExplorerUrl,
  getTxExplorerUrl,
  WESTEND_ASSET_HUB,
} from "@/lib/contracts/config";
import { DatasetNFTAbi } from "@/lib/contracts/DatasetNFT";
import { useUserBalance, useTotalSupply } from "@/lib/contracts/useDataset";

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
  isLoading?: boolean;
}

interface Transaction {
  id: string;
  type: "mint" | "purchase" | "sale";
  dataset: string;
  amount: string;
  timestamp: string;
  status: "completed" | "pending";
  txHash?: string;
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick?: () => void;
}

interface DashboardStats {
  datasetsMinted: number;
  datasetsPurchased: number;
  totalSpent: string;
  totalReceived: string;
}

// Blo Avatar Component
const BloAvatar = ({ address, size }: { address: string; size: number }) => {
  const avatarUrl = blo(address as `0x${string}`);

  return (
    <div
      className="rounded-full overflow-hidden shadow-lg border-2 border-white/20"
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarUrl}
        alt="Wallet Avatar"
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  );
};

const ProfileBanner = ({ walletAddress }: ProfileBannerProps) => {
  const [avatarSize, setAvatarSize] = useState(120);
  const { data: balanceData } = useBalance({
    address: walletAddress as `0x${string}`,
  });

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 640) {
        setAvatarSize(72);
      } else if (window.innerWidth < 1024) {
        setAvatarSize(100);
      } else {
        setAvatarSize(120);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard!", {
      icon: "📋",
      style: {
        background: "#1f2937",
        color: "#fff",
        border: "1px solid #ec4899",
      },
    });
  };

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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23ec4899'/%3E%3C/svg%3E")`,
        }}
        className="h-32 sm:h-40 lg:h-48 relative border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20"></div>
      </div>

      {/* Profile Info */}
      <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-6 lg:left-8 right-4 sm:right-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
          {/* Avatar with Blo */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-[#0f0f17] p-1 border-4 border-pink-500/50 shadow-xl shadow-pink-500/20">
              <BloAvatar address={walletAddress} size={avatarSize} />
            </div>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#0f0f17] flex items-center justify-center border-2 border-pink-500 shadow-lg">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
              <span className="hidden sm:inline">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </span>
              <span className="sm:hidden">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs sm:text-sm text-gray-300 hover:text-white group"
              >
                <span className="font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {balanceData && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-500 text-xs sm:text-sm font-medium border border-pink-500/20">
                  <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {parseFloat(balanceData.formatted).toFixed(4)}{" "}
                    {balanceData.symbol}
                  </span>
                </div>
              )}
            </div>
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
  isLoading = false,
}: StatCardProps) => {
  const CardWrapper = link ? motion.a : motion.div;

  return (
    <CardWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...(link ? { href: link } : {})}
      className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 md:p-6 hover:border-pink-500/30 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-pink-500/10"
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
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
          <p className="text-sm text-gray-400 italic">Loading...</p>
        </div>
      ) : (
        <>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-pink-500 transition-colors">
            {value}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
        </>
      )}
    </CardWrapper>
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

  const handleClick = () => {
    if (transaction.txHash) {
      window.open(getTxExplorerUrl(transaction.txHash), "_blank");
      toast.success("Opening transaction in explorer", {
        icon: "🔗",
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #ec4899",
        },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-pink-500/20"
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
  onClick,
}: SettingItemProps) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-pink-500/20"
    >
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
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { balance: nftBalance, isLoading: isLoadingBalance } =
    useUserBalance(address);
  const { total: totalSupply } = useTotalSupply();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTxs, setIsLoadingTxs] = useState(true);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      toast.error("Please connect your wallet", {
        icon: "🔌",
      });
      router.push("/connect");
    }
  }, [isConnected, router]);

  // Fetch transaction data
  useEffect(() => {
    if (address && isConnected) {
      fetchTransactions();
    }
  }, [address, isConnected]);

  const fetchTransactions = async () => {
    setIsLoadingTxs(true);
    try {
      // Mock transactions for now - you can fetch real ones from events
      const mockTxs: Transaction[] = [
        {
          id: "1",
          type: "mint",
          dataset: "Medical Imaging Dataset #1",
          amount: "Free",
          timestamp: "2 hours ago",
          status: "completed",
        },
        {
          id: "2",
          type: "purchase",
          dataset: "AI Training Data #42",
          amount: "1.5 WND",
          timestamp: "1 day ago",
          status: "completed",
        },
      ];

      setTransactions(mockTxs);
      toast.success("Dashboard data loaded!", {
        icon: "📊",
        duration: 2000,
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #ec4899",
        },
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoadingTxs(false);
    }
  };

  const statsDisplay = [
    {
      title: "NFTs Owned",
      value: nftBalance.toString(),
      subtitle: "Total datasets in wallet",
      icon: <Database className="w-5 h-5 sm:w-6 sm:h-6" />,
      link: "/datasets",
      isLoading: isLoadingBalance,
    },
    {
      title: "Total Minted",
      value: totalSupply.toString(),
      subtitle: "Platform-wide datasets",
      icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
      link: "/marketplace",
      isLoading: isLoadingBalance,
    },
    {
      title: "Total Spent",
      value: "0.00 WND",
      subtitle: "On dataset purchases",
      icon: <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />,
      isLoading: isLoadingTxs,
    },
    {
      title: "Total Received",
      value: "0.00 WND",
      subtitle: "From dataset sales",
      icon: <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />,
      isLoading: isLoadingTxs,
    },
  ];

  const settings = [
    {
      icon: <Bell className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Notifications",
      description: "Manage your notification preferences",
      action: "Configure",
      onClick: () =>
        toast("Notifications settings coming soon!", { icon: "🔔" }),
    },
    {
      icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Security",
      description: "Connected to Westend Asset Hub",
      action: "Manage",
      onClick: () => {
        window.open(getContractExplorerUrl(), "_blank");
        toast.success("Opening contract explorer", { icon: "🔗" });
      },
    },
    {
      icon: <Palette className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Appearance",
      description: "Customize your dashboard theme",
      action: "Edit",
      onClick: () => toast("Theme settings coming soon!", { icon: "🎨" }),
    },
  ];

  if (!address || !isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="mt-16 sm:mt-18 md:mt-20 min-h-screen bg-black">
      {/* Profile Banner */}
      <div className="p-3 xs:p-4 sm:p-5 md:p-6">
        <ProfileBanner walletAddress={address} />
      </div>

      {/* Main Content */}
      <div className="px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 pb-8 sm:pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8">
          {statsDisplay.map((stat, index) => (
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
                {isLoadingTxs ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                    <p className="text-gray-400 text-sm">
                      Loading transactions...
                    </p>
                  </div>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No transactions yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Start by minting your first dataset!
                    </p>
                  </div>
                )}
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
                <button
                  onClick={() =>
                    toast("Full settings coming soon!", { icon: "⚙️" })
                  }
                  className="w-full text-center py-2 sm:py-2.5 px-4 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 font-medium text-sm sm:text-base transition-colors border border-pink-500/20 hover:border-pink-500/40"
                >
                  View All Settings
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
