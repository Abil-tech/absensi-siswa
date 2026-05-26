"use client";

import { useState } from "react";
import Sidebar from "../../../../components/sidebar";
import DispenContent from "../../../../components/DispenContent";
import PageTransition from "../../../../components/PageTransition";

export default function DispenPage() {
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
        <DispenContent onMenuClick={() => setSidebarOpen(true)} />
      </PageTransition>
    </div>
  );
}
