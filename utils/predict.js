export async function predictStatus(suhu, kelembapan, hour) {
    try {
      // Tambahkan timeout 5 detik
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      console.log("[ML API] Mengirim request ke /api/predict", {
        suhu,
        kelembapan,
        hour
      });
      
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suhu: suhu,
          kelembapan: kelembapan,
          hour: hour,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        throw new Error(`Gagal memanggil API ML: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      
      console.log("[ML API] Response dari API:", data);
      
      // Return object lengkap dengan status, prediksi_suhu, prediksi_kelembapan
      return {
        status: data.status || "Normal",
        prediksi_suhu: data.prediksi_suhu || null,
        prediksi_kelembapan: data.prediksi_kelembapan || null
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("[ML API] Timeout: API tidak merespons dalam 5 detik");
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.error("[ML API] Error: Tidak dapat terhubung ke API.");
      } else {
        console.error("[ML API] Error:", error);
      }
      
      // Return default jika error
      return {
        status: "Normal",
        prediksi_suhu: null,
        prediksi_kelembapan: null
      };
    }
  }
  