"use client";

import React from "react";
import Sidebar from "../components/sidebar";
import Dashboard from "./Dashboard";

const Page = () => {
  return (
    <div className="flex h-screen bg-[#0f0f17]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Dashboard />
      </main>
    </div>
  );
};

export default Page;
