"use client";

import { useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import DashboardContent from "../../../components/dashboardContent";
import PageTransition from "../../../components/PageTransition";

export default async function DashboardSiswaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as { name?: string; role?: string };


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

      <PageTransition>
        <DashboardContent onMenuClick={() => setSidebarOpen(true)} />
      </PageTransition>
    </div>
  );
}
