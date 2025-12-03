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
  const [chartData, setChartData] = useState<MonitoringData[]>([]);

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
      // Ambil semua data untuk sorting yang benar (karena Tanggal adalah TEXT)
      // Supabase default limit adalah 1000, jadi kita perlu fetch dalam batch
      
      // Pertama, ambil count
      const { count, error: countError } = await supabase
        .from("penyiraman")
        .select("*", { count: "exact", head: true });
      
      if (countError) {
        console.error("Error counting records:", countError);
        setIsLoading(false);
        return;
      }
      
      // Fetch semua data dalam batch (1000 per batch)
      let allData: any[] = [];
      const batchSize = 1000;
      const totalBatches = count ? Math.ceil(count / batchSize) : 1;
      
      for (let i = 0; i < totalBatches; i++) {
        const from = i * batchSize;
        const to = Math.min((i + 1) * batchSize - 1, (count || 0) - 1);
        
        const { data: batchData, error: batchError } = await supabase
          .from("penyiraman")
          .select("*")
          .range(from, to);
        
        if (batchError) {
          console.error(`Error fetching batch ${i + 1}:`, batchError);
          break;
        }
        
        if (batchData) {
          allData = [...allData, ...batchData];
        }
      }
      
      console.log("Total data fetched for beranda:", allData.length);
      
      const latestError = null; // Error sudah di-handle di dalam loop

      // Helper function untuk parse tanggal dari format "DD/MM/YYYY HH:MM" menjadi Date object
      const parseTanggalToDate = (tanggalValue: string): Date => {
        try {
          const parts = tanggalValue?.toString().trim().split(" ") || [];
          if (parts.length >= 1) {
            const datePart = parts[0]; // "DD/MM/YYYY"
            const dateParts = datePart.split("/");
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
              const year = parseInt(dateParts[2]);
              return new Date(year, month, day);
            }
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
        return new Date(0); // Return epoch if parsing fails
      };

      // Sort semua data berdasarkan tanggal
      let sortedData: any[] = [];
      let latestData: any[] = [];
      let chartDataRaw: any[] = [];

      if (allData && allData.length > 0) {
        sortedData = [...allData].sort((a: any, b: any) => {
          const tanggalA = a.Tanggal || a.tanggal || a.TANGGAL || "";
          const tanggalB = b.Tanggal || b.tanggal || b.TANGGAL || "";
          const dateA = parseTanggalToDate(tanggalA);
          const dateB = parseTanggalToDate(tanggalB);
          return dateB.getTime() - dateA.getTime(); // Descending: terbaru ke terlama
        });

        // Data terbaru untuk card (pertama dari sorted data karena terbaru dulu)
        latestData = sortedData.length > 0 ? [sortedData[0]] : [];

        // Group data berdasarkan tanggal dan hitung rata-rata
        const dataByTanggal = new Map<string, { suhu: number[], kelembapan: number[], tanggal: string }>();
        
        sortedData.forEach((item: any) => {
          const tanggalValue = item.Tanggal || item.tanggal || item.TANGGAL || "";
          if (tanggalValue) {
            // Ambil hanya bagian tanggal (DD/MM/YYYY) tanpa waktu
            const parts = tanggalValue.toString().trim().split(" ");
            const datePart = parts[0]; // "DD/MM/YYYY"
            
            if (datePart) {
              const suhuValue = item.Suhu || item.suhu || item.SUHU || 0;
              const kelembapanValue = item.Kelembapan || item.kelembapan || item.KELEMBAPAN || 0;
              
              if (!dataByTanggal.has(datePart)) {
                dataByTanggal.set(datePart, { suhu: [], kelembapan: [], tanggal: datePart });
              }
              
              const existing = dataByTanggal.get(datePart)!;
              existing.suhu.push(suhuValue);
              existing.kelembapan.push(kelembapanValue);
            }
          }
        });
        
        // Hitung rata-rata untuk setiap tanggal
        const averagedData = Array.from(dataByTanggal.values()).map((group) => {
          const avgSuhu = group.suhu.reduce((sum, val) => sum + val, 0) / group.suhu.length;
          const avgKelembapan = group.kelembapan.reduce((sum, val) => sum + val, 0) / group.kelembapan.length;
          
          return {
            tanggal: group.tanggal,
            suhu: avgSuhu,
            kelembapan: avgKelembapan,
            status: "Normal" as "Kering" | "Normal" | "Basah", // Status akan dihitung nanti
          };
        });
        
        // Sort berdasarkan tanggal (terlama ke terbaru) untuk grafik
        const sortedAveragedData = averagedData.sort((a, b) => {
          const dateA = parseTanggalToDate(a.tanggal);
          const dateB = parseTanggalToDate(b.tanggal);
          return dateA.getTime() - dateB.getTime(); // Ascending: terlama ke terbaru
        });
        
        // Ambil 7 tanggal terbaru (atau semua jika kurang dari 7)
        chartDataRaw = sortedAveragedData.slice(-7);
      }

      if (latestError) {
        console.error("Error loading monitoring data:", latestError);
        setIsLoading(false);
        return;
      }

      // chartError tidak lagi digunakan karena kita fetch semua data sekaligus

      if (latestData && latestData.length > 0) {
        const item = latestData[0];
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

      // Process chart data
      // Data sudah di-aggregate per tanggal dengan rata-rata
      if (chartDataRaw && chartDataRaw.length > 0) {
        const processedChartData = chartDataRaw.map((item: any) => {
          const suhuValue = item.suhu || 0;
          const kelembapanValue = item.kelembapan || 0;
          
          // Format tanggal untuk display (DD/MM)
          const dateParts = item.tanggal.split("/");
          const tanggal = dateParts.length === 3 ? `${dateParts[0]}/${dateParts[1]}` : item.tanggal;

          // Tentukan status berdasarkan rata-rata kelembapan
          let status: "Kering" | "Normal" | "Basah" = "Normal";
          if (kelembapanValue < 55) {
            status = "Kering";
          } else if (kelembapanValue >= 55 && kelembapanValue < 70) {
            status = "Normal";
          } else {
            status = "Basah";
          }

          return {
            tanggal,
            suhu: suhuValue,
            kelembapan: kelembapanValue,
            status,
          };
        });
        setChartData(processedChartData);
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

  // Realtime Sensor Chart Component
  const RealtimeSensorChart = ({ data }: { data: MonitoringData[] }) => {
    if (data.length === 0) {
      return (
        <div>
          <h3 className="font-bold text-black mb-4" style={{ fontSize: '18px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            Grafik Sensor Realtime
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[15px] p-6 shadow-lg flex items-center justify-center h-[300px]" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-gray-500" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Belum ada data
              </p>
            </div>
            <div className="rounded-[15px] p-6 shadow-lg flex items-center justify-center h-[300px]" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-gray-500" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Belum ada data
              </p>
            </div>
          </div>
        </div>
      );
    }

    const width = 400;
    const height = 250;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Suhu Chart
    const suhuValues = data.map(d => d.suhu);
    const suhuMax = Math.max(...suhuValues, 1);
    const suhuMin = Math.min(...suhuValues, 0);
    const suhuRange = suhuMax - suhuMin || 1;
    const suhuStep = suhuRange / 8; // 8 grid lines
    const suhuYLabels = Array.from({ length: 9 }, (_, i) => suhuMin + (i * suhuStep));

    const suhuPoints = suhuValues.map((value, index) => {
      const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - suhuMin) / suhuRange) * chartHeight;
      return { x, y };
    });

    const suhuLinePath = suhuPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const suhuAreaPath = `${suhuLinePath} L ${suhuPoints[suhuPoints.length - 1].x} ${padding.top + chartHeight} L ${suhuPoints[0].x} ${padding.top + chartHeight} Z`;

    // Kelembapan Chart
    const kelembapanValues = data.map(d => d.kelembapan);
    const kelembapanMax = Math.max(...kelembapanValues, 1);
    const kelembapanMin = Math.min(...kelembapanValues, 0);
    const kelembapanRange = kelembapanMax - kelembapanMin || 1;
    const kelembapanStep = Math.ceil(kelembapanRange / 8 / 5) * 5; // Round to nearest 5
    const kelembapanYLabels = Array.from({ length: 9 }, (_, i) => {
      const value = kelembapanMin + (i * kelembapanStep);
      return Math.round(value / 5) * 5; // Round to nearest 5
    });

    const kelembapanPoints = kelembapanValues.map((value, index) => {
      const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - kelembapanMin) / kelembapanRange) * chartHeight;
      return { x, y };
    });

    const kelembapanLinePath = kelembapanPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const kelembapanAreaPath = `${kelembapanLinePath} L ${kelembapanPoints[kelembapanPoints.length - 1].x} ${padding.top + chartHeight} L ${kelembapanPoints[0].x} ${padding.top + chartHeight} Z`;

    // Color palette - ungu
    const purpleDark = "#9e1c60";
    const purpleLight = "#e6c4d2";
    const purpleGrid = "#d4a5c4";

    return (
      <div>
        <h3 className="font-bold text-black mb-4" style={{ fontSize: '18px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
          Grafik Sensor Realtime
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Suhu Chart */}
          <div className="rounded-[15px] p-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <h4 className="font-bold mb-3" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif', color: purpleDark }}>
              Suhu (°C)
            </h4>
            <svg width={width} height={height} className="w-full">
              {/* Grid lines */}
              {suhuYLabels.map((label, i) => {
                const y = padding.top + chartHeight - ((label - suhuMin) / suhuRange) * chartHeight;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={purpleGrid}
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif', fill: purpleDark }}
                    >
                      {label.toFixed(1)}
                    </text>
                  </g>
                );
              })}
              {/* X-axis labels */}
              {data.map((d, i) => {
                const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    style={{ fontSize: '9px', fontFamily: 'Arial, Helvetica, sans-serif', fill: purpleDark }}
                  >
                    {d.tanggal}
                  </text>
                );
              })}
              {/* Area fill */}
              <path
                d={suhuAreaPath}
                fill={purpleLight}
                opacity="0.6"
              />
              {/* Line */}
              <path
                d={suhuLinePath}
                fill="none"
                stroke={purpleDark}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Kelembapan Chart */}
          <div className="rounded-[15px] p-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <h4 className="font-bold mb-3" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif', color: purpleDark }}>
              Kelembapan (%)
            </h4>
            <svg width={width} height={height} className="w-full">
              {/* Grid lines */}
              {kelembapanYLabels.map((label, i) => {
                const y = padding.top + chartHeight - ((label - kelembapanMin) / kelembapanRange) * chartHeight;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={purpleGrid}
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif', fill: purpleDark }}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
              {/* X-axis labels */}
              {data.map((d, i) => {
                const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    style={{ fontSize: '9px', fontFamily: 'Arial, Helvetica, sans-serif', fill: purpleDark }}
                  >
                    {d.tanggal}
                  </text>
                );
              })}
              {/* Area fill */}
              <path
                d={kelembapanAreaPath}
                fill={purpleLight}
                opacity="0.6"
              />
              {/* Line */}
              <path
                d={kelembapanLinePath}
                fill="none"
                stroke={purpleDark}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen bg-white" style={{ minHeight: '100vh', width: 'calc(100% - 180px)', paddingBottom: '40px' }}>
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
                  <p className="text-black mb-1" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Suhu</p>
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
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(90%) saturate(5000%) hue-rotate(310deg) brightness(0.6) contrast(1.2)' }}
                  unoptimized
                />
              </div>
            </div>

            {/* Kelembapan Card */}
            <div className="rounded-[15px] p-5 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-black mb-1" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Kelembapan</p>
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
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(90%) saturate(5000%) hue-rotate(310deg) brightness(0.6) contrast(1.2)' }}
                  unoptimized
                />
              </div>
            </div>

            {/* Status Ideal Card */}
            <div className="rounded-[15px] p-5 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-black" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Status Ideal</p>
                    {mlPredictionData?.prediksi_kelembapan !== null && mlPredictionData?.prediksi_kelembapan !== undefined && !isLoadingPrediction && (
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
                      <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        N/A
                      </p>
                      <p className="text-red-500 text-[10px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        {mlError}
                      </p>
                    </div>
                  ) : mlPredictionData?.prediksi_kelembapan !== null && mlPredictionData?.prediksi_kelembapan !== undefined ? (
                    (mlPredictionData.prediksi_kelembapan >= 55) ? (
                      <div>
                        <p className="font-bold" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#106113' }}>
                          Ideal
                        </p>
                        <p className="text-black text-[10px] mt-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                          Tidak perlu penyiraman
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#dc2626' }}>
                          Tidak Ideal
                        </p>
                        <p className="text-black text-[10px] mt-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                          Perlu penyiraman
                        </p>
                      </div>
                    )
                  ) : (
                    <p className="font-bold text-black" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      N/A
                    </p>
                  )}
                </div>
                <Image
                  src={imgIconoirSoilAlt}
                  alt="Status Ideal"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(90%) saturate(5000%) hue-rotate(310deg) brightness(0.6) contrast(1.2)' }}
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Realtime Sensor Chart */}
          <div className="mb-6">
            <RealtimeSensorChart data={chartData} />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => router.push("/petani/penyiraman")}
                className="text-[#9e1c60] hover:underline font-semibold"
                style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Lihat Detail Penyiraman →
              </button>
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
                <div className={`transition-all ${isWateringOn ? 'animate-pulse' : ''}`}>
                  <Image
                    src={imgMingcutePowerFill}
                    alt="Power"
                    width={80}
                    height={80}
                    className="object-contain"
                    style={{ 
                      filter: isWateringOn 
                        ? 'brightness(0) saturate(100%) invert(40%) sepia(95%) saturate(2000%) hue-rotate(90deg) brightness(0.9) contrast(1.2)' 
                        : 'brightness(0) saturate(100%) invert(20%) sepia(95%) saturate(5000%) hue-rotate(0deg) brightness(0.8) contrast(1.2)'
                    }}
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
