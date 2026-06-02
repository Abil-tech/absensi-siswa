"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props { onMenuClick: () => void; }

type StatusPengaduan = "open" | "selesai" | "ditutup";

interface Pesan {
  role: "walas" | "bk";
  pesan: string;
  createdAt: string;
}

interface PengaduanItem {
  id: string;
  judul: string;
  kategori: string;
  file: string;
  status: StatusPengaduan;
  tidakSelesaiCount: number;
  messages: Pesan[];
  createdAt: string;
  walas: { nama: string };
  siswa: { id: string; nama: string; nis: string; kelas: string };
}

type FilterType = "Semua" | "open" | "selesai" | "ditutup";

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#10b981","#f97316","#6366f1","#ec4899","#14b8a6"];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatWaktu(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

const STATUS_LABEL: Record<StatusPengaduan, string> = {
  open: "Aktif", selesai: "Selesai", ditutup: "Ditutup",
};

const STATUS_STYLE: Record<StatusPengaduan, string> = {
  open:     "bg-[#f0fce8] text-[#4a9e2f]",
  selesai:  "bg-[#7fe05b] text-[#111410]",
  ditutup:  "bg-gray-100 text-gray-500",
};

export default function PengaduanMasukContent({ onMenuClick }: Props) {
  const [pengaduanList, setPengaduanList] = useState<PengaduanItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState<FilterType>("Semua");
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState<PengaduanItem | null>(null);
  const [pesanBaru, setPesanBaru]         = useState("");
  const [loadingPesan, setLoadingPesan]   = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);

  const fetchPengaduan = useCallback(async () => {
    try {
      const res = await fetch("/api/bk/pengaduan");
      if (!res.ok) return;
      const json = await res.json();
      setPengaduanList(json.pengaduan);
      if (selected) {
        const updated = json.pengaduan.find((p: PengaduanItem) => p.id === selected.id);
        if (updated) setSelected(updated);
      }
    } finally { setLoading(false); }
  }, [selected]);

  useEffect(() => { fetchPengaduan(); }, []);

  // Polling saat di thread
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(fetchPengaduan, 5000);
    return () => clearInterval(interval);
  }, [selected, fetchPengaduan]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [selected]);

  async function handleKirimPesan() {
    if (!pesanBaru.trim() || !selected) return;
    setLoadingPesan(true);
    try {
      await fetch("/api/pengaduan/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pengaduanId: selected.id, pesan: pesanBaru }),
      });
      setPesanBaru("");
      await fetchPengaduan();
    } finally { setLoadingPesan(false); }
  }

  const filtered = pengaduanList.filter((p) => {
    const matchFilter = filter === "Semua" || p.status === filter;
    const matchSearch =
      p.siswa.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.judul.toLowerCase().includes(search.toLowerCase()) ||
      p.kategori.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    semua:   pengaduanList.length,
    open:    pengaduanList.filter((p) => p.status === "open").length,
    selesai: pengaduanList.filter((p) => p.status === "selesai").length,
    ditutup: pengaduanList.filter((p) => p.status === "ditutup").length,
  };

  // ══ VIEW: THREAD CHAT ══
  if (selected) {
    const isOpen = selected.status === "open";

    return (
      <div ref={scrollRef} className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
            <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-[13px] font-semibold hidden sm:block">Pengaduan Masuk</span>
            </button>
            <span className="text-[#d0d0c8]">/</span>
            <span className="text-[13px] font-bold text-[#1a1a1a] truncate max-w-[160px]">{selected.judul}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-[11.5px] font-black ${STATUS_STYLE[selected.status]}`}>
            {STATUS_LABEL[selected.status]}
          </span>
        </header>

        <main className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-5 gap-4 max-w-2xl mx-auto w-full">
          {/* Info */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-bold text-[#7fe05b]">{selected.kategori}</span>
              <span className="text-[#d0d0c8]">·</span>
              <span className="text-[12px] text-[#9a9a9a]">{formatTanggal(selected.createdAt)}</span>
            </div>
            <p className="text-[14px] font-extrabold text-[#111410]">{selected.judul}</p>
            <p className="text-[12px] text-[#9a9a9a] mt-0.5">
              Siswa: {selected.siswa.nama} · {selected.siswa.nis} · {selected.siswa.kelas}
            </p>
            <p className="text-[12px] text-[#9a9a9a]">Dilaporkan oleh: {selected.walas.nama}</p>
          </div>

          {!isOpen && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[12.5px] text-gray-600 font-medium text-center">
              {selected.status === "selesai" ? "✅ Pengaduan ini telah diselesaikan." : "🔒 Pengaduan ini telah ditutup."}
            </div>
          )}

          {/* Thread */}
          <div className="flex flex-col gap-3 flex-1">
            {selected.messages.map((msg, i) => {
              const isBK = msg.role === "bk";
              return (
                <div key={i} className={`flex gap-2 ${isBK ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isBK ? "bg-[#111410] text-[#7fe05b]" : "bg-[#7fe05b] text-[#111410]"}`}>
                    {isBK ? "BK" : getInitials(selected.walas.nama)}
                  </div>
                  <div className={`max-w-[75%] flex flex-col gap-1 ${isBK ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${isBK ? "bg-[#111410] text-white rounded-tr-sm" : "bg-white text-[#1a1a1a] rounded-tl-sm shadow-sm"}`}>
                      {msg.pesan}
                    </div>
                    <span className="text-[11px] text-[#b0b0a8]">{formatWaktu(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input pesan — hanya jika open */}
          {isOpen && (
            <div className="flex gap-2 items-end pb-4">
              <textarea
                rows={2}
                value={pesanBaru}
                onChange={(e) => setPesanBaru(e.target.value)}
                placeholder="Tulis balasan..."
                className="flex-1 px-4 py-3 text-[13.5px] bg-white text-[#1a1a1a] placeholder:text-[#b0b0a8] rounded-xl border border-black/10 outline-none resize-none focus:border-[#7fe05b] transition-all"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleKirimPesan(); } }}
              />
              <button
                type="button"
                onClick={handleKirimPesan}
                disabled={loadingPesan || !pesanBaru.trim()}
                className="w-11 h-11 rounded-xl bg-[#111410] flex items-center justify-center disabled:opacity-40 transition shrink-0"
              >
                {loadingPesan ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M11 5l4 4-4 4" stroke="#7fe05b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ══ VIEW: DAFTAR PENGADUAN ══
  return (
    <div ref={scrollRef} className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#f5f5ef]/90 backdrop-blur border-b border-black/5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="lg:hidden text-[#1a1a1a] p-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <h1 className="text-[1.1rem] sm:text-[1.5rem] font-extrabold text-[#1a1a1a] tracking-tight">Pengaduan Masuk</h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5">

        {/* Stat */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",   value: counts.semua,   color: "#1a1a1a" },
            { label: "Aktif",   value: counts.open,    color: "#4a9e2f" },
            { label: "Selesai", value: counts.selesai, color: "#1d4ed8" },
            { label: "Ditutup", value: counts.ditutup, color: "#6b7280" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex items-center gap-3">
              <p className="text-[1.5rem] font-black leading-none" style={{ color: s.color }}>{loading ? "—" : s.value}</p>
              <p className="text-[11.5px] font-semibold text-[#9a9a9a] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Cari siswa, judul, atau kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-white rounded-xl border border-black/10 outline-none focus:border-[#7fe05b] transition-all shadow-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["Semua", "open", "selesai", "ditutup"] as FilterType[]).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap ${filter === f ? "bg-[#111410] text-white" : "bg-white text-[#6b6b6b] border border-black/10"}`}>
                {f === "Semua" ? "Semua" : STATUS_LABEL[f as StatusPengaduan]}
              </button>
            ))}
          </div>
        </div>

        {/* Kartu */}
        {loading ? (
          <div className="text-center text-[13px] text-[#9a9a9a] py-10">Memuat pengaduan...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[14px] font-bold text-[#1a1a1a]">Tidak ada pengaduan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => (
              <button key={p.id} type="button" onClick={() => setSelected(p)} className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] text-left hover:shadow-[0_6px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[12px] font-black shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {getInitials(p.siswa.nama)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#111410] truncate">{p.siswa.nama}</p>
                    <p className="text-[11.5px] text-[#9a9a9a] font-mono">{p.siswa.nis} · {p.siswa.kelas}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#7fe05b] mb-1">{p.kategori}</p>
                  <p className="text-[13px] font-bold text-[#111410] leading-snug line-clamp-2">{p.judul}</p>
                  <p className="text-[12px] text-[#9a9a9a] mt-1">Oleh: {p.walas.nama}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5">
                  <div>
                    <p className="text-[12px] font-semibold text-[#9a9a9a]">{formatTanggal(p.createdAt)}</p>
                    <p className="text-[11.5px] text-[#b0b0a8]">{(p.messages ?? []).length} pesan</p>
                  </div>
                  <span className={`text-[11.5px] font-black px-3 py-1.5 rounded-full ${STATUS_STYLE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}