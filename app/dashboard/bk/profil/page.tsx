"use client";

import { useState } from "react";
import BkSidebar from "../components/BkSidebar";
import BkProfilContent from "../components/BkProfilContent";
import PageTransition from "../components/PageTransition";

export default function ProfilBkPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5ef] font-[family-name:var(--font-plus-jakarta)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <BkSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <PageTransition>
        <BkProfilContent onMenuClick={() => setSidebarOpen(true)} />
      </PageTransition>
    </div>
  );
}
