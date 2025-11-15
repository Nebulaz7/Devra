"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/quantico/700.css";
import {
  ArrowUpRight,
  Wallet,
  ArrowLeft,
  Link2,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { westendAssetHub } from "@/lib/wagmi";

const Connect = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chain?.id === westendAssetHub.id;

  // Wait for client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-redirect when connected to correct network
  useEffect(() => {
    if (address && isCorrectNetwork) {
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [address, isCorrectNetwork, router]);

  // Handle wallet connection
  const handleConnect = (connectorId: string) => {
    setError(null);
    const connector = connectors.find((c) => c.id === connectorId);
    if (connector) {
      connect(
        { connector },
        {
          onError: (error) => {
            console.error("Connection error:", error);
            setError(error.message || "Failed to connect wallet");
          },
          onSuccess: () => {
            setShowWalletModal(false);
            // Check if we need to switch network
            if (chain?.id !== westendAssetHub.id) {
              handleSwitchNetwork();
            }
          },
        }
      );
    }
  };

  // Handle network switch
  const handleSwitchNetwork = () => {
    switchChain(
      { chainId: westendAssetHub.id },
      {
        onError: (error) => {
          setError(
            "Failed to switch network. Please switch manually in your wallet."
          );
        },
      }
    );
  };

  // Wallet options - only show available connectors
  const walletOptions = connectors
    .filter((connector) => {
      // Only show MetaMask for now (injected connector)
      return connector.type === "injected";
    })
    .map((connector) => ({
      id: connector.id,
      name: connector.name,
      icon: <Wallet className="w-6 h-6 text-white" />,
      description: `Connect with ${connector.name}`,
    }));

  // Render connect button based on state - only after mount
  const renderConnectButton = () => {
    // Show loading state during hydration
    if (!isMounted) {
      return (
        <motion.button
          className="bg-gray-500 text-[16px] text-white px-4 flex cursor-not-allowed py-2 rounded-full items-center border-2 border-gray-500 gap-2 transition duration-300"
          disabled
        >
          <Wallet className="inline mb-0" size={20} />
          Loading...
        </motion.button>
      );
    }

    if (address && isCorrectNetwork) {
      return (
        <motion.button
          className="bg-green-500 text-[16px] text-white px-4 flex cursor-pointer py-2 rounded-full items-center border-2 border-green-500 gap-2 transition duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <CheckCircle2 className="inline mb-0" size={20} />
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </motion.button>
      );
    }

    if (address && !isCorrectNetwork) {
      return (
        <motion.button
          onClick={handleSwitchNetwork}
          className="bg-yellow-500 text-[16px] text-white px-4 flex cursor-pointer py-2 rounded-full items-center border-2 border-yellow-500 gap-2 hover:bg-yellow-600 transition duration-300"
          whileHover="hover"
          variants={{
            hover: { scale: 1.0 },
          }}
          layout
        >
          <Wallet className="inline mb-0" size={20} />
          Switch to Westend Asset Hub
          <motion.span
            className="text-lg font-extralight"
            variants={{
              hover: {
                x: 4,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                },
              },
            }}
          >
            <ArrowUpRight className="inline-block mb-1" />
          </motion.span>
        </motion.button>
      );
    }

    return (
      <motion.button
        onClick={() => setShowWalletModal(true)}
        disabled={isPending}
        className="bg-pink-500 text-[16px] text-white px-4 flex cursor-pointer py-2 rounded-full items-center border-2 border-pink-500 gap-2 hover:bg-[#101010] hover:border-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover="hover"
        variants={{
          hover: { scale: 1.0 },
        }}
        layout
      >
        <Wallet className="inline mb-0" size={20} />
        {isPending ? "Connecting..." : "Connect Wallet"}
        {!isPending && (
          <motion.span
            className="text-lg font-extralight"
            variants={{
              hover: {
                x: 4,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                },
              },
            }}
          >
            <ArrowUpRight className="inline-block mb-1" />
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-b from-black to-pink-500 flex flex-col items-center justify-center">
      <div className="bg-[#1e1d1d] border-1 border-gray-600 rounded-2xl px-6 py-8 text-center max-w-2xl">
        <h1 className="text-3xl font-light mb-6 text-white">
          Welcome to{" "}
          <span style={{ fontFamily: "quantico, sans-serif" }}>Devra</span>
        </h1>
        <p className="pb-6 text-sm text-gray-400">
          To use Devra you must connect to Westend Asset Hub testnet
        </p>

        {/* Connect wallet button */}
        <div className="space-y-4 flex pb-5 justify-center text-center mx-auto">
          {renderConnectButton()}
        </div>

        {/* Error section */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-4">
              {error}
            </p>
          </motion.div>
        )}

        {/* Network Info */}
        <div className="mt-6 mb-4">
          <div className="bg-gradient-to-r from-pink-500/10 via-pink-500/10 to-pink-500/10 border border-pink-500/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              {/* Network Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-md"></div>
                <svg
                  className="w-5 h-5 text-pink-500 relative z-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>

              {/* Network Details */}
              <div className="flex flex-col items-start">
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">
                  Target Network
                </p>
                <div className="flex items-center gap-2">
                  {/* Status Indicator - only render after mount */}
                  {isMounted && (
                    <span className="relative flex h-2 w-2">
                      {isCorrectNetwork ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                      )}
                    </span>
                  )}
                  <p className="text-white font-medium text-sm">
                    Westend Asset Hub
                  </p>
                </div>
              </div>

              {/* Chain ID Badge */}
              <div className="ml-auto">
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full border border-purple-500/30">
                  Chain: 420420421
                </span>
              </div>
            </div>

            {/* Collapsible RPC and Block Explorer Section */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex cursor-pointer items-center gap-2 text-white/50 hover:text-white text-[10px] uppercase tracking-wider font-medium transition duration-200"
              >
                <span>{isExpanded ? "Hide" : "Show"} Network Details</span>
                <motion.svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </button>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 space-y-3"
                >
                  {/* RPC URL Section */}
                  <div className="flex items-start gap-2">
                    <Link2 className="w-3 h-3 text-pink-400 mt-0.5" />
                    <div className="flex-1 text-left">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium mb-1">
                        RPC URL
                      </p>
                      <a
                        href="https://westend-asset-hub-eth-rpc.polkadot.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300 text-[11px] break-all transition duration-200 flex items-center gap-1"
                      >
                        https://westend-asset-hub-eth-rpc.polkadot.io
                        <ArrowUpRight size={10} className="flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Block Explorer URL Section */}
                  <div className="flex items-start gap-2">
                    <Search className="w-3 h-3 text-pink-400 mt-0.5" />
                    <div className="flex-1 text-left">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium mb-1">
                        Block Explorer
                      </p>
                      <a
                        href="https://blockscout-passet-hub.parity-testnet.parity.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300 text-[11px] break-all transition duration-200 flex items-center gap-1"
                      >
                        https://blockscout-passet-hub.parity-testnet.parity.io/
                        <ArrowUpRight size={10} className="flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Additional Network Info */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
              <Link
                href="https://wiki.polkadot.network/docs/learn-assets"
                target="_blank"
                className="flex cursor-pointer items-center gap-1 text-white/40 hover:text-white/70 transition duration-200"
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Testnet Only</span>
              </Link>
              <a
                href="https://faucet.polkadot.io/westend?parachain=1000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 transition duration-200"
              >
                Get WND Tokens
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {address && isCorrectNetwork && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-400 text-xs mt-1">
                ✓ Redirecting to dashboard...
              </p>
            </div>
          </motion.div>
        )}

        {/* Terms */}
        <p className="mt-8 text-xs text-center text-white/50 pb-3">
          By connecting, you accept the{" "}
          <Link href="#" className="text-pink-400 hover:text-pink-300">
            Terms of Service
          </Link>{" "}
          and acknowledge our{" "}
          <Link href="#" className="text-pink-400 hover:text-pink-300">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-white/70 hover:text-white text-sm flex items-center justify-center gap-1 transition duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#1e1d1d] border border-gray-600 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Connect Wallet
                </h2>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 cursor-pointer hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Wallet Options */}
              <div className="space-y-3">
                {walletOptions.map((wallet) => (
                  <motion.button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    disabled={isPending}
                    className="w-full cursor-pointer bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4 flex items-center gap-4 hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {wallet.icon}
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{wallet.name}</p>
                      <p className="text-gray-400 text-sm">
                        {wallet.description}
                      </p>
                    </div>
                    <ArrowUpRight className="text-pink-400" size={20} />
                  </motion.button>
                ))}
              </div>

              {/* Help Text */}
              <p className="mt-6 text-xs text-center text-gray-400">
                Don&apos;t have a wallet?{" "}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300"
                >
                  Install MetaMask
                </a>{" "}
                or{" "}
                <a
                  href="https://talisman.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300"
                >
                  Install Talisman
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Connect;
