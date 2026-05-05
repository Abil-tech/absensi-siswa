"use client";
import { useState } from "react";

export default function AbsensiPage() {
  const [status, setStatus] = useState("hadir");

  const handleSubmit = async () => {
    await fetch("/api/absensi", {
      method: "POST",
      body: JSON.stringify({
        userId: "ID_USER_KAMU",
        status,
      }),
    });

    alert("Absensi berhasil!");
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Absensi Siswa</h1>

      <select onChange={(e) => setStatus(e.target.value)}>
        <option value="hadir">Hadir</option>
        <option value="izin">Izin</option>
        <option value="sakit">Sakit</option>
        <option value="alpha">Alpha</option>
      </select>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 ml-2"
      >
        Absen
      </button>
    </div>
  );
}