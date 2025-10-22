"use client";
import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, User } from "lucide-react";
import Image from "next/image";

interface ProfileBannerProps {
  walletAddress: string;
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
              <Avatar
                address={walletAddress}
                size={
                  typeof window !== "undefined" && window.innerWidth < 640
                    ? 76
                    : typeof window !== "undefined" && window.innerWidth < 1024
                    ? 104
                    : 120
                }
              />
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
                  "_blank"
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

export default function Dashboard() {
  return (
    <div className="mt-20">
      {/* Header */}
      <div className="p-4 bg-black">
        <ProfileBanner walletAddress="0x1234ihdiuhsuisjiu" />
      </div>
    </div>
  );
}
