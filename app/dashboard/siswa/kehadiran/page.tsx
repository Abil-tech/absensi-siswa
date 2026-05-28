"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import KehadiranContent from "../components/KehadiranContent";
import PageTransition from "../components/PageTransition";

export default function KehadiranPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5ef] font-[family-name:var(--font-plus-jakarta)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <PageTransition>
        <KehadiranContent onMenuClick={() => setSidebarOpen(true)} />
      </PageTransition>
    </div>
  );
}
