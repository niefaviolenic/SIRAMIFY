"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import { supabase } from "@/utils/supabaseClient";
import { predictStatus } from "@/utils/predict";

const imgRectangle324 = "https://www.figma.com/api/mcp/asset/02bb6978-990e-4498-8e73-068e48a0a8fe";
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
    suhu: 26.5,
    kelembapan: 53,
    status: "Kering" as "Kering" | "Normal" | "Basah",
  });
  const [chartData, setChartData] = useState<MonitoringData[]>([]);
  const [statistics, setStatistics] = useState({
    totalHariIni: 5,
    totalMingguIni: 32,
    rataRataSuhu: 27.2,
    rataRataKelembapan: 55.8,
  });
  const [productSummary, setProductSummary] = useState({
    total: 3,
    tersedia: 1,
    habis: 1,
  });
  const [mlPrediction, setMlPrediction] = useState<string | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    loadMonitoringData();
  }, []);

  useEffect(() => {
    // Panggil prediksi ML saat currentData berubah
    // Hanya panggil jika suhu dan kelembapan valid (bukan 0 atau undefined)
    if (currentData.suhu && currentData.kelembapan && currentData.suhu > 0 && currentData.kelembapan > 0) {
      getMLPrediction();
    }
  }, [currentData.suhu, currentData.kelembapan]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ambil nama dari metadata atau email
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
      // TODO: Fetch from Supabase
      // Mock data untuk sekarang
      const mockChartData: MonitoringData[] = [
        { tanggal: "15 Jan", suhu: 26.5, kelembapan: 53, status: "Kering" },
        { tanggal: "16 Jan", suhu: 27.0, kelembapan: 55, status: "Kering" },
        { tanggal: "17 Jan", suhu: 27.5, kelembapan: 58, status: "Normal" },
        { tanggal: "18 Jan", suhu: 28.0, kelembapan: 62, status: "Normal" },
        { tanggal: "19 Jan", suhu: 27.8, kelembapan: 65, status: "Normal" },
        { tanggal: "20 Jan", suhu: 27.2, kelembapan: 68, status: "Basah" },
        { tanggal: "21 Jan", suhu: 26.8, kelembapan: 53, status: "Kering" },
      ];
      setChartData(mockChartData);
      
      // Set current data dari data terbaru
      if (mockChartData.length > 0) {
        const latest = mockChartData[mockChartData.length - 1];
        setCurrentData({
          suhu: latest.suhu,
          kelembapan: latest.kelembapan,
          status: latest.status,
        });
      }
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    }
  };

  const getMLPrediction = async () => {
    // Jangan panggil jika sudah loading atau data tidak valid
    if (isLoadingPrediction || !currentData.suhu || !currentData.kelembapan) {
      return;
    }
    
    setIsLoadingPrediction(true);
    setMlError(null);
    try {
      // Ambil jam saat ini (0-23)
      const currentHour = new Date().getHours();
      const prediction = await predictStatus(currentData.suhu, currentData.kelembapan, currentHour);
      
      if (prediction) {
        setMlPrediction(prediction);
        setMlError(null);
        // Update status berdasarkan prediksi ML
        setCurrentData(prev => ({
          ...prev,
          status: prediction as "Kering" | "Normal" | "Basah",
        }));
      } else {
        // Jika prediksi gagal, tetap gunakan status dari kelembapan
        console.warn("ML prediction failed, using fallback status");
        setMlPrediction(null);
        setMlError("API tidak tersedia");
      }
    } catch (error) {
      console.error("Error getting ML prediction:", error);
      setMlPrediction(null);
      setMlError("Gagal memanggil API");
    } finally {
      // Pastikan loading state selalu di-reset
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

  // Mini Line Chart Component
  const MiniLineChart = ({ data, color }: { data: number[], color: string }) => {
    const width = 80;
    const height = 30;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="absolute bottom-2 left-2">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Circular Progress Ring
  const CircularRing = ({ percentage, color, size = 50 }: { percentage: number, color: string, size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          className="text-xs font-bold fill-black"
          style={{ fontSize: '12px' }}
        >
          {percentage}%
        </text>
      </svg>
    );
  };

  // Main Line Chart Component
  const MainLineChart = ({ data }: { data: MonitoringData[] }) => {
    const width = 800;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const suhuValues = data.map(d => d.suhu);
    const kelembapanValues = data.map(d => d.kelembapan);
    const suhuMax = Math.max(...suhuValues, 1);
    const suhuMin = Math.min(...suhuValues, 0);
    const kelembapanMax = Math.max(...kelembapanValues, 1);
    const kelembapanMin = Math.min(...kelembapanValues, 0);

    const suhuPoints = suhuValues.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((value - suhuMin) / (suhuMax - suhuMin || 1)) * chartHeight;
      return { x, y };
    });

    const kelembapanPoints = kelembapanValues.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((value - kelembapanMin) / (kelembapanMax - kelembapanMin || 1)) * chartHeight;
      return { x, y };
    });

    const suhuPath = suhuPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const kelembapanPath = kelembapanPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="rounded-[15px] p-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
        <h3 className="font-bold text-black mb-4" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
          Grafik Suhu & Kelembapan (7 Hari Terakhir)
        </h3>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Suhu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Kelembapan</span>
          </div>
        </div>
        <svg width={width} height={height} className="w-full">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * chartHeight / 4)}
              x2={width - padding}
              y2={padding + (i * chartHeight / 4)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {/* Suhu line */}
          <path
            d={suhuPath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Kelembapan line */}
          <path
            d={kelembapanPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={padding + (i / (data.length - 1 || 1)) * chartWidth}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-black"
              style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              {d.tanggal}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // Bar Chart for Watering History
  const WateringHistoryChart = () => {
    const wateringData = [
      { hari: "Sen", jumlah: 3, status: "Kering" },
      { hari: "Sel", jumlah: 4, status: "Normal" },
      { hari: "Rab", jumlah: 5, status: "Normal" },
      { hari: "Kam", jumlah: 2, status: "Kering" },
      { hari: "Jum", jumlah: 6, status: "Basah" },
      { hari: "Sab", jumlah: 4, status: "Normal" },
      { hari: "Min", jumlah: 5, status: "Normal" },
    ];

    const maxJumlah = Math.max(...wateringData.map(d => d.jumlah), 1);

    return (
      <div className="rounded-[15px] p-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
        <h3 className="font-bold text-black mb-4" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
          Riwayat Penyiraman (Minggu Ini)
        </h3>
        <div className="flex items-end gap-2 h-[120px]">
          {wateringData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                <div
                  className="w-full rounded-t-[5px] transition-all hover:opacity-80"
                  style={{
                    height: `${(item.jumlah / maxJumlah) * 100}%`,
                    backgroundColor: getStatusColor(item.status),
                    minHeight: '4px'
                  }}
                  title={`${item.jumlah} penyiraman`}
                />
              </div>
              <span className="text-black text-center" style={{ fontSize: '8px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {item.hari}
              </span>
              <span className="text-black text-center font-bold" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {item.jumlah}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
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

          {/* Welcome Banner */}
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
            
            {/* Farmer Image - Bottom inside border, top outside border */}
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Suhu Card */}
            <div className="rounded-[15px] p-4 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex flex-col gap-1 mb-2">
                <p className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Suhu</p>
                <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {currentData.suhu}°
                </p>
              </div>
              <Image
                src={imgOuiTemperature}
                alt="Temperature"
                width={40}
                height={40}
                className="absolute right-4 top-4 object-contain opacity-60"
                unoptimized
              />
              <div className="relative h-[30px] mt-2">
                <MiniLineChart 
                  data={chartData.map(d => d.suhu)} 
                  color="#ef4444"
                />
              </div>
            </div>

            {/* Kelembapan Card */}
            <div className="rounded-[15px] p-4 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex flex-col gap-1 mb-2">
                <p className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Kelembapan</p>
                <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {currentData.kelembapan}%
                </p>
              </div>
              <Image
                src={imgMaterialSymbolsHumidityPercentageOutlineRounded}
                alt="Humidity"
                width={40}
                height={40}
                className="absolute right-4 top-4 object-contain opacity-60"
                unoptimized
              />
              <div className="relative h-[30px] mt-2">
                <MiniLineChart 
                  data={chartData.map(d => d.kelembapan)} 
                  color="#3b82f6"
                />
              </div>
            </div>

            {/* Status Tanah Card dengan ML Prediction */}
            <div className="rounded-[15px] p-4 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center justify-between">
                  <p className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Status Tanah</p>
                  {mlPrediction && !isLoadingPrediction && (
                    <span className="text-[#9e1c60] text-[8px] font-bold" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      ML
                    </span>
                  )}
                </div>
                {isLoadingPrediction ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#9e1c60] rounded-full animate-pulse"></div>
                    <p className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Memproses...</p>
                  </div>
                ) : mlError ? (
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-black" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', color: getStatusColor(currentData.status) }}>
                      {currentData.status}
                    </p>
                    <p className="text-[#dc2626] text-[10px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      {mlError}
                    </p>
                  </div>
                ) : (
                  <p className="font-bold text-black" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', color: getStatusColor(mlPrediction || currentData.status) }}>
                    {mlPrediction || currentData.status}
                  </p>
                )}
              </div>
              <Image
                src={imgIconoirSoilAlt}
                alt="Soil"
                width={40}
                height={40}
                className="absolute right-4 top-4 object-contain opacity-60"
                unoptimized
              />
              <div className="flex items-center justify-center mt-2">
                <CircularRing 
                  percentage={currentData.kelembapan} 
                  color={getKelembapanColor(currentData.kelembapan)}
                  size={60}
                />
              </div>
              {!isLoadingPrediction && (
                <button
                  onClick={getMLPrediction}
                  className="mt-2 w-full bg-[#9e1c60] text-white rounded-[5px] py-1 px-2 hover:bg-[#7d1650] transition-colors text-[10px]"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  Refresh Prediksi
                </button>
              )}
            </div>
          </div>

          {/* Main Chart */}
          <div className="mb-4">
            <MainLineChart data={chartData} />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => router.push("/petani/penyiraman")}
                className="text-[#9e1c60] hover:underline"
                style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Lihat Detail Penyiraman &gt;
              </button>
            </div>
          </div>

          {/* Statistics Cards & Watering Status */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Statistik Cards */}
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Penyiraman Hari Ini
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {statistics.totalHariIni}x
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Penyiraman Minggu Ini
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {statistics.totalMingguIni}x
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Rata-rata Suhu
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {statistics.rataRataSuhu}°
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Rata-rata Kelembapan
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {statistics.rataRataKelembapan}%
              </p>
            </div>
          </div>

          {/* Watering Status & History Chart */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Status Penyiraman */}
            <div className="rounded-[15px] p-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <h3 className="font-bold text-black mb-4" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Status Penyiraman
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsWateringOn(false)}
                    className={`px-6 py-2 rounded-[5px] transition ${
                      !isWateringOn
                        ? "bg-[#9e1c60] text-white"
                        : "bg-transparent text-[#9e1c60] border-2 border-[#9e1c60]"
                    }`}
                    style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
                  >
                    Matikan
                  </button>
                  <button
                    onClick={() => setIsWateringOn(true)}
                    className={`px-6 py-2 rounded-[5px] transition ${
                      isWateringOn
                        ? "bg-[#9e1c60] text-white"
                        : "bg-transparent text-[#9e1c60] border-2 border-[#9e1c60]"
                    }`}
                    style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
                  >
                    Nyalakan
                  </button>
                  <div className="mt-2">
                    <p className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      Status: <span className="font-bold">{isWateringOn ? "Aktif" : "Nonaktif"}</span>
                    </p>
                    {isWateringOn && (
                      <p className="text-black mt-1" style={{ fontSize: '8px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        Penyiraman berikutnya: 2 jam lagi
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <div className={`transition-transform ${isWateringOn ? 'animate-pulse' : ''}`}>
                    <Image
                      src={imgMingcutePowerFill}
                      alt="Power"
                      width={100}
                      height={100}
                      className="object-contain"
                      style={{ filter: isWateringOn ? 'none' : 'grayscale(100%) opacity(50%)' }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Watering History Chart */}
            <WateringHistoryChart />
          </div>

          {/* Product Summary & Plant Image */}
          <div className="grid grid-cols-3 gap-4">
            {/* Product Summary Card */}
            <div className="rounded-[15px] p-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <h3 className="font-bold text-black mb-4" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Ringkasan Produk
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Total Produk</span>
                  <span className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {productSummary.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Tersedia</span>
                  <span className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#106113' }}>
                    {productSummary.tersedia}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Habis</span>
                  <span className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#dc2626' }}>
                    {productSummary.habis}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push("/petani/produk")}
                className="w-full bg-[#9e1c60] text-white rounded-[5px] py-2 hover:bg-[#7d1650] transition-colors"
                style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Lihat Semua Produk
              </button>
            </div>

            {/* Plant Image */}
            <div className="col-span-2 rounded-[10px] overflow-hidden relative h-[200px]">
              <Image
                src={imgRectangle324}
                alt="Plant"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
