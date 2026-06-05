import * as XLSX from "xlsx";

export interface ExcelRow {
  nama: string;
  userId: string;
  password: string;
  nisn: string;
  nis: string;
  kelas: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  noTelepon: string;
  alamat: string;
}

export interface ValidationResult {
  rowNumber: number;
  data?: ExcelRow;
  isValid: boolean;
  errors: string[];
}

/**
 * Parse Excel file dan extract data
 */
export async function parseExcelFile(file: File): Promise<ValidationResult[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: ["nama", "userId", "password", "nisn", "nis", "kelas", "jenisKelamin", "tanggalLahir", "noTelepon", "alamat"],
        });

        const validated = rows
          .filter((row: any) => row.nama) // Skip empty rows
          .map((row: any, idx: number) => validateRow(row, idx + 2)); // +2 because idx starts at 0 and header is row 1

        resolve(validated);
      } catch (err) {
        reject(new Error(`Gagal parse Excel: ${err}`));
      }
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validasi single row
 */
function validateRow(row: any, rowNumber: number): ValidationResult {
  const errors: string[] = [];

  // Normalize data
  const data: ExcelRow = {
    nama: String(row.nama || "").trim(),
    userId: String(row.userId || "").trim(),
    password: String(row.password || "").trim(),
    nisn: String(row.nisn || "").trim().replace(/\D/g, ""),
    nis: String(row.nis || "").trim(),
    kelas: String(row.kelas || "").trim(),
    jenisKelamin: String(row.jenisKelamin || "").trim().toUpperCase() as "L" | "P",
    tanggalLahir: parseTanggal(row.tanggalLahir),
    noTelepon: String(row.noTelepon || "").trim(),
    alamat: String(row.alamat || "").trim(),
  };

  // Validation
  if (!data.nama) errors.push("Nama lengkap wajib diisi");
  if (!data.userId) errors.push("User ID wajib diisi");
  if (!data.password) errors.push("Password wajib diisi");
  if (!/^\d{10}$/.test(data.nisn)) errors.push("NISN harus 10 digit angka");
  if (!data.nis) errors.push("NIS wajib diisi");
  if (!data.kelas) errors.push("Kelas wajib diisi");
  if (!["L", "P"].includes(data.jenisKelamin)) errors.push("Jenis Kelamin harus L atau P");
  if (!data.tanggalLahir) errors.push("Tanggal Lahir format invalid (gunakan DD/MM/YYYY)");
  if (!data.noTelepon) errors.push("No. Telepon wajib diisi");
  if (!data.alamat) errors.push("Alamat wajib diisi");

  return {
    rowNumber,
    data: errors.length === 0 ? data : undefined,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parse tanggal dari berbagai format (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc)
 */
function parseTanggal(dateStr: any): string {
  if (!dateStr) return "";

  // Jika sudah Date object (dari Excel)
  if (dateStr instanceof Date) {
    return dateStr.toISOString().split("T")[0];
  }

  const str = String(dateStr).trim();

  // Try format DD/MM/YYYY atau DD-MM-YYYY
  let match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [_, day, month, year] = match;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900 && y < 2100) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  // Try format YYYY-MM-DD
  match = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (match) {
    const [_, year, month, day] = match;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900 && y < 2100) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  return "";
}

/**
 * Get jurusan dari nama kelas
 */
export function getJurusanFromKelas(kelasNama: string): string {
  if (kelasNama.includes("PPLG")) return "PPLG";
  if (kelasNama.includes("DKV")) return "DKV";
  if (kelasNama.includes("TJKT")) return "TJKT";
  if (kelasNama.includes("MPLB")) return "MPLB";
  if (kelasNama.includes("PM")) return "PM";
  return "";
}