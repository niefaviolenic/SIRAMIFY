"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import Navbar from "../../components/Navbar";

// Asset URLs dari Figma
const imgLogo1 = "https://www.figma.com/api/mcp/asset/3777a01f-7248-4b92-81c8-28d8ce86e840";
const imgVector2 = "https://www.figma.com/api/mcp/asset/044ae3c8-2b69-4ea0-a2fc-094b22f6f72d";
const imgVector = "https://www.figma.com/api/mcp/asset/914c1c8a-bf1f-494d-8bd1-71f1a18c0667";
const imgSearch = "https://www.figma.com/api/mcp/asset/2d908c6a-aba8-4722-a2dc-d351d00c8b9f";

function IcBaselineWhatsapp({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-[8.33%_8.54%]">
        <Image src={imgVector} alt="" width={20} height={20} className="block max-w-none size-full" unoptimized />
      </div>
    </div>
  );
}

const articlesData: { [key: string]: { title: string; date: string; content: string[] } } = {
  "1": {
    title: "Cara Siramify Ngubah Budidaya Selada Merah Jadi Lebih Stabil",
    date: "20 October 2025",
    content: [
      "Budidaya selada merah membutuhkan perhatian khusus untuk menghasilkan kualitas yang konsisten. Tanpa pengelolaan yang tepat, petani sering menghadapi masalah seperti warna daun yang tidak merata, tekstur yang kurang renyah, atau bahkan gagal panen. Siramify hadir dengan teknologi canggih yang mengubah cara petani mengelola budidaya selada merah, menjadikannya lebih stabil dan dapat diprediksi.",
      "",
      "Dengan sistem monitoring dan otomasi yang terintegrasi, Siramify membantu petani menjaga kondisi optimal untuk pertumbuhan selada merah dari awal penanaman hingga panen.",
      "",
      "1. Stabilitas Lingkungan yang Konsisten",
      "Selada merah sangat sensitif terhadap perubahan suhu dan kelembapan. Siramify memastikan kondisi lingkungan tetap stabil dengan sistem sensor yang memantau setiap perubahan dan sistem otomasi yang langsung merespons untuk menjaga keseimbangan.",
      "Keuntungan utama:",
      "• Suhu tetap dalam rentang optimal 15-20°C",
      "• Kelembapan udara terjaga di 60-70%",
      "• Fluktuasi diminimalkan hingga kurang dari 2%",
      "",
      "2. Penyiraman yang Tepat Waktu dan Presisi",
      "Sistem otomasi Siramify menentukan waktu penyiraman berdasarkan data real-time dari sensor. Tanaman mendapatkan air yang tepat pada waktu yang tepat, mencegah masalah seperti busuk akar atau kekeringan.",
      "Manfaat penyiraman presisi:",
      "• Tanaman tidak kekurangan atau kelebihan air",
      "• Pertumbuhan lebih seragam",
      "• Kualitas daun lebih konsisten",
      "",
      "3. Monitoring Pertumbuhan Real-Time",
      "Dengan dashboard Siramify, petani dapat memantau perkembangan tanaman secara real-time. Data historis membantu mengidentifikasi pola dan menyesuaikan perawatan jika diperlukan sebelum masalah menjadi serius.",
      "",
      "4. Hasil Panen yang Stabil dan Berkualitas",
      "Dengan kondisi lingkungan yang stabil dan perawatan yang konsisten, petani dapat menghasilkan selada merah dengan kualitas yang konsisten dari satu siklus ke siklus berikutnya. Warna merah keunguan yang merata, tekstur yang renyah, dan ukuran yang seragam menjadi lebih mudah dicapai.",
      "",
      "Siramify telah membuktikan bahwa dengan teknologi yang tepat, budidaya selada merah dapat menjadi lebih stabil, dapat diprediksi, dan menghasilkan kualitas premium yang konsisten. Petani yang menggunakan Siramify melaporkan peningkatan stabilitas hasil panen hingga 85% dibandingkan metode tradisional."
    ]
  },
  "2": {
    title: "Cara Siramify Bikin Kontrol Suhu & Kelembapan Jadi Super Akurat",
    date: "20 October 2025",
    content: [
      "Menjaga stabilitas suhu dan kelembapan merupakan faktor penting dalam keberhasilan budidaya tanaman, terutama pada komoditas yang sensitif seperti selada merah. Fluktuasi kecil saja dapat memengaruhi pertumbuhan, kualitas hasil panen, hingga risiko gagal tanam. Untuk itu, dibutuhkan sistem pemantauan yang akurat, responsif, dan mudah dioperasikan.",
      "",
      "Siramify hadir sebagai solusi berbasis web yang mempermudah petani mengontrol kondisi lingkungan tanaman secara presisi melalui teknologi sensor real-time dan otomasi penyiraman yang cerdas.",
      "",
      "1. Sensor Real-Time untuk Monitoring yang Lebih Presisi",
      "Siramify dilengkapi sensor suhu dan kelembapan yang terhubung langsung ke sistem pemantauan online. Setiap perubahan kondisi lingkungan dapat terdeteksi dengan cepat sehingga pengguna mendapatkan data yang akurat dan selalu diperbarui.",
      "Keunggulannya:",
      "• Data suhu dan kelembapan tercatat secara real-time",
      "• Informasi lebih relevan untuk pengambilan keputusan",
      "• Mengurangi risiko perubahan lingkungan yang tidak terpantau",
      "",
      "2. Sistem Otomatis yang Menyesuaikan Kebutuhan Tanaman",
      "Dengan dukungan algoritma berbasis kebutuhan tanaman, Siramify mengatur penyiraman secara otomatis ketika suhu meningkat atau kelembapan menurun. Hal ini memastikan setiap tanaman mendapatkan air sesuai kebutuhan tanpa berlebihan ataupun kekurangan.",
      "Manfaat:",
      "• Menjaga kondisi tetap stabil",
      "• Efisiensi penggunaan air",
      "• Mengurangi beban kerja petani",
      "",
      "3. Analitik Lingkungan untuk Perencanaan yang Lebih Baik",
      "Siramify tidak hanya menampilkan data, tetapi juga menyediakan insight yang membantu pengguna memahami pola perubahan suhu dan kelembapan. Informasi ini penting untuk merencanakan strategi budidaya yang lebih efektif.",
      "Kelebihan yang diperoleh:",
      "• Deteksi pola harian dan mingguan",
      "• Evaluasi hasil budidaya berdasarkan data",
      "• Optimalisasi lingkungan tanam",
      "",
      "4. Pemantauan Mudah Melalui Dashboard",
      "Semua data disajikan dalam dashboard yang ringkas dan mudah dipahami, sehingga petani dapat memantau kondisi tanaman di mana saja dan kapan saja. Visualisasi data yang jelas memudahkan pengambilan keputusan secara cepat.",
      "",
      "Siramify memungkinkan proses kontrol suhu dan kelembapan menjadi jauh lebih akurat melalui kombinasi sensor real-time, otomasi penyiraman, dan analitik lingkungan. Sistem ini dirancang untuk membantu petani menjaga stabilitas lingkungan tanaman secara konsisten sehingga kualitas panen tetap terjaga dan risiko kerugian dapat diminimalkan."
    ]
  },
  "3": {
    title: "Teknologi Sensor Real-Time Siramify untuk Monitoring Tanaman 24/7",
    date: "18 October 2025",
    content: [
      "Dalam era pertanian modern, pemantauan berkelanjutan menjadi kunci keberhasilan budidaya tanaman. Siramify menghadirkan teknologi sensor real-time yang memungkinkan petani memantau kondisi tanaman mereka selama 24 jam tanpa henti, bahkan dari jarak jauh.",
      "",
      "Sistem sensor Siramify dirancang khusus untuk mengukur berbagai parameter penting dalam budidaya tanaman, terutama untuk komoditas sensitif seperti selada merah yang membutuhkan perhatian ekstra.",
      "",
      "1. Sensor Suhu dan Kelembapan yang Akurat",
      "Sensor Siramify menggunakan teknologi terdepan untuk mengukur suhu dan kelembapan dengan tingkat akurasi tinggi. Data dikirim secara real-time ke platform web, memungkinkan petani melihat perubahan kondisi lingkungan secara langsung.",
      "Fitur utama:",
      "• Pengukuran setiap 5 menit untuk data yang selalu update",
      "• Akurasi hingga 0.1°C untuk suhu dan 1% untuk kelembapan",
      "• Notifikasi otomatis saat kondisi melewati ambang batas",
      "",
      "2. Monitoring dari Mana Saja",
      "Dengan platform web Siramify, petani tidak perlu berada di lokasi untuk memantau tanaman. Akses melalui smartphone, tablet, atau komputer memungkinkan monitoring kapan saja dan di mana saja.",
      "Kemudahan yang didapat:",
      "• Akses real-time melalui browser web",
      "• Tampilan responsif untuk semua perangkat",
      "• Data tersimpan otomatis untuk analisis jangka panjang",
      "",
      "3. Sistem Peringatan Dini",
      "Siramify dilengkapi sistem peringatan yang akan mengirim notifikasi jika terdeteksi kondisi yang tidak normal. Hal ini membantu petani mengambil tindakan cepat sebelum masalah menjadi lebih serius.",
      "",
      "Dengan teknologi sensor real-time Siramify, petani dapat memastikan tanaman mereka selalu dalam kondisi optimal, menghasilkan kualitas panen yang lebih baik dan mengurangi risiko kerugian."
    ]
  },
  "4": {
    title: "Otomasi Penyiraman: Cara Siramify Menghemat Air Hingga 40%",
    date: "15 October 2025",
    content: [
      "Penggunaan air yang efisien menjadi prioritas utama dalam pertanian modern, terutama di daerah yang mengalami keterbatasan sumber air. Siramify hadir dengan sistem otomasi penyiraman cerdas yang tidak hanya memudahkan petani, tetapi juga menghemat penggunaan air secara signifikan.",
      "",
      "Berdasarkan penelitian dan uji coba di berbagai lahan pertanian, sistem Siramify terbukti dapat menghemat penggunaan air hingga 40% dibandingkan dengan metode penyiraman tradisional.",
      "",
      "1. Algoritma Cerdas untuk Penyiraman Optimal",
      "Siramify menggunakan algoritma berbasis data sensor untuk menentukan waktu dan jumlah air yang tepat. Sistem ini menganalisis kondisi suhu, kelembapan tanah, dan kebutuhan tanaman untuk memberikan air yang optimal.",
      "Cara kerja:",
      "• Analisis data sensor secara real-time",
      "• Perhitungan kebutuhan air berdasarkan jenis tanaman",
      "• Penyesuaian otomatis jadwal penyiraman",
      "",
      "2. Penyiraman Berbasis Kebutuhan, Bukan Jadwal",
      "Berbeda dengan sistem penyiraman tradisional yang mengikuti jadwal tetap, Siramify menyiram tanaman hanya ketika benar-benar dibutuhkan. Hal ini mencegah pemborosan air dan memastikan tanaman tidak kekurangan atau kelebihan air.",
      "Keuntungan:",
      "• Mengurangi pemborosan air hingga 40%",
      "• Tanaman mendapatkan air sesuai kebutuhan",
      "• Mencegah penyakit akibat kelebihan air",
      "",
      "3. Monitoring Konsumsi Air",
      "Platform Siramify menyediakan fitur tracking konsumsi air, memungkinkan petani melihat berapa banyak air yang digunakan dan bagaimana efisiensinya. Data ini membantu dalam perencanaan dan optimasi penggunaan air.",
      "",
      "4. Dampak Lingkungan yang Positif",
      "Dengan menghemat air hingga 40%, Siramify tidak hanya menguntungkan petani secara ekonomi, tetapi juga berkontribusi pada pelestarian lingkungan. Penggunaan air yang lebih efisien berarti lebih sedikit tekanan pada sumber air lokal.",
      "",
      "Sistem otomasi penyiraman Siramify membuktikan bahwa teknologi dapat membantu pertanian menjadi lebih efisien dan ramah lingkungan, sambil tetap menghasilkan kualitas panen yang optimal."
    ]
  },
  "5": {
    title: "Tips Budidaya Selada Merah Premium dengan Siramify",
    date: "12 October 2025",
    content: [
      "Selada merah (Lactuca sativa var. crispa) dikenal sebagai salah satu komoditas hortikultura bernilai tinggi. Untuk menghasilkan kualitas premium, selada merah membutuhkan perawatan yang sangat teliti, terutama dalam hal pengelolaan suhu, kelembapan, dan penyiraman.",
      "",
      "Siramify menyediakan solusi lengkap untuk membantu petani mencapai hasil panen selada merah dengan kualitas premium melalui sistem monitoring dan otomasi yang presisi.",
      "",
      "1. Kondisi Optimal untuk Selada Merah",
      "Selada merah tumbuh optimal pada suhu 15-20°C dengan kelembapan udara 60-70%. Fluktuasi di luar rentang ini dapat memengaruhi warna, tekstur, dan rasa daun. Siramify membantu menjaga kondisi ini tetap stabil.",
      "Parameter penting:",
      "• Suhu: 15-20°C (optimal)",
      "• Kelembapan udara: 60-70%",
      "• Kelembapan tanah: 40-60%",
      "• Intensitas cahaya: 6-8 jam per hari",
      "",
      "2. Penyiraman yang Tepat Waktu",
      "Selada merah membutuhkan penyiraman yang konsisten. Siramify mengatur penyiraman otomatis berdasarkan data sensor, memastikan tanah selalu dalam kondisi lembap tetapi tidak basah. Kelebihan air dapat menyebabkan busuk akar, sementara kekurangan air membuat daun layu.",
      "Tips penyiraman:",
      "• Siram pagi hari untuk menghindari kelembapan berlebih di malam hari",
      "• Hindari menyiram daun langsung, fokus pada akar",
      "• Gunakan air dengan suhu yang sesuai (tidak terlalu dingin)",
      "",
      "3. Monitoring Pertumbuhan",
      "Dengan dashboard Siramify, petani dapat memantau perkembangan tanaman secara berkala. Data historis membantu mengidentifikasi pola pertumbuhan dan menyesuaikan perawatan jika diperlukan.",
      "",
      "4. Panen dengan Kualitas Premium",
      "Selada merah siap panen ketika daun sudah mencapai ukuran optimal dan warna merah keunguan sudah merata. Dengan kondisi lingkungan yang stabil berkat Siramify, petani dapat memastikan kualitas panen yang konsisten.",
      "",
      "Dengan mengikuti tips budidaya ini dan memanfaatkan teknologi Siramify, petani dapat menghasilkan selada merah dengan kualitas premium yang memiliki nilai jual tinggi di pasar."
    ]
  },
  "6": {
    title: "Dashboard Siramify: Analitik Data untuk Pertanian Cerdas",
    date: "10 October 2025",
    content: [
      "Di era pertanian berbasis data, informasi yang akurat dan mudah dipahami menjadi kunci pengambilan keputusan yang tepat. Siramify menghadirkan dashboard lengkap dengan analitik data yang membantu petani memahami pola dan tren dalam budidaya mereka.",
      "",
      "Dashboard Siramify dirancang dengan antarmuka yang user-friendly, memungkinkan petani dari berbagai latar belakang teknologi untuk memahami dan memanfaatkan data dengan efektif.",
      "",
      "1. Visualisasi Data Real-Time",
      "Dashboard menampilkan data suhu, kelembapan, dan status penyiraman dalam bentuk grafik dan chart yang mudah dibaca. Petani dapat melihat kondisi terkini dan tren dalam beberapa jam, hari, atau minggu terakhir.",
      "Fitur visualisasi:",
      "• Grafik garis untuk tren suhu dan kelembapan",
      "• Chart batang untuk konsumsi air",
      "• Indikator warna untuk status kondisi",
      "• Timeline untuk aktivitas penyiraman",
      "",
      "2. Analitik Pola dan Tren",
      "Siramify menganalisis data historis untuk mengidentifikasi pola harian, mingguan, dan musiman. Informasi ini membantu petani memahami bagaimana kondisi lingkungan berubah dan merencanakan strategi budidaya yang lebih baik.",
      "Insight yang didapat:",
      "• Pola suhu harian dan fluktuasinya",
      "• Kebutuhan air berdasarkan musim",
      "• Korelasi antara kondisi lingkungan dan pertumbuhan tanaman",
      "",
      "3. Laporan Otomatis",
      "Dashboard menghasilkan laporan otomatis yang merangkum performa budidaya dalam periode tertentu. Laporan ini mencakup statistik penggunaan air, kondisi lingkungan, dan rekomendasi perbaikan.",
      "",
      "4. Perbandingan Data",
      "Petani dapat membandingkan data dari periode yang berbeda untuk melihat perkembangan dan efektivitas perubahan strategi budidaya. Fitur ini sangat berguna untuk optimasi jangka panjang.",
      "",
      "Dengan dashboard dan analitik data Siramify, petani dapat beralih dari pertanian tradisional ke pertanian cerdas berbasis data, menghasilkan keputusan yang lebih tepat dan hasil panen yang lebih baik."
    ]
  },
  "7": {
    title: "Robot Penyiraman Otomatis: Masa Depan Pertanian Modern",
    date: "8 October 2025",
    content: [
      "Revolusi teknologi dalam pertanian terus berkembang, dan robot penyiraman otomatis menjadi salah satu inovasi terdepan. Siramify mengintegrasikan teknologi robotik canggih yang dapat dikontrol sepenuhnya melalui platform web, membawa pertanian ke level efisiensi yang belum pernah ada sebelumnya.",
      "",
      "Sistem robot penyiraman Siramify dirancang untuk bekerja secara mandiri, mengikuti instruksi dari platform web berdasarkan data sensor real-time, dan dapat dioperasikan dari jarak jauh.",
      "",
      "1. Robot dengan Navigasi Cerdas",
      "Robot penyiraman Siramify dilengkapi dengan sistem navigasi GPS dan sensor obstacle detection. Robot dapat bergerak di lahan pertanian secara otomatis, menghindari rintangan, dan menyiram tanaman dengan presisi tinggi.",
      "Kemampuan robot:",
      "• Navigasi otomatis di lahan pertanian",
      "• Deteksi dan penghindaran rintangan",
      "• Penyiraman presisi pada area target",
      "• Kembali ke stasiun pengisian otomatis",
      "",
      "2. Kontrol Melalui Platform Web",
      "Semua fungsi robot dapat dikontrol melalui dashboard Siramify di platform web. Petani dapat mengatur jadwal, menentukan area penyiraman, dan memantau aktivitas robot dari mana saja.",
      "Fitur kontrol:",
      "• Remote control melalui web browser",
      "• Penjadwalan otomatis atau manual",
      "• Monitoring posisi dan status robot real-time",
      "• Log aktivitas untuk tracking",
      "",
      "3. Integrasi dengan Sensor",
      "Robot terintegrasi langsung dengan sistem sensor Siramify. Ketika sensor mendeteksi kondisi yang memerlukan penyiraman, robot akan otomatis bergerak ke lokasi dan melakukan penyiraman sesuai kebutuhan.",
      "",
      "4. Efisiensi dan Produktivitas",
      "Dengan robot penyiraman otomatis, petani dapat menghemat waktu dan tenaga secara signifikan. Robot dapat bekerja 24/7 tanpa lelah, memastikan tanaman selalu mendapatkan perawatan yang optimal.",
      "Manfaat:",
      "• Menghemat waktu petani hingga 70%",
      "• Penyiraman lebih konsisten dan presisi",
      "• Dapat dioperasikan dari jarak jauh",
      "• Meningkatkan produktivitas lahan",
      "",
      "Robot penyiraman otomatis Siramify mewakili masa depan pertanian modern, di mana teknologi robotik dan digitalisasi bekerja sama untuk menciptakan sistem pertanian yang lebih efisien, produktif, dan berkelanjutan."
    ]
  }
};

export default function ArtikelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const articleContent = articlesData[id] || articlesData["1"];

  return (
    <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Back Button & Search Bar */}
      <div className="pt-24 md:pt-28 pb-8">
        <div className="max-w-[1100px] mx-auto px-6 md:px-8 lg:px-10">
          {/* Back Button */}
          <Link 
            href="/artikel" 
            className="inline-flex items-center gap-2 mb-4 md:mb-6 text-[#561530] hover:text-[#9e1c60] transition-colors group"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transform group-hover:-translate-x-1 transition-transform"
            >
              <path 
                d="M15 18L9 12L15 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-xs md:text-sm">Kembali ke Daftar Artikel</span>
          </Link>

          {/* Search Bar */}
          <div className="border border-[#b4bbc9] rounded-[18px] h-[50px] md:h-[65px] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2.5 md:gap-3">
            <div className="relative w-5 h-5 md:w-8 md:h-8 shrink-0">
              <Image
                src={imgSearch}
                alt="Search"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <input
              type="text"
              placeholder="Cari judul artikel"
              className="flex-1 bg-transparent border-none outline-none font-normal text-xs md:text-sm text-[#6c727c] placeholder:text-[#6c727c]"
            />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="pb-16 md:pb-20">
        <div className="max-w-[1100px] mx-auto px-6 md:px-8 lg:px-10">
          {/* Article Header */}
          <div className="flex flex-col gap-3 md:gap-4 items-center text-center mb-8 md:mb-10 text-[#561530]">
            <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl w-full">
              {articleContent.title}
            </h1>
            <p className="font-normal text-xs md:text-sm lg:text-base">
              {articleContent.date}
            </p>
          </div>

          {/* Article Body */}
          <div className="font-normal text-xs md:text-sm lg:text-base leading-relaxed text-[#561530] space-y-4 md:space-y-5">
            {articleContent.content.map((paragraph, index) => {
              if (paragraph === "") {
                return <div key={index} className="h-4 md:h-5" />;
              }
              
              if (paragraph.startsWith("•")) {
                return (
                  <p key={index} className="ml-4 md:ml-6">
                    {paragraph}
                  </p>
                );
              }
              
              if (paragraph.match(/^\d+\./)) {
                return (
                  <h2 key={index} className="font-bold text-sm md:text-base lg:text-lg mt-6 md:mt-8 mb-2 md:mb-3">
                    {paragraph}
                  </h2>
                );
              }
              
              if (paragraph.endsWith(":")) {
                return (
                  <p key={index} className="font-semibold mt-4 md:mt-5 mb-2">
                    {paragraph}
                  </p>
                );
              }
              
              return (
                <p key={index} className="mb-3 md:mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#561530] w-full py-6 md:py-8">
        <div className="flex flex-col gap-3 md:gap-4 items-center px-6 md:px-8 lg:px-10 w-full max-w-[900px] mx-auto">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <div className="h-[30px] relative w-[117px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Image
                  src={imgLogo1} 
                  alt="Siramify Logo" 
                  width={117} 
                  height={30}
                  className="absolute h-[221.94%] left-[-1.71%] max-w-none top-[-64.52%] w-[101.76%]"
                  unoptimized
                />
              </div>
            </div>
            <div className="h-[26px] relative w-0 hidden md:block">
              <div className="absolute inset-[-1.92%_-0.5px]">
                <Image src={imgVector2} alt="" width={1} height={26} className="block max-w-none size-full" unoptimized />
              </div>
            </div>
            <div className="flex gap-[15px] items-center">
              <a href="https://www.linkedin.com/in/niefa-ev/" target="_blank" rel="noopener noreferrer" className="size-6 hover:opacity-70 transition flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" fill="white"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/niefaefrilia/" target="_blank" rel="noopener noreferrer" className="size-6 hover:opacity-70 transition flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="white"/>
                </svg>
              </a>
              <a href="https://wa.me/6281287840141" target="_blank" rel="noopener noreferrer" className="size-6 hover:opacity-70 transition flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="white"/>
                </svg>
              </a>
            </div>
          </div>
          <p className="font-normal text-[10px] md:text-xs text-center text-white w-full">
            Siramify adalah platform berbasis web yang dirancang untuk membantu petani mengelola penyiraman tanaman secara otomatis, efisien, dan berbasis data. Dengan memanfaatkan teknologi sensor suhu dan kelembapan yang terhubung ke sistem pemantauan real-time, Siramify memungkinkan pengguna mengetahui kondisi lingkungan tanaman secara akurat serta mengatur penyiraman sesuai kebutuhan.
          </p>
          <p className="font-normal text-[10px] md:text-xs text-center text-white w-full">© 2025 SIRAMIFY</p>
        </div>
      </footer>
    </div>
  );
}

