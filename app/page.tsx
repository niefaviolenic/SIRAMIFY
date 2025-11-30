"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";

// Asset URLs dari Figma
const imgReadLeaf = "https://www.figma.com/api/mcp/asset/d7c4fe13-b011-44db-a123-fdc128d786cd";
const imgLogo1 = "https://www.figma.com/api/mcp/asset/3777a01f-7248-4b92-81c8-28d8ce86e840";
const imgImage3 = "https://www.figma.com/api/mcp/asset/ea8e2bae-5225-4d17-8b40-4bb38e97d0b2";
const imgImage2 = "https://www.figma.com/api/mcp/asset/1fd008a2-2a55-42ed-a8b1-7620ddcaff71";
const imgImage4 = "https://www.figma.com/api/mcp/asset/615aa243-3595-4664-b1f2-94253d73ff69";
const imgImage5 = "https://www.figma.com/api/mcp/asset/77b11df7-4216-486e-bf52-ae6b03b9c5b6";
const imgImage6 = "https://www.figma.com/api/mcp/asset/331c9da0-e855-4a16-acdf-81102530813f";
const imgImage7 = "https://www.figma.com/api/mcp/asset/d5241686-dae8-47ee-806e-df515fe089ea";
const imgVector = "https://www.figma.com/api/mcp/asset/914c1c8a-bf1f-494d-8bd1-71f1a18c0667";
const imgCahaya = "https://www.figma.com/api/mcp/asset/35d68b92-fc89-4723-bd63-4896e270b1ad";
const imgVector2 = "https://www.figma.com/api/mcp/asset/044ae3c8-2b69-4ea0-a2fc-094b22f6f72d";
const imgLinkedinLogo = "https://www.figma.com/api/mcp/asset/cfaf143f-19b3-472c-908b-e96087c8cfe6";
const imgInstagramLogo = "https://www.figma.com/api/mcp/asset/e3897fcd-3087-4e1b-858d-afdddffd0fb8";
const imgEllipse246 = "https://www.figma.com/api/mcp/asset/8f3fa706-2ca5-45bb-b13b-2b0a89f066e7";

function IcBaselineWhatsapp({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-[8.33%_8.54%]">
        <Image src={imgVector} alt="" width={20} height={20} className="block max-w-none size-full" unoptimized />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      topic: formData.get('topic'),
      message: formData.get('message'),
    };

    // Create mailto link
    const subject = encodeURIComponent(`Kontak Siramify - ${data.topic}`);
    const body = encodeURIComponent(
      `Nama: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nTopik: ${data.topic}\n\nPesan:\n${data.message}`
    );
    window.location.href = `mailto:niefaviolenic14@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-screen w-full pt-20">
        {/* Background Image */}
        <div className="absolute h-full left-0 top-0 w-full">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
              src={imgReadLeaf} 
              alt="Background" 
              fill
              className="object-cover"
          priority
              unoptimized
            />
          </div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute bg-black/50 h-full left-0 top-0 w-full" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col h-full items-start justify-center px-6 md:px-8 lg:px-10 max-w-[900px] mx-auto">
          {/* Hero Text */}
          <div className="flex flex-col gap-5 items-start text-white w-full">
            <h1 className="font-bold text-3xl md:text-3xl lg:text-6xl leading-tight text-white whitespace-pre-wrap">
              Rawat Tanaman Anda Bersama Siramify
          </h1>
            <p className="text-xs md:text-sm lg:text-base leading-normal">
              Siramify adalah sistem penyiraman otomatis berbasis web yang membantu petani menjaga tanaman tetap sehat dan efisien dalam penggunaan air. Dengan dukungan sensor suhu dan kelembapan, Siramify menentukan waktu penyiraman yang tepat tanpa perlu pengawasan terus-menerus.
            </p>
          </div>

          {/* CTA Button */}
          <Link href="/masuk" className="mt-6 md:mt-8 bg-[#561530] border-2 border-solid border-white box-border flex gap-2 items-center px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-[#811844] transition">
            <span className="font-bold text-xs md:text-sm text-white">Mulai Sekarang</span>
          </Link>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="relative w-full">
        {/* Tentang Kami Section */}
        <section id="tentang-kami" className="relative w-full py-10 md:py-12 scroll-mt-24 md:scroll-mt-28">
          {/* Blur Effect - Kiri Atas Tentang Kami (transisi antara Landing Page dan Tentang Kami, mepet kiri layar) */}
          <div className="absolute top-[0%] -left-[150px] md:-left-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
            <Image 
              src="/Cahaya.png" 
              alt="" 
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          
          {/* Blur Effect - Kanan Atas Tentang Kami (zigzag 1: kanan atas, mepet kanan layar) */}
          <div className="absolute top-[5%] -right-[150px] md:-right-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
            <Image 
              src="/Cahaya.png" 
              alt="" 
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          
          {/* Blur Effect - Kiri Bawah Tentang Kami (zigzag 2: kiri bawah, mepet kiri layar) */}
          <div className="absolute bottom-[15%] -left-[150px] md:-left-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
            <Image 
              src="/Cahaya.png" 
              alt="" 
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          
          {/* Content Container */}
          <div className="relative z-10 flex flex-col gap-12 md:gap-14 lg:gap-16 items-start px-6 md:px-8 lg:px-10 w-full max-w-[900px] mx-auto">
          {/* Tahukah kamu Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
            <div className="flex flex-col gap-2.5 md:gap-3 items-start text-xs md:text-sm text-[#561530] w-full md:w-[48%]">
              <p className="font-bold italic w-full">Tahukah kamu…</p>
              <div className="font-normal w-full">
                <p className="mb-3">
                  Selada oakleaf merah (Lactuca sativa var. crispa) dikenal sebagai salah satu varietas hortikultura bernilai tinggi. Daunnya yang berwarna merah keunguan dan teksturnya yang renyah hanya dapat tercipta bila tanaman ini tumbuh dalam kondisi yang benar-benar stabil.
                </p>
                <p className="mb-3">
                  Untuk mencapai kualitas terbaik, selada ini membutuhkan pengelolaan suhu dan kelembapan yang konsisten—lingkungan yang terukur, terpantau, dan tepat waktu. Bahkan sedikit perubahan pada suhu atau waktu penyiraman bisa memengaruhi warna, tekstur, dan kesegarannya.
                </p>
                <p>Karena itu, menjaga stabilitas lingkungan bukan hanya penting…</p>
              </div>
              <p className="font-bold italic w-full">…itu adalah kunci dari kualitas premium.</p>
            </div>
            <div className="h-[200px] md:h-[280px] lg:h-[360px] relative rounded-bl-[40px] md:rounded-bl-[60px] rounded-br-[16px] rounded-tl-[40px] md:rounded-tl-[60px] rounded-tr-[16px] w-full md:w-[48%] shrink-0">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-bl-[100px] md:rounded-bl-[228px] rounded-br-[28px] rounded-tl-[100px] md:rounded-tl-[228px] rounded-tr-[28px]">
                <Image 
                  src={imgImage3} 
                  alt="Selada merah" 
                  fill
                  className="object-cover rounded-bl-[100px] md:rounded-bl-[228px] rounded-br-[28px] rounded-tl-[100px] md:rounded-tl-[228px] rounded-tr-[28px]"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Di sinilah Siramify Section */}
          <div className="flex flex-col md:flex-row gap-6 items-center w-full">
            <div className="flex items-center justify-center relative shrink-0 order-2 md:order-1 w-full md:w-[48%]">
              <div className="flex-none rotate-[180deg] scale-y-[-100%] w-full">
                <div className="h-[200px] md:h-[280px] lg:h-[360px] relative rounded-bl-[40px] md:rounded-bl-[60px] rounded-br-[16px] rounded-tl-[40px] md:rounded-tl-[60px] rounded-tr-[16px] w-full shrink-0">
                  <Image 
                    src={imgImage2} 
                    alt="Tanaman" 
                    fill
                    className="object-cover rounded-bl-[100px] md:rounded-bl-[228px] rounded-br-[28px] rounded-tl-[100px] md:rounded-tl-[228px] rounded-tr-[28px]"
                    unoptimized
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 md:gap-3 items-start text-xs md:text-sm text-[#561530] w-full md:w-[48%] order-1 md:order-2">
              <p className="font-bold italic leading-normal w-full">Di sinilah Siramify hadir sebagai solusinya.</p>
              <div className="font-normal w-full">
                <p className="leading-normal mb-2.5">
                  Platform berbasis web yang memudahkan petani menjaga suhu, kelembapan, dan penyiraman tetap stabil secara otomatis dan berbasis data.
                </p>
                <p className="leading-normal mb-2.5">Siramify memungkinkan petani:</p>
                <ul className="list-disc ms-5">
                  <li className="mb-1">Mendukung pertanian cerdas.</li>
                  <li className="mb-1">Pemantauan real-time tanpa jeda.</li>
                  <li className="mb-1">Otomatis dan efisien dalam penyiraman.</li>
                  <li>Ramah pengguna dan mudah dipahami.</li>
                </ul>
              </div>
              <p className="font-bold italic leading-normal w-full">
                Siramify memastikan setiap tanaman tumbuh di kondisi paling ideal setiap hari, tanpa repot.
              </p>
            </div>
          </div>

          {/* Visi Misi Section */}
          <div className="flex flex-col gap-5 md:gap-6 items-start w-full mt-5">
            {/* Visi */}
            <div className="flex flex-col md:flex-row gap-5 md:gap-20 items-center w-full">
              <div className="box-border flex gap-2 items-center justify-center p-2 w-full md:w-[48%] order-2 md:order-1">
                <p className="font-normal text-xs md:text-sm text-[#561530] w-full">
                  Menjadi platform digital terdepan yang mendorong terciptanya sistem penyiraman otomatis untuk pertanian berkelanjutan dan efisien di seluruh Indonesia.
                </p>
              </div>
              <div className="relative size-[100px] md:size-[120px] lg:size-[150px] shrink-0 order-1 md:order-2 md:ml-16">
                <Image src={imgEllipse246} alt="" width={366} height={366} className="block max-w-none size-full" unoptimized />
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm md:text-lg lg:text-xl text-center text-white">
                  Visi Kami
                </p>
              </div>
            </div>

            {/* Misi */}
            <div className="flex flex-col md:flex-row gap-5 md:gap-40 items-center justify-end w-full">
              <div className="relative size-[100px] md:size-[120px] lg:size-[150px] shrink-0 order-1 md:order-1 md:ml-25">
                <Image src={imgEllipse246} alt="" width={366} height={366} className="block max-w-none size-full" unoptimized />
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm md:text-lg lg:text-xl text-center text-white">
                  Misi Kami
                </p>
              </div>
              <div className="box-border flex gap-2 items-center justify-center p-2 w-full md:w-[48%] order-2 md:order-2">
                <div className="font-normal text-xs md:text-sm text-[#561530] w-full">
                  <p className="mb-2.5">
                    Kami berkomitmen menghadirkan pertanian modern melalui inovasi digital yang mudah digunakan, mudah diakses, dan hemat air.
                  </p>
                  <p>Siramify hadir untuk menjembatani kebutuhan petani dengan teknologi yang benar-benar membantu di lapangan.</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Artikel Section */}
          <section id="artikel" className="relative w-full py-6 md:py-8 scroll-mt-24 md:scroll-mt-28">
            {/* Blur Effect - Kanan Atas Artikel (zigzag 3: kanan atas, mepet kanan layar) */}
            <div className="absolute top-[5%] -right-[150px] md:-right-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
              <Image 
                src="/Cahaya.png" 
                alt="" 
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            
            <div className="relative z-10 flex flex-col gap-5 md:gap-6 items-center w-full px-6 md:px-8 lg:px-10 max-w-[900px] mx-auto">
            <div className="flex flex-col gap-2.5 md:gap-3 items-start text-center w-full">
              <h2 className="font-bold text-[#9e1c60] text-lg md:text-xl lg:text-2xl w-full">Artikel</h2>
              <p className="font-normal text-xs md:text-sm text-[#561530] w-full">
                Jelajahi berbagai artikel yang membahas teknologi cerdas untuk pertanian, mulai dari pemantauan lingkungan, otomasi penyiraman, hingga tips praktis meningkatkan kualitas panen dan efisiensi penggunaan air.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center justify-center w-full mt-5">
              <Link href="/artikel/1" className="flex flex-col gap-2.5 items-start w-full md:w-[48%] hover:opacity-80 transition-opacity cursor-pointer group">
                <div className="relative h-[160px] md:h-[200px] w-full rounded-tl-[12px] rounded-tr-[12px] overflow-hidden transition-transform group-hover:scale-105">
                  <Image 
                    src={imgImage4} 
                    alt="Artikel 1" 
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    unoptimized
                  />
                </div>
                <p className="font-bold text-xs md:text-sm text-[#561530] w-full group-hover:text-[#9e1c60] transition-colors">
                  Cara Siramify Ngubah Budidaya Selada Merah Jadi Lebih Stabil...
                </p>
                <p className="font-normal text-[10px] md:text-xs text-[#561530]">20 October 2025</p>
              </Link>
              <Link href="/artikel/2" className="flex flex-col gap-2.5 items-start w-full md:w-[48%] hover:opacity-80 transition-opacity cursor-pointer group">
                <div className="relative h-[160px] md:h-[200px] w-full rounded-tl-[12px] rounded-tr-[12px] overflow-hidden transition-transform group-hover:scale-105">
                  <Image 
                    src={imgImage5} 
                    alt="Artikel 2" 
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    unoptimized
                  />
                </div>
                <p className="font-bold text-xs md:text-sm text-[#561530] w-full group-hover:text-[#9e1c60] transition-colors">
                  Cara Siramify Bikin Kontrol Suhu & Kelembapan Jadi Super Akurat
                </p>
                <p className="font-normal text-[10px] md:text-xs text-[#561530]">20 October 2025</p>
              </Link>
            </div>
            <Link href="/artikel" className="border-2 border-[#9e1c60] border-solid box-border flex gap-2 items-center justify-center px-6 md:px-8 py-1.5 md:py-2 rounded-full bg-transparent hover:bg-[#9e1c60] transition group mt-4">
              <span className="font-bold text-xs md:text-sm text-[#9e1c60] group-hover:text-white transition">Lihat Lainnya</span>
            </Link>
            </div>
          </section>

          {/* Produk Section */}
          <section id="produk" className="relative w-full py-6 md:py-8 scroll-mt-24 md:scroll-mt-28">
            {/* Blur Effect - Kiri Bawah Produk (zigzag 4: kiri bawah, mepet kiri layar) */}
            <div className="absolute bottom-[15%] -left-[150px] md:-left-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
              <Image 
                src="/Cahaya.png" 
                alt="" 
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            
            <div className="relative z-10 flex flex-col gap-5 md:gap-6 items-center w-full px-6 md:px-8 lg:px-10 max-w-[900px] mx-auto">
            <div className="flex flex-col gap-2.5 md:gap-3 items-start text-center w-full">
              <h2 className="font-bold text-[#9e1c60] text-lg md:text-xl lg:text-2xl w-full">Produk</h2>
              <div className="font-normal text-xs md:text-sm text-[#561530] w-full">
                <p className="mb-2">
                  Lihat berbagai produk segar dan siap pakai mulai dari selada merah berkualitas premium, beragam bibit pilihan, hingga pupuk pendukung pertumbuhan. Semua produk tersedia untuk petani yang ingin meningkatkan hasil tanam maupun konsumen yang mencari selada segar terbaik.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center justify-center w-full mt-5">
              <div className="flex flex-col gap-2.5 items-start w-full md:w-[48%]">
                <div className="relative h-[180px] md:h-[240px] w-full rounded-tl-[16px] rounded-tr-[16px] overflow-hidden">
                  <Image 
                    src={imgImage6} 
                    alt="Bibit Selada Merah Premium" 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-2.5 items-start w-full">
                  <p className="font-normal text-xs md:text-sm text-[#561530] w-full">Bibit Selada Merah Premium</p>
                  <div className="flex items-center justify-between w-full">
                    <p className="font-bold text-[#811844]">
                      <span className="text-[10px] md:text-xs">Rp</span>
                      <span className="text-xs md:text-sm">10.000</span>
                    </p>
                    <p className="text-[10px] md:text-xs text-[#561530]">224 Terjual</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 items-start w-full md:w-[48%]">
                <div className="relative h-[180px] md:h-[240px] w-full rounded-tl-[16px] rounded-tr-[16px] overflow-hidden">
                  <Image 
                    src={imgImage7} 
                    alt="Pupuk Premium" 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-2.5 items-start w-full">
                  <p className="font-normal text-xs md:text-sm text-[#561530] w-full">Pupuk Premium</p>
                  <div className="flex items-center justify-between w-full">
                    <p className="font-bold text-[#811844]">
                      <span className="text-[10px] md:text-xs">Rp</span>
                      <span className="text-xs md:text-sm">10.000</span>
                    </p>
                    <p className="text-[10px] md:text-xs text-[#561530]">224 Terjual</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="border-2 border-[#9e1c60] border-solid box-border flex gap-2 items-center justify-center px-6 md:px-8 py-1.5 md:py-2 rounded-full bg-transparent hover:bg-[#9e1c60] transition group mt-4">
              <span className="font-bold text-xs md:text-sm text-[#9e1c60] group-hover:text-white transition">Lihat Lainnya</span>
            </button>
            </div>
          </section>

        {/* Kontak Section */}
        <section id="kontak" className="relative bg-[#eed2e1] w-full py-8 md:py-12 scroll-mt-24 md:scroll-mt-28">
          <div className="relative z-10 flex flex-col gap-5 md:gap-6 items-start px-6 md:px-8 lg:px-10 w-full max-w-[900px] mx-auto">
            <div className="flex flex-col gap-2.5 md:gap-3 items-start w-full">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-[#561530] w-full">Silakan Hubungi Kami</h2>
              <p className="font-normal text-xs md:text-sm text-[#561530] w-full">
                Apabila Anda memerlukan informasi mengenai Siramify, teknologi sensor, automasi penyiraman, atau ingin meningkatkan efisiensi pengelolaan lahan, silakan hubungi kami. Tim kami siap membantu Anda memahami bagaimana teknologi dapat mendukung pertumbuhan tanaman secara optimal.
          </p>
        </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-6 items-start w-full">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center w-full">
                <div className="flex flex-col gap-1.5 items-start w-full md:w-[48%]">
                  <label className="font-bold text-xs md:text-sm text-[#561530] w-full">Nama Depan</label>
                  <input 
                    type="text" 
                    name="firstName"
                    placeholder="Nama Depan"
                    required
                    className="bg-[#f5f5f5] box-border flex gap-2 h-[40px] items-center justify-center px-3 md:px-4 py-2 rounded-lg w-full font-normal text-xs md:text-sm text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  />
                </div>
                <div className="flex flex-col gap-1.5 items-start w-full md:w-[48%]">
                  <label className="font-bold text-xs md:text-sm text-[#561530] w-full">Nama Belakang</label>
                  <input 
                    type="text" 
                    name="lastName"
                    placeholder="Nama Belakang"
                    required
                    className="bg-[#f5f5f5] box-border flex gap-2 h-[40px] items-center justify-center px-3 md:px-4 py-2 rounded-lg w-full font-normal text-xs md:text-sm text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center w-full">
                <div className="flex flex-col gap-1.5 items-start w-full md:w-[48%]">
                  <label className="font-bold text-xs md:text-sm text-[#561530] w-full">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email"
                    required
                    className="bg-[#f5f5f5] box-border flex gap-2 h-[40px] items-center justify-center px-3 md:px-4 py-2 rounded-lg w-full font-normal text-xs md:text-sm text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  />
                </div>
                <div className="flex flex-col gap-1.5 items-start w-full md:w-[48%]">
                  <label className="font-bold text-xs md:text-sm text-[#561530] w-full">Topik</label>
                  <div className="relative w-full">
                    <select 
                      name="topic"
                      required
                      value={selectedTopic}
                      onFocus={() => setIsTopicOpen(true)}
                      onBlur={() => setIsTopicOpen(false)}
                      onChange={(e) => {
                        setSelectedTopic(e.target.value);
                        setIsTopicOpen(false);
                      }}
                      className="bg-[#f5f5f5] box-border flex gap-2 h-[40px] items-center justify-center px-3 md:px-4 pr-8 md:pr-10 py-2 rounded-lg w-full font-normal text-xs md:text-sm text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60] appearance-none cursor-pointer"
                    >
                      <option value="">— Pilih Topik —</option>
                      <option value="Konsultasi Siramify">Konsultasi Siramify</option>
                      <option value="Bantuan Teknis">Bantuan Teknis</option>
                      <option value="Informasi Produk">Informasi Produk</option>
                      <option value="Kerja Sama">Kerja Sama</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    <div className={`absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${isTopicOpen ? 'rotate-180' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#561530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label className="font-bold text-xs md:text-sm text-[#561530] w-full">Pesan</label>
                <textarea 
                  name="message"
                  placeholder="Tulis pesan Anda di sini…"
                  rows={3}
                  required
                  className="bg-[#f5f5f5] box-border flex gap-2 items-start justify-start px-3 md:px-4 py-2 rounded-lg w-full font-normal text-xs md:text-sm text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60] resize-none"
                />
              </div>
              <button 
                type="submit"
                className="bg-[#9e1c60] box-border flex gap-2 items-center justify-center px-6 md:px-8 py-2 md:py-2.5 rounded-full w-full hover:bg-[#811844] transition"
              >
                <span className="font-bold text-xs md:text-sm text-white">Kirim Pesan</span>
              </button>
            </form>
          </div>
        </section>

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
    </div>
  );
}
