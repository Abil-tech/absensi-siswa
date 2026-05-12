"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard/siswa",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".4" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".4" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".4" />
      </svg>
    ),
  },
  {
    label: "Profil",
    href: "/dashboard/siswa/profil",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="4" fill="currentColor" />
        <path d="M2 18c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed lg:sticky top-0 left-0 h-screen w-[245px] z-30
        bg-[#111410] flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path
              d="M14 4L2 10L14 16L26 10L14 4Z"
              fill="#7fe05b"
              stroke="#7fe05b"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M6 13V19C6 19 9 22 14 22C19 22 22 19 22 19V13"
              stroke="#7fe05b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <p className="text-white font-extrabold text-[15px] leading-tight tracking-tight">
              Academic Portal
            </p>
            <p className="text-white/40 text-[11px] font-medium mt-0.5">Disciplined Innovation</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold
                transition-all duration-150 group
                ${
                  active
                    ? "bg-[#7fe05b] text-[#111410]"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                }
              `}
            >
              <span className={active ? "text-[#111410]" : "text-white/40 group-hover:text-white/70"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile + logout */}
      <div className="px-4 pb-7 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-[#7fe05b] flex items-center justify-center text-[#111410] font-black text-base shrink-0">
            B
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13.5px] font-bold truncate">Budi Santoso</p>
            <p className="text-white/40 text-[11px] truncate">20241001</p>
          </div>
          {/* Logout button */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/30 hover:text-red-400 transition-colors shrink-0"
            aria-label="Keluar"
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path
                d="M7 2H4a1 1 0 00-1 1v12a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
