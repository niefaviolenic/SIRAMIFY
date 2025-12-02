export async function predictStatus(suhu, kelembapan, hour) {
    try {
      // Tambahkan timeout 5 detik
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch("http://127.0.0.1:8000/predict", {
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
      return data.hasil;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("ML API timeout: API tidak merespons dalam 5 detik");
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.error("ML API error: Tidak dapat terhubung ke API. Pastikan API berjalan di http://127.0.0.1:8000");
      } else {
        console.error("ML API error:", error);
      }
      return null;
    }
  }
  