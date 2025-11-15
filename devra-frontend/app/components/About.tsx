"use client";
import React from "react";
import { motion } from "framer-motion";
import { Database, Shield, Zap, TrendingUp, Lock, Globe } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Decentralized Storage",
      description:
        "Store your datasets on IPFS with permanent with Crust Network, censorship-resistant access.",
      color: "bg-pink-500/10 border-pink-500/20",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "AI Verification",
      description:
        "Every dataset is verified by AI to ensure quality and authenticity before trading.",
      color: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "NFT Ownership",
      description:
        "Datasets are minted as NFTs, giving you true ownership and provable scarcity.",
      color: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast Transactions",
      description:
        "Built on Polkadot Asset Hub for lightning-fast and low-cost transactions.",
      color: "bg-green-500/10 border-green-500/20",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Transparent Marketplace",
      description:
        "Fair pricing with transparent on-chain records of all transactions.",
      color: "bg-orange-500/10 border-orange-500/20",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Access",
      description:
        "Access datasets from creators worldwide, breaking down data silos.",
      color: "bg-cyan-500/10 border-cyan-500/20",
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
          <span className="text-pink-500">Data Trading</span>
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
        viewport={{ once: true }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mb-20"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`p-6 rounded-2xl border backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300 ${feature.color}`}
          >
            <div className="text-white mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-black text-pink-500 mb-2"
          >
            100%
          </motion.div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Decentralized
          </div>
        </div>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-pink-500 mb-2"
          >
            AI
          </motion.div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Verified Quality
          </div>
        </div>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl lg:text-5xl font-black text-pink-500 mb-2"
          >
            24/7
          </motion.div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Global Access
          </div>
        </div>
      </motion.div> */}
    </section>
  );
};

export default About;
