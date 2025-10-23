"use client";

import React from "react";
import TopNav from "../components/sidebar";

export default function DatasetsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f17]">
      <TopNav />
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">My Datasets</h1>
          <p className="text-gray-400">
            Manage your uploaded and purchased datasets.
          </p>
        </div>
      </main>
    </div>
  );
}
