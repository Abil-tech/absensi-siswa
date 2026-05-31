"use client";

import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import ListGuruContent from "../components/ListGuruContent";
import PageTransition from "../components/PageTransition";

export default function ListGuruPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5ef] font-[family-name:var(--font-plus-jakarta)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <PageTransition>
        <ListGuruContent onMenuClick={() => setSidebarOpen(true)} />
      </PageTransition>
    </div>
  );
}
