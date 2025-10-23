"use client";

import React from "react";
import TopNav from "../components/sidebar";
import Dashboard from "./Dashboard";

const Page = () => {
  return (
    <div className="min-h-screen bg-[#0f0f17]">
      <TopNav />
      <main>
        <Dashboard />
      </main>
    </div>
  );
};

export default Page;
