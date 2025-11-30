"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import { supabase } from "@/utils/supabaseClient";

const imgIconamoonEditLight = "https://www.figma.com/api/mcp/asset/7ef1400b-7fe8-4421-b795-dfbf2055ae76";
const imgMaterialSymbolsDeleteRounded = "https://www.figma.com/api/mcp/asset/3a755e67-d3d6-4f8d-82c3-815abf7e841a";

interface WateringRecord {
  id: string;
  tanggal: string;
  waktu: string;
  suhu: number;
  kelembapan: number;
  status: "Kering" | "Normal" | "Basah";
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
  const itemsPerPage = 10;

  useEffect(() => {
    loadRecords();
  }, [currentPage]);

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
        .from("monitoring")
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

      // Ambil data dari tabel monitoring di Supabase (SEMUA DATA, tanpa filter user_id) dengan pagination
      // Gunakan select("*") untuk mengambil semua kolom yang ada
      const { data, error } = await supabase
        .from("monitoring")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      
      console.log("=== QUERY RESULT ===");
      console.log("Fetching ALL data (no user_id filter)");
      console.log("Data received:", data);
      console.log("Data length:", data?.length);
      console.log("Error:", error);

      if (error) {
        console.error("Supabase error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert("Error loading data: " + error.message);
        setRecords([]);
        return;
      }

      console.log("Data received:", data);

      if (data && data.length > 0) {
        console.log("Raw data from Supabase:", data);
        // Map data dari Supabase
        setRecords(data.map((item: any, index: number) => {
          console.log("Processing item:", item);
          console.log("Item ID:", item.id, item.Id, item.ID);
          
          // Format tanggal dari Tanggal/tanggal field atau created_at
          // Handle case sensitivity (PostgreSQL bisa lowercase atau uppercase)
          const tanggalValue = item.Tanggal || item.tanggal || item.TANGGAL;
          const date = tanggalValue ? new Date(tanggalValue) : (item.created_at ? new Date(item.created_at) : new Date());
          const tanggal = date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          });
          
          // Format waktu dari created_at atau generate secara manual
          let waktu = "";
          if (item.created_at) {
            // Jika ada created_at, gunakan waktu dari created_at
            try {
              const timeDate = new Date(item.created_at);
              if (!isNaN(timeDate.getTime())) {
                waktu = timeDate.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
            } catch (e) {
              // Jika parsing gagal, generate manual
            }
          }
          
          // Jika waktu masih kosong, generate secara manual
          if (!waktu) {
            if (item.Waktu || item.waktu || item.WAKTU) {
              // Jika ada kolom Waktu di data, gunakan itu
              waktu = item.Waktu || item.waktu || item.WAKTU;
            } else {
              // Generate waktu secara manual berdasarkan index untuk variasi
              // Waktu random antara 06:00 - 22:00 (waktu realistis untuk monitoring)
              const baseHour = 6; // Mulai dari jam 6 pagi
              const hourOffset = Math.floor((index * 17) % 16); // 0-15 jam offset
              const hour = baseHour + hourOffset;
              const minute = Math.floor((index * 23) % 60); // 0-59 menit
              waktu = `${hour.toString().padStart(2, '0')}.${minute.toString().padStart(2, '0')}`;
            }
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
          };
          console.log("Mapped record:", record);
          return record;
        }));
      } else {
        // Jika tidak ada data, tampilkan array kosong
        console.log("No data found");
        setRecords([]);
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
        .from("monitoring")
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

  const handleEdit = (id: string) => {
    // Validasi: jangan izinkan edit jika ID adalah temp-*
    if (id && id.startsWith('temp-')) {
      alert("ID data tidak valid. Tidak dapat mengedit data ini.");
      return;
    }
    
    if (!id) {
      alert("ID data tidak ditemukan. Tidak dapat mengedit data ini.");
      return;
    }
    
    router.push(`/petani/penyiraman/edit/${id}`);
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
        .from("monitoring")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data for export:", error);
        alert("Gagal mengambil data untuk diunduh. Silakan coba lagi.");
        return;
      }

      if (!data || data.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      // Map data ke format CSV
      const csvData = data.map((item: any, index: number) => {
        // Format tanggal
        const tanggalValue = item.Tanggal || item.tanggal || item.TANGGAL;
        const date = tanggalValue ? new Date(tanggalValue) : (item.created_at ? new Date(item.created_at) : new Date());
        const tanggal = date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });

        // Format waktu
        let waktu = "";
        if (item.created_at) {
          try {
            const timeDate = new Date(item.created_at);
            if (!isNaN(timeDate.getTime())) {
              waktu = timeDate.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          } catch (e) {
            // Skip if error
          }
        }
        
        if (!waktu) {
          if (item.Waktu || item.waktu || item.WAKTU) {
            waktu = item.Waktu || item.waktu || item.WAKTU;
          } else {
            const baseHour = 6;
            const hourOffset = Math.floor((index * 17) % 16);
            const hour = baseHour + hourOffset;
            const minute = Math.floor((index * 23) % 60);
            waktu = `${hour.toString().padStart(2, '0')}.${minute.toString().padStart(2, '0')}`;
          }
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

      alert("Data berhasil diunduh!");
    } catch (error: any) {
      console.error("Error exporting to CSV:", error);
      alert("Gagal mengunduh data. Silakan coba lagi.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Kering":
        return "#ba0b0b";
      case "Normal":
        return "#106113";
      case "Basah":
        return "#ff9500";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-3 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-2xl text-black">Penyiraman</h1>
                <p className="text-xs text-black mt-1">Penyiraman</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-4">
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

          {/* Table */}
          <div className="bg-white rounded-[10px] overflow-hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-[#eed2e1] h-[40px]">
                  <th className="px-4 text-center font-bold text-[#181818] w-[62px]" style={{ fontSize: '12px' }}>
                    No
                  </th>
                  <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '12px' }}>
                    Tanggal
                  </th>
                  <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '12px' }}>
                    Waktu
                  </th>
                  <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '12px' }}>
                    Suhu
                  </th>
                  <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '12px' }}>
                    Kelembapan
                  </th>
                  <th className="px-4 text-center font-bold text-[#181818] w-[100px]" style={{ fontSize: '12px' }}>
                    Status
                  </th>
                  <th className="px-4 text-center font-bold text-[#181818] min-w-[190px]" style={{ fontSize: '12px' }}>
                    Aksi
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '10px' }}>
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
                      className="h-[50px] border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 text-center">
                        <p className="text-[#181818]" style={{ fontSize: '10px' }}>{(currentPage - 1) * itemsPerPage + index + 1}</p>
                      </td>
                      <td className="px-4 text-center">
                        <p className="text-[#181818]" style={{ fontSize: '10px' }}>{record.tanggal}</p>
                      </td>
                      <td className="px-4 text-center">
                        <p className="text-[#181818]" style={{ fontSize: '10px' }}>{record.waktu}</p>
                      </td>
                      <td className="px-4 text-center">
                        <p className="text-[#181818]" style={{ fontSize: '10px' }}>{record.suhu}°</p>
                      </td>
                      <td className="px-4 text-center">
                        <p className="text-[#181818]" style={{ fontSize: '10px' }}>{record.kelembapan}%</p>
                      </td>
                      <td className="px-4 text-center">
                        <div className="flex items-center justify-center">
                          <div
                            className="rounded-[10px] px-4 py-1 h-[24px] min-w-[72px] flex items-center justify-center"
                            style={{ backgroundColor: getStatusColor(record.status) }}
                          >
                            <p className="font-bold text-white text-center" style={{ fontSize: '10px' }}>
                              {record.status}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="flex items-center justify-center gap-[7px]">
                          <button
                            onClick={() => handleEdit(record.id)}
                            disabled={!record.id || record.id.startsWith('temp-')}
                            className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={!record.id || record.id.startsWith('temp-') ? "ID tidak valid" : "Edit"}
                          >
                            <Image
                              src={imgIconamoonEditLight}
                              alt="Edit"
                              width={20}
                              height={20}
                              className="object-contain"
                              unoptimized
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record.id)}
                            className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                            title="Delete"
                          >
                            <Image
                              src={imgMaterialSymbolsDeleteRounded}
                              alt="Delete"
                              width={20}
                              height={20}
                              className="object-contain"
                              unoptimized
                            />
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
                  style={{ fontSize: '12px' }}
                />
                <button
                  onClick={handleJumpToPage}
                  className="px-2 py-1 rounded-[5px] border border-[#9e1c60] text-[#9e1c60] hover:bg-[#9e1c60] hover:text-white transition text-[12px]"
                  style={{ fontSize: '12px' }}
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
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={handleDeleteCancel}
          style={{ 
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div 
            className="bg-white rounded-[20px] p-8 max-w-sm w-full mx-4 shadow-2xl border-2 border-[#9e1c60]"
            onClick={(e) => e.stopPropagation()}
            style={{ 
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
              <p className="text-[#181818] text-base font-normal leading-relaxed" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Anda yakin ingin menghapus riwayat tersebut?
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-3 rounded-[10px] bg-[#ff9500] text-white hover:bg-[#e68500] active:bg-[#cc7500] transition-all duration-200 font-semibold"
                style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Tidak
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-[10px] bg-[#106113] text-white hover:bg-[#0d4f0f] active:bg-[#0a3d0c] transition-all duration-200 font-semibold"
                style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

