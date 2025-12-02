"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import { supabase } from "@/utils/supabaseClient";
import { predictStatus } from "@/utils/predict";

interface WateringRecord {
  id: string;
  tanggal: string;
  waktu: string;
  suhu: number;
  kelembapan: number;
  status: "Kering" | "Normal" | "Basah";
  mlPrediction?: string | null;
  prediksiSuhu?: number | null;
  prediksiKelembapan?: number | null;
}

export default function PenyiramanPage() {
  const router = useRouter();
  const [records, setRecords] = useState<WateringRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [latestPrediction, setLatestPrediction] = useState<{
    prediksiSuhu: number | null;
    prediksiKelembapan: number | null;
  }>({
    prediksiSuhu: null,
    prediksiKelembapan: null,
  });
  const [exportMessage, setExportMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({ text: "", type: null });
  const itemsPerPage = 10;

  useEffect(() => {
    loadRecords();
  }, [currentPage]);

  const loadMLPrediction = async (record: WateringRecord) => {
    // Hanya load prediksi ML untuk record terbaru (untuk card)
    try {
      // Ambil jam dari waktu untuk prediksi ML
      let hour = new Date().getHours(); // Default: jam saat ini
      if (record.waktu) {
        const timeMatch = record.waktu.match(/(\d{1,2})[.:](\d{2})/);
        if (timeMatch) {
          hour = parseInt(timeMatch[1]);
        }
      }

      console.log(`[ML Prediction] Request untuk record terbaru ${record.id}:`, {
        suhu: record.suhu,
        kelembapan: record.kelembapan,
        hour: hour
      });

      const predictionResult = await predictStatus(record.suhu, record.kelembapan, hour);

      console.log(`[ML Prediction] Response untuk record terbaru ${record.id}:`, predictionResult);

      // Update latest prediction langsung ke state
      setLatestPrediction({
        prediksiSuhu: predictionResult.prediksi_suhu || null,
        prediksiKelembapan: predictionResult.prediksi_kelembapan || null,
      });
    } catch (error) {
      console.error(`[ML Prediction] Error untuk record terbaru ${record.id}:`, error);
      // Jika error, set null
      setLatestPrediction({
        prediksiSuhu: null,
        prediksiKelembapan: null,
      });
    }
  };

  const loadRecords = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        alert("Error: " + userError.message);
        return;
      }

      if (!user) {
        router.push("/masuk");
        return;
      }

      console.log("Loading records for user:", user.id);
      console.log("Current page:", currentPage);

      // Hitung total records untuk pagination (SEMUA DATA, tanpa filter user_id)
      const { count, error: countError } = await supabase
        .from("penyiraman")
        .select("*", { count: "exact", head: true });

      console.log("=== COUNT QUERY ===");
      console.log("Count result (ALL DATA):", count);
      console.log("Count error:", countError);

      if (countError) {
        console.error("Error counting records:", countError);
        setTotalRecords(0);
      } else {
        setTotalRecords(count || 0);
        console.log("Total records in table:", count);
      }

      // Hitung offset untuk pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      console.log("=== FETCHING DATA ===");
      console.log("Page:", currentPage);
      console.log("Items per page:", itemsPerPage);
      console.log("Range:", from, "to", to);

      // Ambil data dari tabel penyiraman di Supabase (SEMUA DATA, tanpa filter user_id) dengan pagination
      // Gunakan select("*") untuk mengambil semua kolom yang ada
      const { data, error } = await supabase
        .from("penyiraman")
        .select("*")
        .order("id", { ascending: false })
        .range(from, to);

      console.log("=== QUERY RESULT ===");
      console.log("Fetching ALL data (no user_id filter)");
      console.log("Data received:", data);
      console.log("Data length:", data?.length);
      console.log("Error:", error);

      // Debug: Cek apakah ada RLS policy yang memblokir
      if (error) {
        console.error("Supabase error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Jika error terkait RLS/permission
        if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.error("⚠️ RLS Policy Issue: Tabel penyiraman mungkin memiliki Row Level Security yang memblokir akses.");
          console.error("💡 Solusi: Di Supabase, buka tabel penyiraman > Settings > Disable RLS atau buat policy yang mengizinkan SELECT untuk authenticated users");
        }

        alert("Error loading data: " + error.message);
        setRecords([]);
        return;
      }

      // Jika tidak ada error tapi data kosong, kemungkinan RLS memblokir
      if (!error && (!data || data.length === 0)) {
        console.warn("⚠️ Query berhasil tapi tidak ada data. Kemungkinan:");
        console.warn("1. RLS Policy memblokir akses - cek di Supabase Table Editor > Settings");
        console.warn("2. Tabel memang kosong - cek langsung di Supabase");
        console.warn("3. Kolom id tidak ada atau berbeda - cek struktur tabel");
      }

      console.log("Data received:", data);

      if (data && data.length > 0) {
        console.log("Raw data from Supabase:", data);
        // Map data dari Supabase
        const mappedRecords = data.map((item: any, index: number) => {
          console.log("Processing item:", item);
          console.log("Item ID:", item.id, item.Id, item.ID);

          // Format tanggal dari Tanggal/tanggal field
          // Handle case sensitivity (PostgreSQL bisa lowercase atau uppercase)
          const tanggalValue = item.Tanggal || item.tanggal || item.TANGGAL;

          // Parse tanggal dan waktu dari format "DD/MM/YYYY HH:MM" atau "MM/DD/YYYY HH:MM"
          let tanggal = "";
          let waktu = "";

          if (tanggalValue) {
            // Coba parse format "DD/MM/YYYY HH:MM" atau "MM/DD/YYYY HH:MM"
            const parts = tanggalValue.toString().trim().split(" ");
            if (parts.length >= 2) {
              // Ada tanggal dan waktu
              const datePart = parts[0]; // "06/02/2022"
              const timePart = parts[1]; // "01:25"

              // Parse tanggal (format DD/MM/YYYY)
              const dateParts = datePart.split("/");
              if (dateParts.length === 3) {
                const day = dateParts[0];
                const month = dateParts[1];
                const year = dateParts[2];
                tanggal = `${day}/${month}/${year}`;
              }

              // Parse waktu (format HH:MM)
              if (timePart) {
                waktu = timePart.replace(":", ".");
              }
            } else {
              // Hanya tanggal saja, coba parse sebagai date
              try {
                const date = new Date(tanggalValue);
                if (!isNaN(date.getTime())) {
                  tanggal = date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  });
                }
              } catch (e) {
                // Jika parsing gagal, gunakan nilai asli
                tanggal = tanggalValue;
              }
            }
          }

          // Fallback: jika waktu masih kosong, cek kolom Waktu terpisah
          if (!waktu) {
            if (item.Waktu || item.waktu || item.WAKTU) {
              waktu = String(item.Waktu || item.waktu || item.WAKTU).trim();
              // Jika format waktu menggunakan titik dua, ubah ke titik
              if (waktu.includes(':')) {
                waktu = waktu.replace(/:/g, '.');
              }
            }
          }

          // Jika masih kosong, generate default
          if (!tanggal) {
            tanggal = new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            });
          }

          if (!waktu) {
            // Generate waktu secara manual berdasarkan index untuk variasi
            const baseHour = 6;
            const hourOffset = Math.floor((index * 17) % 16);
            const hour = baseHour + hourOffset;
            const minute = Math.floor((index * 23) % 60);
            waktu = `${hour.toString().padStart(2, '0')}.${minute.toString().padStart(2, '0')}`;
          }

          // Tentukan status berdasarkan Kelembapan/kelembapan
          // Handle case sensitivity
          const kelembapanValue = item.Kelembapan || item.kelembapan || item.KELEMBAPAN || 0;
          let status: "Kering" | "Normal" | "Basah" = "Normal";
          if (kelembapanValue !== undefined && kelembapanValue !== null) {
            if (kelembapanValue < 55) {
              status = "Kering";
            } else if (kelembapanValue >= 55 && kelembapanValue < 70) {
              status = "Normal";
            } else {
              status = "Basah";
            }
          }

          // Handle case sensitivity untuk Suhu
          const suhuValue = item.Suhu || item.suhu || item.SUHU || 0;

          // Handle case sensitivity untuk ID - Supabase biasanya menggunakan lowercase 'id'
          const recordId = item.id || item.Id || item.ID;

          if (!recordId) {
            console.warn("Record tanpa ID ditemukan:", item);
          }

          const record = {
            id: recordId || `temp-${index}`,
            tanggal,
            waktu,
            suhu: suhuValue,
            kelembapan: kelembapanValue,
            status,
            mlPrediction: null,
            prediksiSuhu: null,
            prediksiKelembapan: null,
          };

          console.log("Mapped record:", record);
          return record;
        });

        setRecords(mappedRecords);

        // Load ML prediction hanya untuk record terbaru (untuk card)
        if (mappedRecords.length > 0) {
          loadMLPrediction(mappedRecords[0]);
        }
      } else {
        // Jika tidak ada data, tampilkan array kosong dan reset prediksi
        console.log("No data found");
        setRecords([]);
        setLatestPrediction({
          prediksiSuhu: null,
          prediksiKelembapan: null,
        });
      }
    } catch (error: any) {
      console.error("Error loading records:", error);
      alert("Error: " + (error.message || "Failed to load data"));
      // Set array kosong jika error
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("penyiraman")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      // Reload records - jika data di halaman ini habis, kembali ke halaman sebelumnya
      const remainingRecords = records.length - 1;
      if (remainingRecords === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        loadRecords();
      }

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Gagal menghapus riwayat. Silakan coba lagi.");
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };


  const handleJumpToPage = () => {
    const pageNumber = parseInt(pageInput);
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    if (isNaN(pageNumber) || pageNumber < 1) {
      alert("Masukkan nomor halaman yang valid (minimal 1)");
      setPageInput("");
      return;
    }

    if (pageNumber > totalPages) {
      alert(`Halaman tidak valid. Maksimal halaman ${totalPages}`);
      setPageInput("");
      return;
    }

    setCurrentPage(pageNumber);
    setPageInput("");
  };

  const handleGoToFirstPage = () => {
    setCurrentPage(1);
  };

  const handleGoToLastPage = () => {
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    setCurrentPage(totalPages);
  };

  const exportToCSV = async () => {
    try {
      // Ambil semua data tanpa pagination
      const { data, error } = await supabase
        .from("penyiraman")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching data for export:", error);
        setExportMessage({ text: "Gagal mengambil data untuk diunduh. Silakan coba lagi.", type: "error" });
        setTimeout(() => setExportMessage({ text: "", type: null }), 5000);
        return;
      }

      if (!data || data.length === 0) {
        setExportMessage({ text: "Tidak ada data untuk diunduh.", type: "error" });
        setTimeout(() => setExportMessage({ text: "", type: null }), 5000);
        return;
      }

      // Map data ke format CSV
      const csvData = data.map((item: any, index: number) => {
        // Format tanggal dan waktu dari kolom Tanggal
        const tanggalValue = item.Tanggal || item.tanggal || item.TANGGAL;

        let tanggal = "";
        let waktu = "";

        if (tanggalValue) {
          // Parse format "DD/MM/YYYY HH:MM"
          const parts = tanggalValue.toString().trim().split(" ");
          if (parts.length >= 2) {
            const datePart = parts[0];
            const timePart = parts[1];

            const dateParts = datePart.split("/");
            if (dateParts.length === 3) {
              const day = dateParts[0];
              const month = dateParts[1];
              const year = dateParts[2];
              tanggal = `${day}/${month}/${year}`;
            }

            if (timePart) {
              waktu = timePart.replace(":", ".");
            }
          } else {
            try {
              const date = new Date(tanggalValue);
              if (!isNaN(date.getTime())) {
                tanggal = date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                });
              }
            } catch (e) {
              tanggal = tanggalValue;
            }
          }
        }

        // Fallback untuk waktu
        if (!waktu) {
          if (item.Waktu || item.waktu || item.WAKTU) {
            waktu = String(item.Waktu || item.waktu || item.WAKTU).trim();
            if (waktu.includes(':')) {
              waktu = waktu.replace(/:/g, '.');
            }
          } else {
            const baseHour = 6;
            const hourOffset = Math.floor((index * 17) % 16);
            const hour = baseHour + hourOffset;
            const minute = Math.floor((index * 23) % 60);
            waktu = `${hour.toString().padStart(2, '0')}.${minute.toString().padStart(2, '0')}`;
          }
        }

        if (!tanggal) {
          tanggal = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          });
        }

        // Tentukan status
        const kelembapanValue = item.Kelembapan || item.kelembapan || item.KELEMBAPAN || 0;
        let status = "Normal";
        if (kelembapanValue !== undefined && kelembapanValue !== null) {
          if (kelembapanValue < 55) {
            status = "Kering";
          } else if (kelembapanValue >= 55 && kelembapanValue < 70) {
            status = "Normal";
          } else {
            status = "Basah";
          }
        }

        const suhuValue = item.Suhu || item.suhu || item.SUHU || 0;

        return {
          No: index + 1,
          Tanggal: tanggal,
          Waktu: waktu,
          Suhu: `${suhuValue}°`,
          Kelembapan: `${kelembapanValue}%`,
          Status: status,
        };
      });

      // Convert ke CSV format
      const headers = ["No", "Tanggal", "Waktu", "Suhu", "Kelembapan", "Status"];
      const csvRows = [
        headers.join(","),
        ...csvData.map((row) =>
          headers.map((header) => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");

      // Add BOM for UTF-8 to support Indonesian characters in Excel
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `data_penyiraman_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage({ text: "Data berhasil diunduh!", type: "success" });
      setTimeout(() => setExportMessage({ text: "", type: null }), 5000);
    } catch (error: any) {
      console.error("Error exporting to CSV:", error);
      setExportMessage({ text: "Gagal mengunduh data. Silakan coba lagi.", type: "error" });
      setTimeout(() => setExportMessage({ text: "", type: null }), 5000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Kering":
        return "#dc2626";
      case "Normal":
        return "#106113";
      case "Basah":
        return "#ff9500";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="min-h-screen bg-[#fef7f5] flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen bg-[#fef7f5]" style={{ minHeight: '100vh', width: 'calc(100% - 180px)', paddingBottom: '40px' }}>
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-3xl text-black">Penyiraman</h1>
                <p className="text-sm text-black mt-1">Penyiraman</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-4">
            {/* Info Message */}
            {exportMessage.text && exportMessage.type && (
              <div
                className={`mb-3 px-4 py-2 rounded-[10px] flex items-center gap-2 ${exportMessage.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}
              >
                {exportMessage.type === "success" ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{exportMessage.text}</span>
              </div>
            )}

            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-[#9e1c60] text-white rounded-[10px] hover:bg-[#7d1650] hover:shadow-md transition-all duration-200 flex items-center gap-2"
              style={{ fontSize: '12px' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Unduh Data (CSV)
            </button>
          </div>

          {/* Prediction Cards */}
          <div className="mb-4 flex gap-4 flex-wrap">
            {/* Prediksi Suhu Card */}
            <div className="border border-[#9e1c60] rounded-[10px] p-4 bg-white flex-1 min-w-[200px]">
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Prediksi Suhu
              </p>
              <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#9e1c60' }}>
                {latestPrediction.prediksiSuhu !== null && latestPrediction.prediksiSuhu !== undefined
                  ? `${latestPrediction.prediksiSuhu.toFixed(2)}°`
                  : isLoading
                    ? "Loading..."
                    : "N/A"}
              </p>
            </div>

            {/* Prediksi Kelembapan Card */}
            <div className="border border-[#9e1c60] rounded-[10px] p-4 bg-white flex-1 min-w-[200px]">
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Prediksi Kelembapan
              </p>
              <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#9e1c60' }}>
                {latestPrediction.prediksiKelembapan !== null && latestPrediction.prediksiKelembapan !== undefined
                  ? `${latestPrediction.prediksiKelembapan.toFixed(2)}%`
                  : isLoading
                    ? "Loading..."
                    : "N/A"}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-[15px] overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[#eed2e1] h-[40px]">
                    <th className="px-4 text-center font-bold text-[#181818] w-[62px]" style={{ fontSize: '14px' }}>
                      No
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '14px' }}>
                      Tanggal
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '14px' }}>
                      Waktu
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '14px' }}>
                      Suhu
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '14px' }}>
                      Kelembapan
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] w-[100px]" style={{ fontSize: '14px' }}>
                      Status
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] w-[100px]" style={{ fontSize: '14px' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)' }}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '12px' }}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '12px' }}>
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    records.map((record, index) => (
                      <tr
                        key={record.id}
                        className="h-[50px] border-b border-[#9e1c60]/15 last:border-b-0 transition"
                        style={{
                          background: 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to bottom, #faf5f8 0%, #f5e8f0 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)';
                        }}
                      >
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{(currentPage - 1) * itemsPerPage + index + 1}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{record.tanggal}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{record.waktu}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{record.suhu}°</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{record.kelembapan}%</p>
                        </td>
                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div
                              className="rounded-[10px] px-4 py-1 h-[24px] min-w-[72px] flex items-center justify-center"
                              style={{ backgroundColor: getStatusColor(record.status) }}
                            >
                              <p className="font-bold text-white text-center" style={{ fontSize: '12px' }}>
                                {record.status}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleDeleteClick(record.id)}
                              className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                              title="Hapus"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#dc2626" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!isLoading && records.length > 0 && (
            <div className="mt-4 px-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[#181818]" style={{ fontSize: '12px' }}>
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentPage === 1) return;
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? "px-3 py-1 rounded-[10px] cursor-not-allowed pointer-events-none" : "px-3 py-1 rounded-[10px] border-2 border-[#9e1c60] text-[#9e1c60] hover:bg-[#9e1c60] hover:text-white transition"}
                    style={{
                      fontSize: '12px',
                      borderWidth: '2px',
                      ...(currentPage === 1 ? {
                        border: '2px solid #a8a8a8',
                        background: '#c0c0c0',
                        color: '#666666'
                      } : {})
                    }}
                  >
                    Sebelumnya
                  </button>

                  <span className="text-[#181818] px-2" style={{ fontSize: '12px' }}>
                    Halaman {currentPage} dari {Math.ceil(totalRecords / itemsPerPage)}
                  </span>

                  <button
                    onClick={() => {
                      if (currentPage >= Math.ceil(totalRecords / itemsPerPage)) return;
                      setCurrentPage(prev => Math.min(Math.ceil(totalRecords / itemsPerPage), prev + 1));
                    }}
                    disabled={currentPage >= Math.ceil(totalRecords / itemsPerPage)}
                    className={currentPage >= Math.ceil(totalRecords / itemsPerPage) ? "px-3 py-1 rounded-[10px] cursor-not-allowed pointer-events-none" : "px-3 py-1 rounded-[10px] border-2 border-[#9e1c60] text-[#9e1c60] hover:bg-[#9e1c60] hover:text-white transition"}
                    style={{
                      fontSize: '12px',
                      borderWidth: '2px',
                      ...(currentPage >= Math.ceil(totalRecords / itemsPerPage) ? {
                        border: '2px solid #a8a8a8',
                        background: '#c0c0c0',
                        color: '#666666'
                      } : {})
                    }}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>

              {/* Jump to Page Input */}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[#181818]" style={{ fontSize: '12px' }}>Lompat ke:</span>
                <input
                  type="number"
                  min="1"
                  max={Math.ceil(totalRecords / itemsPerPage)}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJumpToPage();
                    }
                  }}
                  className="w-12 px-2 py-1 rounded-[5px] border border-gray-300 text-center text-[12px] focus:outline-none focus:border-[#9e1c60]"
                  placeholder="..."
                  style={{ fontSize: '14px' }}
                />
                <button
                  onClick={handleJumpToPage}
                  className="px-2 py-1 rounded-[5px] border-2 border-[#9e1c60] text-[#9e1c60] hover:bg-[#9e1c60] hover:text-white transition text-[12px]"
                  style={{ fontSize: '14px' }}
                >
                  Masuk
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 py-8"
          onClick={handleDeleteCancel}
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <div
            className="rounded-[15px] p-8 max-w-sm w-full mx-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)',
              border: '1px solid rgba(158, 28, 96, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-[#9e1c60] flex items-center justify-center bg-white">
                <span className="text-4xl text-[#9e1c60] font-bold leading-none">!</span>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-[#181818] text-lg font-normal leading-relaxed" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Anda yakin ingin menghapus riwayat tersebut?
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-3 rounded-[10px] bg-[#ff9500] text-white hover:bg-[#e68500] transition font-semibold"
                style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-[10px] bg-[#dc2626] text-white hover:bg-[#b91c1c] transition font-semibold"
                style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

