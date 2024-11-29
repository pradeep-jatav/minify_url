"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import SingleUrlShortening from "../components/SingleUrlShortening";
import BatchUrlShortening from "@/components/BatchUrlShortening";
import LinkAnalytics from "@/components/LinkAnalytics";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState("single");

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />

      {/* Main Content */}
      <div className="flex-1 p-6 text-white overflow-auto">
        {activeFeature === "single" && <SingleUrlShortening />}
        {activeFeature === "batch" &&  <BatchUrlShortening />}
        {activeFeature === "analytics" && <LinkAnalytics />}
      </div>
    </div>
  );
}
