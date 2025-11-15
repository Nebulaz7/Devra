"use client";
import React from "react";
import Image from "next/image";

const Tag = () => {
  return (
    <a
      href="https://polkadot.com"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-10 bottom-10 right-10 flex items-center gap-3 px-5 py-3 bg-black/90 border border-gray-700 rounded-full text-decoration-none transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-pink-500/20 group"
    >
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-pink-500/10 to-transparent transform rotate-45 translate-x-[-100%] transition-transform duration-600 pointer-events-none group-hover:translate-x-[100%]"></div>
      <span className="text-gray-400 text-xs tracking-wider uppercase transition-colors duration-300 group-hover:text-gray-300">
        POWERED BY
      </span>
      <Image
        src="/polkadot-logo.svg"
        alt="Polkadot"
        width={24}
        height={24}
        className="brightness-80 transition-all duration-300 group-hover:brightness-100"
      />
      <i className="text-gray-100 text-md"> Polkadot </i>
    </a>
  );
};

export default Tag;
