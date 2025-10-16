import React from "react";

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-light mb-6 text-white">Devra</h1>
        <p className="text-lg text-gray-200 leading-relaxed mb-8">
          Devra is a decentralized data marketplace, where data owners can list
          datasets verified by AI as NFTs, which can be purchased by data
          buyers.
        </p>
        <button className="px-8 py-3 bg-white text-black text-sm tracking-wide cursor-pointer hover:bg-gray-300 transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
};

export default Hero;
