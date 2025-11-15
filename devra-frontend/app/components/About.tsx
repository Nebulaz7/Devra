"use client";
import React from "react";
import { motion } from "framer-motion";
import { Database, Shield, Zap, TrendingUp, Lock, Globe } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Decentralized Storage",
      description:
        "Store your datasets on IPFS with permanent, censorship-resistant access.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "AI Verification",
      description:
        "Every dataset is verified by AI to ensure quality and authenticity before trading.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "NFT Ownership",
      description:
        "Datasets are minted as NFTs, giving you true ownership and provable scarcity.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Transactions",
      description:
        "Built on Polkadot Asset Hub for lightning-fast and low-cost transactions.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Transparent Marketplace",
      description:
        "Fair pricing with transparent on-chain records of all transactions.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Access",
      description:
        "Access datasets from creators worldwide, breaking down data silos.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="min-h-screen py-20 px-6 lg:px-16 relative">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-16"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-px bg-pink-500"></div>
          <span className="text-xs text-pink-500 tracking-widest uppercase font-semibold">
            About Devra
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-space-grotesk), quantico, sans-serif",
            letterSpacing: "-0.02em",
          }}
          className="text-5xl lg:text-6xl font-black leading-tight mb-6"
        >
          <span className="text-white">The Future of</span>
          <br />
          <span className="text-pink-500 font-georgia">Data Trading</span>
        </h2>

        <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
          Devra is revolutionizing how data is bought and sold. By leveraging
          blockchain technology, AI verification, and decentralized storage, we
          create a trustless marketplace where data creators are rewarded and
          buyers get verified, high-quality datasets.
        </p>
      </motion.div>

      {/* Feature Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-pink-500/50 rounded-xl p-6 transition-all duration-300"
          >
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors duration-300">
                <div className="text-pink-500">{feature.icon}</div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-500 transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl" />
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
      >
        <div className="text-center">
          <div className="text-4xl lg:text-5xl font-black text-pink-500 mb-2">
            100%
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Decentralized
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl lg:text-5xl font-black text-pink-500 mb-2">
            AI
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Verified Quality
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl lg:text-5xl font-black text-pink-500 mb-2">
            24/7
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Global Access
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
