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
import { passetHub } from "@/lib/wagmi";

const Connect = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chain?.id === passetHub.id;

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
            if (chain?.id !== passetHub.id) {
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
      { chainId: passetHub.id },
      {
        onError: (error) => {
          setError(
            "Failed to switch network. Please switch manually in your wallet."
          );
        },
      }
    );
  };

  // Wallet options with icons
  const walletOptions = [
    {
      id: "injected",
      name: "MetaMask",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 507.83 470.86"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
        >
          <defs>
            <style>
              {`.a{fill:#e2761b;stroke:#e2761b;}.a,.b,.c,.d,.e,.f,.g,.h,.i,.j{stroke-linecap:round;stroke-linejoin:round;}.b{fill:#e4761b;stroke:#e4761b;}.c{fill:#d7c1b3;stroke:#d7c1b3;}.d{fill:#233447;stroke:#233447;}.e{fill:#cd6116;stroke:#cd6116;}.f{fill:#e4751f;stroke:#e4751f;}.g{fill:#f6851b;stroke:#f6851b;}.h{fill:#c0ad9e;stroke:#c0ad9e;}.i{fill:#161616;stroke:#161616;}.j{fill:#763d16;stroke:#763d16;}`}
            </style>
          </defs>
          <title>metamask</title>
          <polygon
            className="a"
            points="482.09 0.5 284.32 147.38 320.9 60.72 482.09 0.5"
          />
          <polygon
            className="b"
            points="25.54 0.5 221.72 148.77 186.93 60.72 25.54 0.5"
          />
          <polygon
            className="b"
            points="410.93 340.97 358.26 421.67 470.96 452.67 503.36 342.76 410.93 340.97"
          />
          <polygon
            className="b"
            points="4.67 342.76 36.87 452.67 149.57 421.67 96.9 340.97 4.67 342.76"
          />
          <polygon
            className="b"
            points="143.21 204.62 111.8 252.13 223.7 257.1 219.73 136.85 143.21 204.62"
          />
          <polygon
            className="b"
            points="364.42 204.62 286.91 135.46 284.32 257.1 396.03 252.13 364.42 204.62"
          />
          <polygon
            className="b"
            points="149.57 421.67 216.75 388.87 158.71 343.55 149.57 421.67"
          />
          <polygon
            className="b"
            points="290.88 388.87 358.26 421.67 348.92 343.55 290.88 388.87"
          />
          <polygon
            className="c"
            points="358.26 421.67 290.88 388.87 296.25 432.8 295.65 451.28 358.26 421.67"
          />
          <polygon
            className="c"
            points="149.57 421.67 212.18 451.28 211.78 432.8 216.75 388.87 149.57 421.67"
          />
          <polygon
            className="d"
            points="213.17 314.54 157.12 298.04 196.67 279.95 213.17 314.54"
          />
          <polygon
            className="d"
            points="294.46 314.54 310.96 279.95 350.71 298.04 294.46 314.54"
          />
          <polygon
            className="e"
            points="149.57 421.67 159.11 340.97 96.9 342.76 149.57 421.67"
          />
          <polygon
            className="e"
            points="348.72 340.97 358.26 421.67 410.93 342.76 348.72 340.97"
          />
          <polygon
            className="e"
            points="396.03 252.13 284.32 257.1 294.66 314.54 311.16 279.95 350.91 298.04 396.03 252.13"
          />
          <polygon
            className="e"
            points="157.12 298.04 196.87 279.95 213.17 314.54 223.7 257.1 111.8 252.13 157.12 298.04"
          />
          <polygon
            className="f"
            points="111.8 252.13 158.71 343.55 157.12 298.04 111.8 252.13"
          />
          <polygon
            className="f"
            points="350.91 298.04 348.92 343.55 396.03 252.13 350.91 298.04"
          />
          <polygon
            className="f"
            points="223.7 257.1 213.17 314.54 226.29 382.31 229.27 293.07 223.7 257.1"
          />
          <polygon
            className="f"
            points="284.32 257.1 278.96 292.87 281.34 382.31 294.66 314.54 284.32 257.1"
          />
          <polygon
            className="g"
            points="294.66 314.54 281.34 382.31 290.88 388.87 348.92 343.55 350.91 298.04 294.66 314.54"
          />
          <polygon
            className="g"
            points="157.12 298.04 158.71 343.55 216.75 388.87 226.29 382.31 213.17 314.54 157.12 298.04"
          />
          <polygon
            className="h"
            points="295.65 451.28 296.25 432.8 291.28 428.42 216.35 428.42 211.78 432.8 212.18 451.28 149.57 421.67 171.43 439.55 215.75 470.36 291.88 470.36 336.4 439.55 358.26 421.67 295.65 451.28"
          />
          <polygon
            className="i"
            points="290.88 388.87 281.34 382.31 226.29 382.31 216.75 388.87 211.78 432.8 216.35 428.42 291.28 428.42 296.25 432.8 290.88 388.87"
          />
          <polygon
            className="j"
            points="490.44 156.92 507.33 75.83 482.09 0.5 290.88 142.41 364.42 204.62 468.37 235.03 491.43 208.2 481.49 201.05 497.39 186.54 485.07 177 500.97 164.87 490.44 156.92"
          />
          <polygon
            className="j"
            points="0.5 75.83 17.39 156.92 6.66 164.87 22.56 177 10.44 186.54 26.34 201.05 16.4 208.2 39.26 235.03 143.21 204.62 216.75 142.41 25.54 0.5 0.5 75.83"
          />
          <polygon
            className="g"
            points="468.37 235.03 364.42 204.62 396.03 252.13 348.92 343.55 410.93 342.76 503.36 342.76 468.37 235.03"
          />
          <polygon
            className="g"
            points="143.21 204.62 39.26 235.03 4.67 342.76 96.9 342.76 158.71 343.55 111.8 252.13 143.21 204.62"
          />
          <polygon
            className="g"
            points="284.32 257.1 290.88 142.41 321.1 60.72 186.93 60.72 216.75 142.41 223.7 257.1 226.09 293.27 226.29 382.31 281.34 382.31 281.74 293.27 284.32 257.1"
          />
        </svg>
      ),
      description: "Connect with MetaMask",
    },
    {
      id: "talisman",
      name: "Talisman",
      icon: (
        <div className="rounded-lg flex items-center justify-center">
          <Image
            className="w-8 h-8"
            src="/talisman.png"
            alt="Talisman"
            width={20}
            height={20}
          />
        </div>
      ),
      description: "Connect with Talisman",
    },
  ];

  // Render connect button based on state
  const renderConnectButton = () => {
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
          Switch to Passet Hub
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
          To use Devra you must connect to Paseo Asset Hub testnet
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
                  {/* Status Indicator */}
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
                  <p className="text-white font-medium text-sm">
                    Paseo Asset Hub
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
                href="https://faucet.polkadot.io/?parachain=1111"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 transition duration-200"
              >
                Get PAS Tokens
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
                  className="text-gray-400 hover:text-white transition-colors"
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
                Don't have a wallet?{" "}
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
