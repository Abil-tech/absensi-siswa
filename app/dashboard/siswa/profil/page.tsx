"use client";

import { useState } from "react";
import Sidebar from "../components/sidebar";
import ProfilContent from "../components/profilContent";

export default function ProfilSiswaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5ef] font-[family-name:var(--font-plus-jakarta)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <ProfilContent onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
