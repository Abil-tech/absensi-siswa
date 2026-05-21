"use client";

import { useState } from "react";
import GuruSidebar from "../components/GuruSidebar";
import GuruProfilContent from "../components/GuruProfilContent";
import PageTransition from "../components/PageTransition";

export default function ProfilGuruPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5ef] font-[family-name:var(--font-plus-jakarta)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <GuruSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <PageTransition>
        <GuruProfilContent onMenuClick={() => setSidebarOpen(true)} />
      </PageTransition>
    </div>
  );
}
