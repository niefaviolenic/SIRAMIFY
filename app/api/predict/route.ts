import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { suhu, kelembapan, hour } = body;

    // Simple logic to mimic ML prediction
    // In a real scenario, this would load a model or call a complex function

    let status = "Normal";
    let prediksi_suhu = suhu;
    let prediksi_kelembapan = kelembapan;

    // Simulate some prediction logic
    if (kelembapan < 55) {
      status = "Kering";
      prediksi_kelembapan = kelembapan + 5; // Predict it will rise if watered?
    } else if (kelembapan > 70) {
      status = "Basah";
      prediksi_kelembapan = kelembapan - 2; // Predict it will dry
    } else {
      status = "Normal";
    }

    // Adjust prediction based on hour (e.g., hotter at noon)
    if (hour >= 10 && hour <= 14) {
      prediksi_suhu += 1;
    } else if (hour >= 0 && hour <= 5) {
      prediksi_suhu -= 1;
    }

    return NextResponse.json({
      status,
      prediksi_suhu,
      prediksi_kelembapan
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
