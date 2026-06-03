"use client";

import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import ListSiswaContent from "../components/ListSiswaContent";
import PageTransition from "../components/PageTransition";

export default function ListSiswaPage() {
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
        <ListSiswaContent onMenuClick={() => setSidebarOpen(true)} />
      </PageTransition>
    </div>
  );
}
