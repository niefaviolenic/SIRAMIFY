"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";

const imgNext = "https://www.figma.com/api/mcp/asset/63061aea-3f25-4ce0-9d86-aa72b63f52d3";

export default function EditPenyiramanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    tanggal: "",
    waktu: "",
    suhu: "",
    kelembapan: "",
    status: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      console.log("=== EDIT PAGE DEBUG ===");
      console.log("ID dari URL:", id);
      console.log("Tipe ID:", typeof id);
      
      // Validasi ID: jangan izinkan ID temp-*
      if (!id || id.startsWith('temp-')) {
        console.error("ID tidak valid:", id);
        alert("ID data tidak valid. Tidak dapat memuat data untuk diedit.");
        router.push("/petani/penyiraman");
        return;
      }

      // Coba query dengan berbagai variasi nama field ID
      let data = null;
      let error = null;

      // Coba dengan 'id' (lowercase - default Supabase)
      const result1 = await supabase
        .from("monitoring")
        .select("*")
        .eq("id", id)
        .single();
      
      console.log("Query dengan 'id':", result1);

      if (result1.data && !result1.error) {
        data = result1.data;
      } else {
        // Coba dengan 'Id' (PascalCase)
        const result2 = await supabase
          .from("monitoring")
          .select("*")
          .eq("Id", id)
          .single();
        
        console.log("Query dengan 'Id':", result2);
        
        if (result2.data && !result2.error) {
          data = result2.data;
        } else {
          // Coba dengan 'ID' (uppercase)
          const result3 = await supabase
          .from("monitoring")
          .select("*")
          .eq("ID", id)
          .single();
          
          console.log("Query dengan 'ID':", result3);
          
          if (result3.data && !result3.error) {
            data = result3.data;
          } else {
            error = result1.error || result2.error || result3.error;
          }
        }
      }

      if (error) {
        console.error("Error loading data:", error);
        console.error("Error message:", error.message);
        console.error("Error details:", error);
        alert(`Gagal memuat data: ${error.message || "Data tidak ditemukan"}`);
        router.push("/petani/penyiraman");
        return;
      }

      if (!data) {
        console.error("Data tidak ditemukan untuk ID:", id);
        alert("Data tidak ditemukan. Pastikan ID valid.");
        router.push("/petani/penyiraman");
        return;
      }

      console.log("Data berhasil dimuat:", data);

      if (data) {
        // Format tanggal
        const tanggalValue = data.Tanggal || data.tanggal || data.TANGGAL;
        const date = tanggalValue ? new Date(tanggalValue) : (data.created_at ? new Date(data.created_at) : new Date());
        const tanggal = date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        });

        // Format waktu - sama seperti di halaman penyiraman
        // Karena waktu diisi manual, ambil dari created_at
        let waktu = "";
        
        // Prioritas: kolom Waktu jika ada, jika tidak gunakan created_at
        if (data.Waktu || data.waktu || data.WAKTU) {
          waktu = String(data.Waktu || data.waktu || data.WAKTU).trim();
          // Jika format waktu menggunakan titik (12.00), ubah ke titik dua (12:00) untuk input
          if (waktu.includes('.')) {
            waktu = waktu.replace(/\./g, ':');
          }
        } else if (data.created_at) {
          // Gunakan waktu dari created_at (sama seperti di halaman penyiraman)
          try {
            const timeDate = new Date(data.created_at);
            if (!isNaN(timeDate.getTime())) {
              // Gunakan format id-ID seperti di halaman penyiraman, lalu ubah titik jadi titik dua
              waktu = timeDate.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });
              // Ubah format dari "12.00" menjadi "12:00" untuk input
              if (waktu.includes('.')) {
                waktu = waktu.replace(/\./g, ':');
              }
            }
          } catch (e) {
            console.error("Error parsing waktu:", e);
          }
        }

        // Tentukan status
        const kelembapanValue = data.Kelembapan || data.kelembapan || data.KELEMBAPAN || 0;
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

        const suhuValue = data.Suhu || data.suhu || data.SUHU || 0;

        console.log("Setting form data:", {
          tanggal,
          waktu,
          suhu: suhuValue.toString(),
          kelembapan: kelembapanValue.toString(),
          status
        });

        // Pastikan semua field terisi dengan benar
        const finalWaktu = waktu && waktu.trim() !== "" ? waktu : "";
        const finalTanggal = tanggal && tanggal.trim() !== "" ? tanggal : "";
        const finalSuhu = suhuValue ? String(suhuValue) : "";
        const finalKelembapan = kelembapanValue ? String(kelembapanValue) : "";
        const finalStatus = status && status.trim() !== "" ? status : "";

        console.log("Final form data values:", {
          tanggal: finalTanggal,
          waktu: finalWaktu,
          suhu: finalSuhu,
          kelembapan: finalKelembapan,
          status: finalStatus
        });

        setFormData({
          tanggal: finalTanggal,
          waktu: finalWaktu,
          suhu: finalSuhu,
          kelembapan: finalKelembapan,
          status: finalStatus,
        });
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      alert("Gagal memuat data. Silakan coba lagi.");
      router.push("/petani/penyiraman");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Convert tanggal dari mm/dd/yy ke format yang bisa disimpan
      const [month, day, year] = formData.tanggal.split("/");
      const fullYear = "20" + year;
      const tanggalFormatted = `${fullYear}-${month}-${day}`;

      // Update data di Supabase
      const updateData: any = {
        Tanggal: tanggalFormatted,
        Waktu: formData.waktu,
        Suhu: parseFloat(formData.suhu),
        Kelembapan: parseFloat(formData.kelembapan),
      };

      const { error } = await supabase
        .from("monitoring")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      alert("Data berhasil diperbarui!");
      router.push("/petani/penyiraman");
    } catch (error: any) {
      console.error("Error updating data:", error);
      alert("Gagal memperbarui data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/petani/penyiraman");
  };

  return (
    <div className="min-h-screen bg-[#fef7f5] flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-3 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-3xl text-black">Edit Data Penyiraman</h1>
                <p className="text-sm text-black mt-1">Penyiraman/Edit Data Penyiraman</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Form */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                {/* Row 1: Tanggal & Waktu */}
                <div className="flex gap-6">
                  <div className="flex flex-col gap-[11px] flex-1">
                    <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                      Tanggal Penyiraman
                    </label>
                    <input
                      type="text"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      placeholder="mm/dd/yy"
                      className={`bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] ${formData.tanggal ? 'text-black' : 'text-black/50'}`}
                      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-[11px] flex-1">
                    <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                      Waktu Penyiraman
                    </label>
                    <input
                      type="text"
                      value={formData.waktu}
                      onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                      placeholder="12:00"
                      className={`bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] ${formData.waktu && formData.waktu.trim() !== "" ? 'text-black' : 'text-black/50'}`}
                      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Suhu & Kelembapan */}
                <div className="flex gap-6">
                  <div className="flex flex-col gap-[11px] flex-1">
                    <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                      Suhu
                    </label>
                    <input
                      type="text"
                      value={formData.suhu}
                      onChange={(e) => setFormData({ ...formData, suhu: e.target.value })}
                      placeholder="26.5°"
                      className={`bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] ${formData.suhu ? 'text-black' : 'text-black/50'}`}
                      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-[11px] flex-1">
                    <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                      Kelembapan
                    </label>
                    <input
                      type="text"
                      value={formData.kelembapan}
                      onChange={(e) => setFormData({ ...formData, kelembapan: e.target.value })}
                      placeholder="53%"
                      className={`bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] ${formData.kelembapan ? 'text-black' : 'text-black/50'}`}
                      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Status */}
                <div className="flex flex-col gap-[11px]">
                  <label className="font-bold text-black" style={{ fontSize: '12px' }}>
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setIsDropdownOpen(false)}
                      className={`bg-[#f5f5f5] h-[35px] px-3 py-2 pr-8 rounded-[5px] border-0 outline-none focus:ring-2 focus:ring-inset focus:ring-[#9e1c60] appearance-none w-full ${formData.status ? 'text-black' : 'text-black/50'}`}
                      style={{ 
                        fontFamily: 'Arial, Helvetica, sans-serif', 
                        fontSize: '12px'
                      }}
                      required
                    >
                      <option value="Kering">Kering</option>
                      <option value="Normal">Normal</option>
                      <option value="Basah">Basah</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Image
                        src={imgNext}
                        alt="Dropdown"
                        width={8}
                        height={12}
                        className="opacity-60 transition-transform duration-200 ease-in-out"
                        style={{ 
                          width: '8px', 
                          height: '12px',
                          transform: isDropdownOpen ? 'rotate(-90deg)' : 'rotate(90deg)'
                        }}
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#27a73d] h-[35px] rounded-[5px] text-white font-bold hover:bg-[#1f8a31] transition-colors disabled:opacity-50"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-[#e09028] h-[35px] rounded-[5px] text-white font-bold hover:bg-[#c77a1f] transition-colors"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                  >
                    Kembali
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
