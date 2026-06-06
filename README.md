# 🚀 Absensi Siswa

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://absensi-siswa-beta.vercel.app/)

> Sistem Manajemen Sekolah terintegrasi dengan Auth berbasis Role (Admin, Guru, Siswa) untuk efisiensi pelaporan absensi. Selain itu fitur melakukan pengaduan kepada Bk dan dispensasi siswa

---

## 📸 Pratinjau / Demo
![Screenshot Aplikasi](https://via.placeholder.com/800x450.png?text=Taruh+Screenshot+atau+GIF+Aplikasi+di+Sini)
*Link Demo Langsung:* [Klik di sini untuk mencoba](https://absensi-siswa-beta.vercel.app/)

---

## ✨ Fitur Utama
- **Multi-role Authentication** – Login aman menggunakan Next-Auth dipisahkan berdasarkan hak akses (Admin, Guru, BK, Siswa).
- **Dashboard Dinamis** – Tampilan statistik yang disesuaikan dengan role pengguna.
- **Responsive Design** – Nyaman digunakan di HP maupun Laptop (Tailwind CSS).
- **Anti-Loop Route Guard** – Proteksi halaman yang kuat via Next.js Middleware.
- **Form Absensi Siswa** 
- **Dispensasi Siswa** - Pengajuan Dispen kepada guru dan BK 
- **Rekap Guru dan BK** - Melihat siswa yang hadir dan siswa yang tidak hadir
- **Pengaduan BK** - Guru melakukan pengaduan tingkah laku siswa ke BK, BK akan membalas pengaduan tersebut secara realtime



---

## 🛠️ Teknologi yang Digunakan
- **Frontend/Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Authentication:** Next-Auth / Auth.js
- **Database/ORM:** Mongodb
- **Deployment:** Vercel

---

## 🚀 Cara Menjalankan di Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di komputer kamu:

### 1. Clone Repositori
```bash
git clone [https://github.com/Abil-tech/absensi-siswa.git]

### 2. Install Dependencies
npm install 
- bcryptjs
- cloudinary
- dotenv
- mongoose
- next-auth-
- react
- eslint

### 3. Setup .env

MONGODB_URI:
NEXTAUTH_SECRET:
NEXTAUTH_URL:
CLOUDINARY_CLOUD_NAME:
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

### 4. Jalan Server

npm run dev.

masuk ke link http://localhost:3000

Anggota kelompok
- Abil Fida Ismail / Github (Abil-tech)
    (Backend, Api Call)
- Muhammad Zahid Rantisi Github (hddzaa)
    (Frontend)
- Alvairani Jasmine Apringga / Github (alvairani-create)
    (Flowchart, dan database)
- Kanaya Nesha Adisty
    (Tester)
- Nabila Kika Tanya 
    (Website Design)

