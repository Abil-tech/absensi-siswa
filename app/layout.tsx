import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Provider";

export const metadata: Metadata = {
  title: "Absensi Sekolah",
  description: "Sistem Informasi Kehadiran Siswa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
