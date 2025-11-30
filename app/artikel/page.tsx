"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useState } from "react";

// Asset URLs dari Figma
const imgLogo1 = "https://www.figma.com/api/mcp/asset/3777a01f-7248-4b92-81c8-28d8ce86e840";
const imgImage2 = "https://www.figma.com/api/mcp/asset/1fd008a2-2a55-42ed-a8b1-7620ddcaff71";
const imgImage3 = "https://www.figma.com/api/mcp/asset/ea8e2bae-5225-4d17-8b40-4bb38e97d0b2";
const imgImage4 = "https://www.figma.com/api/mcp/asset/95152212-acda-4686-bdd5-4649a6893c69";
const imgImage5 = "https://www.figma.com/api/mcp/asset/aaf63488-5a97-45ec-bf04-53021e0d5fb2";
const imgImage6 = "https://www.figma.com/api/mcp/asset/331c9da0-e855-4a16-acdf-81102530813f";
const imgImage7 = "https://www.figma.com/api/mcp/asset/d5241686-dae8-47ee-806e-df515fe089ea";
const imgVector2 = "https://www.figma.com/api/mcp/asset/044ae3c8-2b69-4ea0-a2fc-094b22f6f72d";
const imgSearch = "https://www.figma.com/api/mcp/asset/2d908c6a-aba8-4722-a2dc-d351d00c8b9f";
const imgVector = "https://www.figma.com/api/mcp/asset/914c1c8a-bf1f-494d-8bd1-71f1a18c0667";

function IcBaselineWhatsapp({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-[8.33%_8.54%]">
        <Image src={imgVector} alt="" width={20} height={20} className="block max-w-none size-full" unoptimized />
      </div>
    </div>
  );
}

const articles = [
  {
    id: 1,
    title: "Cara Siramify Ngubah Budidaya Selada Merah Jadi Lebih Stabil",
    description: "Budidaya selada merah membutuhkan perhatian khusus untuk menghasilkan kualitas yang konsisten. Siramify hadir dengan teknologi canggih yang mengubah cara petani mengelola budidaya selada merah, menjadikannya lebih stabil dan dapat diprediksi...",
    date: "20 October 2025",
    image: imgImage4,
  },
  {
    id: 2,
    title: "Cara Siramify Bikin Kontrol Suhu & Kelembapan Jadi Super Akurat",
    description: "Menjaga stabilitas suhu dan kelembapan merupakan faktor penting dalam keberhasilan budidaya tanaman, terutama pada komoditas yang sensitif seperti selada merah. Fluktuasi kecil saja dapat memengaruhi...",
    date: "20 October 2025",
    image: imgImage5,
  },
  {
    id: 3,
    title: "Teknologi Sensor Real-Time Siramify untuk Monitoring Tanaman 24/7",
    description: "Dengan sistem sensor canggih yang terhubung langsung ke platform web, Siramify memungkinkan petani memantau kondisi tanaman secara real-time tanpa harus berada di lokasi. Data suhu, kelembapan, dan kondisi lingkungan...",
    date: "18 October 2025",
    image: imgImage3,
  },
  {
    id: 4,
    title: "Otomasi Penyiraman: Cara Siramify Menghemat Air Hingga 40%",
    description: "Sistem otomatis Siramify tidak hanya memudahkan petani, tetapi juga membantu menghemat penggunaan air secara signifikan. Dengan algoritma cerdas yang menyesuaikan jadwal penyiraman berdasarkan data sensor...",
    date: "15 October 2025",
    image: imgImage2,
  },
  {
    id: 5,
    title: "Tips Budidaya Selada Merah Premium dengan Siramify",
    description: "Selada merah membutuhkan perawatan khusus untuk menghasilkan kualitas premium. Siramify membantu petani menjaga kondisi optimal dengan sistem monitoring dan penyiraman otomatis yang presisi. Pelajari cara...",
    date: "12 October 2025",
    image: imgImage5,
  },
  {
    id: 6,
    title: "Dashboard Siramify: Analitik Data untuk Pertanian Cerdas",
    description: "Platform web Siramify menyediakan dashboard lengkap dengan visualisasi data yang mudah dipahami. Petani dapat melihat tren suhu, kelembapan, dan pola penyiraman untuk mengambil keputusan yang lebih baik...",
    date: "10 October 2025",
    image: imgImage6,
  },
  {
    id: 7,
    title: "Robot Penyiraman Otomatis: Masa Depan Pertanian Modern",
    description: "Teknologi robotik dalam pertanian semakin berkembang. Siramify mengintegrasikan sistem robot penyiraman yang dapat dikontrol melalui platform web, memungkinkan petani mengelola lahan dari jarak jauh dengan efisien...",
    date: "8 October 2025",
    image: imgImage7,
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
            <button className="border-2 border-[#9e1c60] border-solid box-border flex gap-2 items-center justify-center px-8 md:px-12 lg:px-16 py-3 md:py-4 lg:py-5 rounded-full bg-transparent hover:bg-[#9e1c60] transition group">
              <span className="font-bold text-[10px] md:text-xs lg:text-sm text-[#9e1c60] group-hover:text-white transition">
                Muat Lebih Banyak
              </span>
            </button>
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

