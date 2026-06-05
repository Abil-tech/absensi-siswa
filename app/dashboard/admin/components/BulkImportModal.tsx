"use client";

import { useState } from "react";
import {
    parseExcelFile,
    ValidationResult,
    getJurusanFromKelas,
    ExcelRow,
} from "@/lib/utils/parseExcel";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    kelasList: Array<{ id: string; nama: string }>;
}

type Step = "upload" | "preview" | "progress" | "result";

export default function BulkImportModal({
    isOpen,
    onClose,
    onSuccess,
    kelasList,
}: Props) {
    const [step, setStep] = useState<Step>("upload");
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [importResults, setImportResults] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    // ── STEP 1: Upload ──
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const results = await parseExcelFile(file);
            setValidationResults(results);
            setStep("preview");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Gagal membaca file Excel"
            );
        } finally {
            setLoading(false);
        }
    }

    // ── STEP 2: Preview ──
    function handleConfirmImport() {
        const validData = validationResults
            .filter((r) => r.isValid && r.data)
            .map((r) => r.data as ExcelRow);

        if (validData.length === 0) {
            setError("Tidak ada data valid untuk diimport");
            return;
        }

        setStep("progress");
        performBulkImport(validData);
    }

    // ── STEP 3: Import Progress ──
    async function performBulkImport(siswaList: ExcelRow[]) {
        try {
            const response = await fetch("/api/admin/siswa/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siswaList }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal import siswa");
            }

            setImportResults(data.results);
            setProgress(100);
            setStep("result");

            // Auto close after 3 seconds if all success
            if (data.results.failed === 0 && data.results.skipped === 0) {
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 2000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal import siswa");
            setStep("result");
        }
    }

    function handleClose() {
        setStep("upload");
        setValidationResults([]);
        setImportResults(null);
        setProgress(0);
        setError(null);
        onClose();
    }

    // ── RENDER: Upload ──
    if (step === "upload") {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-2">
                        Import Siswa dari Excel
                    </h2>
                    <p className="text-[13px] text-[#9a9a9a] mb-6">
                        Upload file Excel untuk menambah hingga 1000 siswa sekaligus
                    </p>

                    <div className="border-2 border-dashed border-[#d0d0c8] rounded-xl p-8 text-center mb-6 bg-[#f9f9f5] hover:border-[#7fe05b] transition-colors">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="mx-auto mb-3 text-[#9a9a9a]"
                        >
                            <path
                                d="M12 2v16m8-8H4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M19 19H5a2 2 0 0 0-2 2v1h18v-1a2 2 0 0 0-2-2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <label className="block cursor-pointer">
                            <span className="text-[13px] font-bold text-[#111410]">
                                Pilih file Excel
                            </span>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                disabled={loading}
                                className="hidden"
                                id="excel-upload"
                                name="excel-upload"
                            />
                        </label>
                        <p className="text-[12px] text-[#9a9a9a] mt-2">
                            atau drag file ke sini
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-2.5 rounded-xl border-2 border-[#e8e8e0] text-[#6b6b6b] font-bold text-[13px] hover:bg-[#f0f0ea] transition"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── RENDER: Preview ──
    if (step === "preview") {
        const validCount = validationResults.filter((r) => r.isValid).length;
        const invalidCount = validationResults.filter((r) => !r.isValid).length;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-1">
                        Preview Data
                    </h2>
                    <p className="text-[13px] text-[#9a9a9a] mb-6">
                        {validCount} valid · {invalidCount} error
                    </p>

                    <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                        {validationResults.map((result) => (
                            <div
                                key={result.rowNumber}
                                className={`p-3 rounded-lg text-[12px] ${result.isValid
                                        ? "bg-[#f0fce8] text-[#4a9e2f] border border-[#d4f5b7]"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                            >
                                <p className="font-bold">
                                    Baris {result.rowNumber}:{" "}
                                    {result.data?.nama || "N/A"}
                                </p>
                                {!result.isValid && (
                                    <p className="text-[11px] mt-1 opacity-80">
                                        {result.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep("upload")}
                            className="flex-1 py-2.5 rounded-xl border-2 border-[#e8e8e0] text-[#6b6b6b] font-bold text-[13px] hover:bg-[#f0f0ea] transition"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={handleConfirmImport}
                            disabled={validCount === 0}
                            className="flex-1 py-2.5 rounded-xl bg-[#111410] hover:bg-[#1e1e16] disabled:opacity-50 text-[#7fe05b] font-bold text-[13px] transition"
                        >
                            Import {validCount} Siswa
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── RENDER: Progress ──
    if (step === "progress") {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-6 text-center">
                        Sedang Import...
                    </h2>

                    <div className="mb-6">
                        <div className="w-full h-2 bg-[#e8e8e0] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#7fe05b] transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-center text-[12px] text-[#9a9a9a] mt-3">
                            {progress}%
                        </p>
                    </div>

                    <p className="text-center text-[13px] text-[#6b6b6b]">
                        Mohon tunggu...
                    </p>
                </div>
            </div>
        );
    }

    // ── RENDER: Result ──
    if (step === "result" && importResults) {
        const { success, skipped, failed } = importResults;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <div className="text-center mb-6">
                        {failed === 0 && skipped === 0 ? (
                            <>
                                <div className="text-5xl mb-3">✓</div>
                                <h2 className="text-xl font-extrabold text-[#1a1a1a]">
                                    Import Sukses!
                                </h2>
                            </>
                        ) : (
                            <>
                                <div className="text-5xl mb-3">⚠️</div>
                                <h2 className="text-xl font-extrabold text-[#1a1a1a]">
                                    Import Selesai
                                </h2>
                            </>
                        )}
                    </div>

                    <div className="space-y-2 mb-6 bg-[#f9f9f5] p-4 rounded-lg">
                        <p className="text-[13px] text-[#4a9e2f] font-bold">
                            ✓ Berhasil: {success}
                        </p>
                        {skipped > 0 && (
                            <p className="text-[13px] text-[#f59e0b] font-bold">
                                ⊘ Skip: {skipped} (sudah ada)
                            </p>
                        )}
                        {failed > 0 && (
                            <p className="text-[13px] text-red-600 font-bold">
                                ✕ Gagal: {failed}
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            onSuccess();
                            handleClose();
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#111410] hover:bg-[#1e1e16] text-[#7fe05b] font-bold text-[13px] transition"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        );
    }

    return null;
}