"use client";

import React from "react";
import TopNav from "../components/sidebar";
import ActiveCampaigns from "./Marketplace";

const Page = () => {
  return (
    <div className="min-h-screen bg-[#0f0f17]">
      <TopNav activeTab="/marketplace" />
      <main>
        <ActiveCampaigns />
      </main>
    </div>
  );
};

export default Page;
