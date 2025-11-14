"use client";
import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6 px-6 lg:pt-12 lg:px-16">
      {/* Left Section - Header and CTA */}
      <div className="pl-0 md:pl-16">
        <h2
          style={{
            fontFamily: "var(--font-space-grotesk), quantico, sans-serif",
            letterSpacing: "-0.02em",
          }}
          className="text-6xl lg:text-7xl font-black leading-[0.9] mb-8"
        >
          <span className="text-white">UPLOAD</span>
          <br />
          <span
            style={{
              color: "transparent",
              WebkitTextStroke: "2px rgb(236, 72, 153)",
            }}
            className="ml-0 md:ml-16 inline-block"
          >
            VERIFY
          </span>
          <br />
          <span className="text-pink-500">TRADE</span>
        </h2>

        <p className="text-base text-gray-400 max-w-md leading-relaxed mb-10">
          The decentralized data marketplace starts here. Upload datasets,
          verify with AI, trade securely.
        </p>

        {/* Secured by Section */}
        <div className="flex items-center gap-2 mb-5 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <div className="w-5 h-px bg-gray-700"></div>
          <span className="text-[10px] text-gray-500 tracking-widest uppercase">
            Secured by
          </span>
          <span className="text-gray-500 flex gap-1 text-sm font-semibold">
            <Image src="polkadot-logo.svg" alt="" width={15} height={15} />
            Polkadot Asset Hub
          </span>
          <div className="w-5 h-px bg-gray-700"></div>
        </div>

        {/* CTA Button */}
        <div className="flex gap-5 flex-wrap">
          <button
            onClick={() => {
              window.location.href = "/connect";
            }}
            style={{ transform: "skewX(-10deg)" }}
            className="px-10 py-4 bg-pink-500 hover:bg-pink-600 text-black border-none text-sm font-semibold tracking-widest uppercase cursor-pointer relative transition-all duration-300"
          >
            <span
              style={{ transform: "skewX(10deg)" }}
              className="inline-block"
            >
              Start Now →
            </span>
          </button>
        </div>
      </div>

      {/* Right Section - Placeholder for image or graphic */}
      <div>{/* Placeholder for future image or graphic */}</div>
    </div>
  );
};

export default Hero;
