"use client";
import React, { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Wallet, ArrowLeft, Link2, Search } from "lucide-react";

const Connect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = () => {
    setIsConnecting(true);
    // Simulate wallet connection delay
    setTimeout(() => {
      setIsConnecting(false);
      alert("Wallet connected!");
      setError("Something went wrong while connecting the wallet.");
    }, 2000);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-black to-pink-500 flex flex-col items-center justify-center">
      <div className="bg-[#1e1d1d] border-1 border-gray-600 rounded-2xl px-6 py-8 text-center">
        <h1 className="text-3xl font-light mb-6 text-white">
          Welcome to Devra
        </h1>
        <p className="pb-6 text-sm text-gray-400">
          To use Devra you must connect to your Polkadot testnet wallet
        </p>

        {/* Connect wallet button */}
        <div className="space-y-4 flex pb-5 justify-center text-center mx-auto">
          <motion.button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="bg-pink-500 text-[16px] text-white px-4 flex cursor-pointer py-2 rounded-full items-center border-2 border-pink-500 gap-2 hover:bg-[#101010] hover:border-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover="hover"
            variants={{
              hover: { scale: 1.0 },
            }}
            layout
          >
            <Wallet className="inline mb-0" size={20} />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
            {!isConnecting && (
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
        </div>

        {/* Error section */}
        <p className="text-red-400 text-sm">{error}</p>

        {/* Network Info - Enhanced */}
        <div className="mt-6 mb-4">
          <div className="bg-gradient-to-r from-pink-500/10 via-pink-500/10 to-pink-500/10 border border-pink-500/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              {/* Network Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-md"></div>
                <svg
                  className="w-5 h-5 text-pink-400 relative z-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>

              {/* Network Details */}
              <div className="flex flex-col items-start">
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">
                  Connected Network
                </p>
                <div className="flex items-center gap-2">
                  {/* Status Indicator */}
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-white font-medium text-sm">
                    Polkadot Hub TestNet
                  </p>
                </div>
              </div>

              {/* Chain ID Badge */}
              <div className="ml-auto">
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full border border-purple-500/30">
                  Chain: 420420422
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
                        href="https://testnet-passet-hub-eth-rpc.polkadot.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300 text-[11px] break-all transition duration-200 flex items-center gap-1"
                      >
                        https://testnet-passet-hub-eth-rpc.polkadot.io
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
                href="https://docs.polkadot.com/develop/smart-contracts/connect-to-polkadot/#networks-details"
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
                href="https://faucet.polkadot.io/?parachain=1111"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 transition duration-200"
              >
                Get PAS
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default Connect;
