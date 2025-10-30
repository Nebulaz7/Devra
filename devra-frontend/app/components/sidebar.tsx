"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import "@fontsource/quantico/700.css";
import {
  Megaphone,
  LayoutDashboard,
  Database,
  Plus,
  ChevronDown,
  Copy,
  LogOut,
  Wallet,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DoubleLineIcon = ({ size = 30, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    className={className}
  >
    <rect x="4" y="9" width="24" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="19" width="24" height="2" rx="1" fill="currentColor" />
  </svg>
);

interface NavProps {
  activeTab?: string;
}

const Nav = ({ activeTab }: NavProps = { activeTab: undefined }) => {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setWalletAddress("0x1234ihdiuhsuisjiu");
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setIsWalletDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.location.href = "/connect";
  };

  const formatAddress = (
    address: string,
    length: "short" | "medium" | "long" = "medium",
  ) => {
    if (length === "short") {
      return `${address.slice(0, 4)}...${address.slice(-2)}`;
    } else if (length === "medium") {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const isActive = (path: string) => {
    return activeTab === path;
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="cursor-pointer"
                    >
                      <DoubleLineIcon className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center">
                <h1
                  style={{ fontFamily: "quantico, sans-serif" }}
                  className="text-xl sm:text-2xl font-bold text-white hover:text-pink-400 transition-colors duration-200"
                >
                  Devra
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 group ${
                  isActive("/dashboard")
                    ? "bg-pink-500/10 text-pink-400"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <LayoutDashboard
                  className={`w-4 h-4 transition-colors duration-200 ${
                    isActive("/dashboard")
                      ? "text-pink-400"
                      : "group-hover:text-pink-400"
                  }`}
                />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>

              <Link
                href="/datasets"
                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 group ${
                  isActive("/datasets")
                    ? "bg-pink-500/10 text-pink-400"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Database
                  className={`w-4 h-4 transition-colors duration-200 ${
                    isActive("/datasets")
                      ? "text-pink-400"
                      : "group-hover:text-pink-400"
                  }`}
                />
                <span className="text-sm font-medium">My Datasets</span>
              </Link>

              <Link
                href="/marketplace"
                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 group ${
                  isActive("/marketplace")
                    ? "bg-pink-500/10 text-pink-400"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Megaphone
                  className={`w-4 h-4 transition-colors duration-200 ${
                    isActive("/marketplace")
                      ? "text-pink-400"
                      : "group-hover:text-pink-400"
                  }`}
                />
                <span className="text-sm font-medium">Marketplace</span>
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Create Bounty Button - Desktop */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  window.location.href = "/datasets";
                }}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-pink-500/90 hover:bg-pink-600 text-white rounded-full cursor-pointer font-medium text-sm transition-all duration-200 shadow-lg shadow-pink-600/25"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Dataset</span>
              </motion.button>

              {/* Create Bounty Button - Tablet */}
              <motion.button
                onClick={() => {
                  window.location.href = "/datasets";
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden cursor-pointer md:flex lg:hidden items-center gap-1 px-3 py-2 bg-pink-500/90 hover:bg-pink-600 text-white rounded-full font-medium text-sm transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Upload</span>
              </motion.button>

              {/* Create Bounty Button - Mobile */}
              <motion.button
                onClick={() => {
                  window.location.href = "/datasets";
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden px-3 py-2 bg-pink-500/90 hover:bg-pink-600 cursor-pointer text-white rounded-full transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
              </motion.button>

              {/* Wallet Section */}
              {walletAddress ? (
                <div className="relative">
                  <motion.button
                    onClick={() =>
                      setIsWalletDropdownOpen(!isWalletDropdownOpen)
                    }
                    className="flex items-center gap-1.5 cursor-pointer sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-white text-xs sm:text-sm font-medium transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hidden sm:inline font-mono">
                      {formatAddress(walletAddress, "medium")}
                    </span>
                    <span className="sm:hidden font-mono">
                      {formatAddress(walletAddress, "short")}
                    </span>
                    <motion.div
                      animate={{ rotate: isWalletDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  {/* Wallet Dropdown Menu */}
                  <AnimatePresence>
                    {isWalletDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 sm:w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                      >
                        <div className="py-2">
                          {/* Full Address Display */}
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-xs text-gray-400 mb-1">
                              Wallet Address
                            </p>
                            <p className="text-xs sm:text-sm text-white font-mono break-all">
                              {walletAddress}
                            </p>
                          </div>

                          <button
                            onClick={copyAddress}
                            className="flex items-center cursor-pointer gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                          >
                            <Copy className="w-4 h-4" />
                            {copySuccess ? "Copied!" : "Copy Address"}
                          </button>

                          <button
                            onClick={handleDisconnect}
                            className="flex items-center cursor-pointer gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            Disconnect
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/connect"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden xs:inline">Connect</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-16 left-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-pink-500/10 text-pink-400"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                  href="/datasets"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive("/datasets")
                      ? "bg-pink-500/10 text-pink-400"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Database className="w-5 h-5" />
                  <span className="font-medium">My Datasets</span>
                </Link>

                <Link
                  href="/marketplace"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive("/marketplace")
                      ? "bg-pink-500/10 text-pink-400"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Megaphone className="w-5 h-5" />
                  <span className="font-medium">Marketplace</span>
                </Link>

                <button
                  onClick={() => {
                    window.location.href = "/datasets";
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-pink-500 text-white cursor-pointer hover:bg-black rounded-full transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Upload Dataset</span>
                </button>

                {/* Mobile Wallet Info */}
                {walletAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">
                        Connected Wallet
                      </p>
                      <p className="text-sm text-white font-mono break-all">
                        {walletAddress}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={copyAddress}
                          className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          {copySuccess ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={handleDisconnect}
                          className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-3 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                        >
                          <LogOut className="w-3 h-3" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close wallet dropdown */}
      {isWalletDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsWalletDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default Nav;
