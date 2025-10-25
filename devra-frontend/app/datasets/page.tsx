"use client";

import React from "react";
import TopNav from "../components/sidebar";
import Datasets from "./Datasets"

export default function DatasetsPage() {
  return (
    <div className="min-h-screen bg-black">
      <TopNav activeTab="/datasets" />
      <main>
          <Datasets />
      </main>
    </div>
  );
}
