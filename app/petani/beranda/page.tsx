"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import { supabase } from "@/utils/supabaseClient";
import { predictStatus } from "@/utils/predict";

const imgOuiTemperature = "https://www.figma.com/api/mcp/asset/1ccfd9b8-ec7e-49de-9d9b-b2b0c98fc1b8";
const imgMaterialSymbolsHumidityPercentageOutlineRounded = "https://www.figma.com/api/mcp/asset/b0ba560b-c570-4435-ba95-f69584225709";
const imgIconoirSoilAlt = "https://www.figma.com/api/mcp/asset/df5d736e-1cdb-4a8c-acdd-c181032e3576";
const imgMingcutePowerFill = "https://www.figma.com/api/mcp/asset/94f3564e-9888-4307-9622-ad07b90d3648";

interface MonitoringData {
  tanggal: string;
  suhu: number;
  kelembapan: number;
  status: "Kering" | "Normal" | "Basah";
}

export default function BerandaPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Petani");
  const [isWateringOn, setIsWateringOn] = useState(false);
  const [currentData, setCurrentData] = useState({
    suhu: 0,
    kelembapan: 0,
    status: "Normal" as "Kering" | "Normal" | "Basah",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mlPrediction, setMlPrediction] = useState<string | null>(null);
  const [mlPredictionData, setMlPredictionData] = useState<{
    prediksi_suhu: number | null;
    prediksi_kelembapan: number | null;
  } | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    loadMonitoringData();
  }, []);

  useEffect(() => {
    // Panggil prediksi ML saat currentData berubah
    if (currentData.suhu > 0 && currentData.kelembapan > 0) {
      getMLPrediction();
    }
  }, [currentData.suhu, currentData.kelembapan]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     "Petani";
        setUserName(name);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      // Ambil data terbaru dari tabel penyiraman
      const { data, error } = await supabase
        .from("penyiraman")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error loading monitoring data:", error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const item = data[0];
        const suhuValue = item.Suhu || item.suhu || item.SUHU || 0;
        const kelembapanValue = item.Kelembapan || item.kelembapan || item.KELEMBAPAN || 0;
        
        // Tentukan status berdasarkan kelembapan
        let status: "Kering" | "Normal" | "Basah" = "Normal";
        if (kelembapanValue < 55) {
          status = "Kering";
        } else if (kelembapanValue >= 55 && kelembapanValue < 70) {
          status = "Normal";
        } else {
          status = "Basah";
        }

        setCurrentData({
          suhu: suhuValue,
          kelembapan: kelembapanValue,
          status: status,
        });
      }
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMLPrediction = async () => {
    if (isLoadingPrediction || !currentData.suhu || !currentData.kelembapan) {
      return;
    }
    
    setIsLoadingPrediction(true);
    setMlError(null);
    try {
      const currentHour = new Date().getHours();
      const prediction = await predictStatus(currentData.suhu, currentData.kelembapan, currentHour);
      
      if (prediction && prediction.status) {
        setMlPrediction(prediction.status);
        setMlPredictionData({
          prediksi_suhu: prediction.prediksi_suhu,
          prediksi_kelembapan: prediction.prediksi_kelembapan,
        });
        setMlError(null);
        
        setCurrentData(prev => ({
          ...prev,
          status: prediction.status as "Kering" | "Normal" | "Basah",
        }));
      } else {
        setMlPrediction(null);
        setMlPredictionData(null);
        setMlError("API tidak tersedia");
      }
    } catch (error) {
      console.error("Error getting ML prediction:", error);
      setMlPrediction(null);
      setMlError("Gagal memanggil API");
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Kering":
        return "#dc2626";
      case "Normal":
        return "#106113";
      case "Basah":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getKelembapanColor = (kelembapan: number) => {
    if (kelembapan < 55) return "#dc2626";
    if (kelembapan >= 55 && kelembapan < 70) return "#106113";
    return "#3b82f6";
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
                <h1 className="font-bold text-3xl text-black">Beranda</h1>
                <p className="text-sm text-black mt-1">Beranda</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Welcome Banner - JANGAN DIUBAH */}
          <div 
            className="mb-6 relative rounded-[15px] overflow-visible"
            style={{
              background: 'linear-gradient(135deg, #fceef5 0%, #f5d8e5 25%, #eed2e1 50%, #e6c4d2 75%, #ddb5c3 100%)',
              border: '2px solid #9e1c60',
              boxShadow: '0 4px 12px rgba(158, 28, 96, 0.3), 0 2px 4px rgba(158, 28, 96, 0.2)'
            }}
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                {/* Text Content */}
                <div className="flex-1">
                  <h2 className="font-bold text-black mb-2" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Selamat Datang, {userName}!
                  </h2>
                  <p className="text-black" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Pantau kondisi tanaman Anda secara real-time dengan Siramify
                  </p>
                </div>
              </div>
            </div>
            
            {/* Farmer Image */}
            <div className="absolute right-8 md:right-12 bottom-0 w-[180px] h-[180px] md:w-[190px] md:h-[190px] -mt-4 md:-mt-1 z-20 transform translate-y-2 md:translate-y-2">
              <Image
                src="/petani.png"
                alt="Petani"
                fill
                className="object-contain object-center"
                unoptimized
              />
            </div>
          </div>

          {/* Monitoring Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Suhu Card */}
            <div className="rounded-[15px] p-5 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-gray-600 mb-1" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Suhu</p>
                  {isLoading ? (
                    <p className="text-gray-400" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Memuat...</p>
                  ) : (
                    <p className="font-bold text-black" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      {currentData.suhu.toFixed(1)}°
                    </p>
                  )}
                </div>
                <Image
                  src={imgOuiTemperature}
                  alt="Temperature"
                  width={48}
                  height={48}
                  className="object-contain opacity-70"
                  unoptimized
                />
              </div>
            </div>

            {/* Kelembapan Card */}
            <div className="rounded-[15px] p-5 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-gray-600 mb-1" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Kelembapan</p>
                  {isLoading ? (
                    <p className="text-gray-400" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Memuat...</p>
                  ) : (
                    <p className="font-bold text-black" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      {currentData.kelembapan.toFixed(1)}%
                    </p>
                  )}
                </div>
                <Image
                  src={imgMaterialSymbolsHumidityPercentageOutlineRounded}
                  alt="Humidity"
                  width={48}
                  height={48}
                  className="object-contain opacity-70"
                  unoptimized
                />
              </div>
            </div>

            {/* Status Tanah Card - Diperbaiki */}
            <div className="rounded-[15px] p-5 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-gray-600" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Status Tanah</p>
                    {mlPrediction && !isLoadingPrediction && (
                      <span className="px-2 py-0.5 rounded-full bg-[#9e1c60] text-white text-[8px] font-bold" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        ML
                      </span>
                    )}
                  </div>
                  {isLoadingPrediction ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#9e1c60] rounded-full animate-pulse"></div>
                      <p className="text-gray-500" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Memproses...</p>
                    </div>
                  ) : mlError ? (
                    <div className="space-y-1">
                      <p className="font-bold" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', color: getStatusColor(currentData.status) }}>
                        {currentData.status}
                      </p>
                      <p className="text-red-500 text-[10px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        {mlError}
                      </p>
                    </div>
                  ) : (
                    <p className="font-bold" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif', color: getStatusColor(mlPrediction || currentData.status) }}>
                      {mlPrediction || currentData.status}
                    </p>
                  )}
                </div>
                <Image
                  src={imgIconoirSoilAlt}
                  alt="Soil"
                  width={48}
                  height={48}
                  className="object-contain opacity-70"
                  unoptimized
                />
              </div>
              {!isLoadingPrediction && (
                <button
                  onClick={getMLPrediction}
                  className="mt-3 w-full bg-[#9e1c60] text-white rounded-[8px] py-2 px-3 hover:bg-[#7d1650] transition-colors text-[11px] font-semibold"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  Refresh Prediksi ML
                </button>
              )}
            </div>
          </div>

          {/* Status Penyiraman Card - Diperbaiki */}
          <div className="rounded-[15px] p-6 shadow-lg mb-6" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <h3 className="font-bold text-black mb-5" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              Kontrol Penyiraman
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setIsWateringOn(false)}
                    className={`px-8 py-3 rounded-[10px] transition-all font-semibold ${
                      !isWateringOn
                        ? "bg-[#9e1c60] text-white shadow-md"
                        : "bg-white text-[#9e1c60] border-2 border-[#9e1c60] hover:bg-[#faf5f8]"
                    }`}
                    style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
                  >
                    Matikan
                  </button>
                  <button
                    onClick={() => setIsWateringOn(true)}
                    className={`px-8 py-3 rounded-[10px] transition-all font-semibold ${
                      isWateringOn
                        ? "bg-[#9e1c60] text-white shadow-md"
                        : "bg-white text-[#9e1c60] border-2 border-[#9e1c60] hover:bg-[#faf5f8]"
                    }`}
                    style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
                  >
                    Nyalakan
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-black font-semibold" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Status: <span className="font-bold" style={{ color: isWateringOn ? '#106113' : '#dc2626' }}>
                      {isWateringOn ? "Aktif" : "Nonaktif"}
                    </span>
                  </p>
                  {isWateringOn && (
                    <p className="text-gray-600" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      Penyiraman berikutnya: 2 jam lagi
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center ml-8">
                <div className={`transition-all ${isWateringOn ? 'animate-pulse' : 'opacity-50'}`}>
                  <Image
                    src={imgMingcutePowerFill}
                    alt="Power"
                    width={120}
                    height={120}
                    className="object-contain"
                    style={{ filter: isWateringOn ? 'none' : 'grayscale(100%)' }}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Summary */}
          <div className="rounded-[15px] p-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <h3 className="font-bold text-black mb-4" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              Ringkasan Produk
            </h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600" style={{ fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Total Produk</span>
                <span className="font-bold text-black" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  3
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600" style={{ fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Tersedia</span>
                <span className="font-bold" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#106113' }}>
                  1
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600" style={{ fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Habis</span>
                <span className="font-bold" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#dc2626' }}>
                  1
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push("/petani/produk")}
              className="w-full bg-[#9e1c60] text-white rounded-[8px] py-2.5 hover:bg-[#7d1650] transition-colors font-semibold"
              style={{ fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              Lihat Semua Produk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
