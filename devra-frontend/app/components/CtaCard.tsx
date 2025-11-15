"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";

const ctaCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="text-center bg-gradient-to-r from-pink-700/20 to-pink-900/20 rounded-3xl m-12 p-12 border border-pink-500/10"
    >
      <Sparkles className="w-16 h-16 text-pink-500 mx-auto mb-6" />
      <h3
        style={{
          fontFamily: " quantico, sans-serif",
          letterSpacing: "-0.02em",
        }}
        className="text-2xl lg:text-4xl font-black text-white mb-4 leading-tight"
      >
        Ready to Join the{" "}
        <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
          Data Revolution
        </span>
        ?
      </h3>
      <p className="text-base lg:text-md text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
        Start trading verified datasets on the blockchain. Upload your data, get
        AI verification, and earn rewards in a truly decentralized marketplace.
      </p>
      <motion.button
        className="bg-pink-500 text-[14px] text-white md:text-[24px] px-5 py-3 md:px-6 cursor-pointer md:py-3 rounded-full items-center hover:bg-[#101010] shadow-sm shadow-pink-400/50  hover:shadow-md hover:shadow-pink-400/50 transition duration-100"
        whileHover="hover"
        style={{
          fontFamily: " quantico, sans-serif",
        }}
        variants={{
          hover: { scale: 1.0, y: -2 },
        }}
        layout
      >
        Get Started
        <motion.span
          className="text-lg font-extralight"
          variants={{
            hover: {
              x: 4,
              transition: { stiffness: 400, damping: 10 },
            },
          }}
        >
          <ArrowUpRight className="inline-block mb-1 ml-1 w-3 h-3 md:w-6 md:h-6 " />
        </motion.span>
      </motion.button>
    </motion.div>
  );
};

export default ctaCard;
