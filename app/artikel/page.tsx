"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";

// Asset URLs
const imgSearch = "https://www.figma.com/api/mcp/asset/2d908c6a-aba8-4722-a2dc-d351d00c8b9f";
const imgArticle = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siram_tentang_kami.webp?updatedAt=1764650943034";

const articles = [
  {
    id: 1,
    title: "Cara Siramify Ngubah Budidaya Selada Merah Jadi Lebih Stabil",
    description: "Budidaya selada merah membutuhkan perhatian khusus untuk menghasilkan kualitas yang konsisten. Siramify hadir dengan teknologi canggih yang mengubah cara petani mengelola budidaya selada merah, menjadikannya lebih stabil dan dapat diprediksi...",
    date: "20 October 2025",
    image: imgArticle,
  },
  {
    id: 2,
    title: "Cara Siramify Bikin Kontrol Suhu & Kelembapan Jadi Super Akurat",
    description: "Menjaga stabilitas suhu dan kelembapan merupakan faktor penting dalam keberhasilan budidaya tanaman, terutama pada komoditas yang sensitif seperti selada merah. Fluktuasi kecil saja dapat memengaruhi...",
    date: "20 October 2025",
    image: imgArticle,
  },
  {
    id: 3,
    title: "Teknologi Sensor Real-Time Siramify untuk Monitoring Tanaman 24/7",
    description: "Dengan sistem sensor canggih yang terhubung langsung ke platform web, Siramify memungkinkan petani memantau kondisi tanaman secara real-time tanpa harus berada di lokasi. Data suhu, kelembapan, dan kondisi lingkungan...",
    date: "18 October 2025",
    image: imgArticle,
  },
  {
    id: 4,
    title: "Otomasi Penyiraman: Cara Siramify Menghemat Air Hingga 40%",
    description: "Sistem otomatis Siramify tidak hanya memudahkan petani, tetapi juga membantu menghemat penggunaan air secara signifikan. Dengan algoritma cerdas yang menyesuaikan jadwal penyiraman berdasarkan data sensor...",
    date: "15 October 2025",
    image: imgArticle,
  },
  {
    id: 5,
    title: "Tips Budidaya Selada Merah Premium dengan Siramify",
    description: "Selada merah membutuhkan perawatan khusus untuk menghasilkan kualitas premium. Siramify membantu petani menjaga kondisi optimal dengan sistem monitoring dan penyiraman otomatis yang presisi. Pelajari cara...",
    date: "12 October 2025",
    image: imgArticle,
  },
  {
    id: 6,
    title: "Dashboard Siramify: Analitik Data untuk Pertanian Cerdas",
    description: "Platform web Siramify menyediakan dashboard lengkap dengan visualisasi data yang mudah dipahami. Petani dapat melihat tren suhu, kelembapan, dan pola penyiraman untuk mengambil keputusan yang lebih baik...",
    date: "10 October 2025",
    image: imgArticle,
  },
  {
    id: 7,
    title: "Robot Penyiraman Otomatis: Masa Depan Pertanian Modern",
    description: "Teknologi robotik dalam pertanian semakin berkembang. Siramify mengintegrasikan sistem robot penyiraman yang dapat dikontrol melalui platform web, memungkinkan petani mengelola lahan dari jarak jauh dengan efisien...",
    date: "8 October 2025",
    image: imgArticle,
  },
];

export default function ArtikelPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Main Content */}
      <div className="pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="max-w-[1100px] mx-auto px-6 md:px-8 lg:px-10">
          {/* Search Bar */}
          <div className="border border-[#b4bbc9] rounded-[18px] h-[50px] md:h-[65px] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2.5 md:gap-3 mb-8 md:mb-12">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-normal text-xs md:text-sm text-[#6c727c] placeholder:text-[#6c727c]"
            />
          </div>

          {/* Articles List */}
          <div className="flex flex-col gap-8 md:gap-12 items-center mb-8 md:mb-12">
            {articles.map((article, index) => (
              <div key={article.id} className="w-full">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-16 items-center w-full">
                  {/* Article Content */}
                  <Link href={`/artikel/${article.id}`} className="flex flex-col gap-4 md:gap-6 lg:gap-7 items-start text-[#561530] w-full md:w-[68%] hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="flex flex-col gap-3 md:gap-4 items-start w-full">
                      <h2 className="font-bold text-base md:text-xl lg:text-2xl w-full hover:text-[#9e1c60] transition-colors">
                        {article.title}
                      </h2>
                      <p className="font-normal text-[10px] md:text-xs lg:text-sm w-full">
                        {article.description}
                      </p>
                    </div>
                    <p className="font-normal text-[9px] md:text-xs lg:text-sm">
                      {article.date}
                    </p>
                  </Link>

                  {/* Article Image */}
                  <Link href={`/artikel/${article.id}`} className="relative w-full md:w-[32%] shrink-0 group cursor-pointer">
                    <div className="relative w-full aspect-[4/3] rounded-[15.555px] overflow-hidden transition-transform group-hover:scale-105">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover rounded-[15.555px] transition-opacity group-hover:opacity-90"
                        unoptimized
                      />
                    </div>
                  </Link>
                </div>

                {/* Divider */}
                {index < articles.length - 1 && (
                  <div className="mt-8 md:mt-12 border-t border-[#b4bbc9] w-full" />
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="flex justify-center">
            <button className="border-2 border-[#9e1c60] border-solid box-border flex gap-2 items-center justify-center px-8 md:px-12 lg:px-16 py-3 md:py-4 lg:py-5 rounded-full bg-transparent hover:bg-[#9e1c60] active:brightness-75 transition group">
              <span className="font-bold text-[10px] md:text-xs lg:text-sm text-[#9e1c60] group-hover:text-white transition">
                Muat Lebih Banyak
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
