"use client";
import React from "react";
import { motion } from "framer-motion";
import { Database, Sparkles } from "lucide-react";
import "@fontsource/quantico/700.css";

const Banner = () => {
  return (
    <div className="relative pt-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl rounded-2xl mb-4 mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
              <Database className="w-10 h-10 text-pink-500" />
            </div>
            <div>
              <h1
                style={{ fontFamily: "quantico, sans-serif" }}
                className="text-4xl font-bold text-white flex items-center gap-2"
              >
                My Datasets
                <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />
              </h1>
              <p className="text-gray-400 mt-2">
                Manage your purchased and minted datasets on the decentralized
                marketplace
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-pink-500/10 rounded-full animate-pulse blur-xl"></div>
      <div className="absolute top-1/4 right-20 w-16 h-16 bg-purple-500/10 rounded-full animate-bounce blur-xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-pink-500/10 rounded-full animate-pulse blur-xl"></div>
    </div>
  );
};

export default Banner;
