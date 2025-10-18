"use client";

import React from "react";
import Sidebar from "../components/sidebar";

export default function MarketplacePage() {
  return (
    <div className="flex h-screen bg-[#0f0f17]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Marketplace</h1>
          <p className="text-gray-400">
            Browse and purchase datasets from the marketplace.
          </p>
        </div>
      </main>
    </div>
  );
}
