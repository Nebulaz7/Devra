"use client";
import React from "react";
import { motion } from "framer-motion";

const ctaCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.5 }}
      id="explore"
      className="text-left rounded-3xl mx-4 md:mx-8 lg:m-12 mb-0 p-6 md:p-8 lg:p-12"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 md:w-12 h-px bg-pink-500"></div>
        <span className="text-xs text-pink-500 tracking-widest uppercase font-semibold">
          Explore Devra
        </span>
      </div>

      <h2
        style={{
          fontFamily: "quantico, sans-serif",
          letterSpacing: "-0.02em",
        }}
        className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-4 md:mb-6"
      >
        <span className="text-white">Ready to Join the</span>
        <br />
        <span className="text-pink-500"> Data Revolution</span>?
      </h2>

      <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl pb-4 lg:pb-6">
        Start trading verified datasets on the blockchain. Upload your data, get
        AI verification, and earn rewards in a truly decentralized marketplace.
      </p>
      <div className="flex gap-3 md:gap-5 flex-wrap">
        <button
          onClick={() => {
            window.location.href = "/connect";
          }}
          style={{ transform: "skewX(-10deg)" }}
          className="px-6 md:px-10 py-3 md:py-4 bg-pink-500 hover:bg-pink-600 text-black border-none text-xs md:text-sm font-semibold tracking-widest uppercase cursor-pointer relative transition-all duration-300"
        >
          <span style={{ transform: "skewX(10deg)" }} className="inline-block">
            Explore Now →
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default ctaCard;
