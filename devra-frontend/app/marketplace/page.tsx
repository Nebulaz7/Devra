"use client";

import React from "react";
import TopNav from "../components/sidebar";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#0f0f17]">
      <TopNav activeTab="/marketplace" />
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">Marketplace</h1>
          <p className="text-gray-400">
            Browse and purchase datasets from the marketplace.
          </p>
        </div>
      </main>
    </div>
  );
}
