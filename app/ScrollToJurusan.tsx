"use client";

export default function ScrollToJurusan() {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const target = document.getElementById("jurusan");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13.5px] font-bold rounded-full transition-all duration-150 active:scale-95"
    >
      Lihat Jurusan
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 3v8M3 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
