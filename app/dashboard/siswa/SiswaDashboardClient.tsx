"use client";

import { useState } from "react";
import Sidebar from "../../../components/sidebar";
import DashboardContent from "../../../components/dashboardContent";
import PageTransition from "../../../components/PageTransition";

interface Props {
  user: { name: string; id: string; email: string };
}

export default function SiswaDashboardClient({ user }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5ef] font-[family-name:var(--font-plus-jakarta)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <PageTransition>
        <DashboardContent onMenuClick={() => setSidebarOpen(true)} userId={user.id} />
      </PageTransition>
    </div>
  );
}
