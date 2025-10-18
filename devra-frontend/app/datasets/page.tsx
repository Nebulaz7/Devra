"use client";

import React from "react";
import Sidebar from "../components/sidebar";

export default function DatasetsPage() {
  return (
    <div className="flex h-screen bg-[#0f0f17]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-4">My Datasets</h1>
          <p className="text-gray-400">
            Manage your uploaded and purchased datasets.
          </p>
        </div>
      </main>
    </div>
  );
}
