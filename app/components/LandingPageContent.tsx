"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FadeIn from "./FadeIn";
import Skeleton from "./Skeleton";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Toast from "./Toast";

// Asset URLs
const imgReadLeaf = "https://ik.imagekit.io/et2ltjxzhq/Siramify/selada_merah_hero.webp?updatedAt=1764650943013";
const siramifyLogo = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_logo.png";
const imgImage3 = "https://ik.imagekit.io/et2ltjxzhq/Siramify/selada_merah_tentang_kami.webp?updatedAt=1764650942939";
const imgSiramTentangKami = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siram_tentang_kami.webp?updatedAt=1764650943034";

interface Product {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  foto: string | null;
  jumlah_terjual: number;
}

interface Article {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

export default function LandingPageContent() {
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, articlesResponse] = await Promise.all([
          supabase
            .from('produk')
            .select('*')
            .limit(3)
            .order('created_at', { ascending: false }),
          supabase
            .from('articles')
            .select('*')
            .limit(2)
            .order('created_at', { ascending: false })
        ]);

        if (productsResponse.data) {
          setProducts(productsResponse.data);
        }
        if (articlesResponse.data) {
          setArticles(articlesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      topic: formData.get('topic'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setToast({ message: 'Pesan berhasil dikirim!', type: 'success' });
        (e.target as HTMLFormElement).reset();
        setSelectedTopic("");
      } else {
        const errorData = await response.json();
        setToast({ message: `Gagal mengirim pesan: ${errorData.error || 'Terjadi kesalahan'}`, type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Terjadi kesalahan saat mengirim pesan.', type: 'error' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
          <Link href="/masuk" className="mt-6 md:mt-8 bg-[#561530] border-2 border-solid border-white box-border flex gap-2 items-center px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-[#811844] active:brightness-75 transition cursor-pointer">
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
              src="https://ik.imagekit.io/et2ltjxzhq/Siramify/Cahaya.webp"
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Blur Effect - Kanan Atas Tentang Kami (zigzag 1: kanan atas, mepet kanan layar) */}
          <div className="absolute top-[5%] -right-[150px] md:-right-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
            <Image
              src="https://ik.imagekit.io/et2ltjxzhq/Siramify/Cahaya.webp"
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Blur Effect - Kiri Bawah Tentang Kami (zigzag 2: kiri bawah, mepet kiri layar) */}
          <div className="absolute bottom-[15%] -left-[150px] md:-left-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
            <Image
              src="https://ik.imagekit.io/et2ltjxzhq/Siramify/Cahaya.webp"
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col gap-12 md:gap-14 lg:gap-16 items-start px-6 md:px-8 lg:px-10 w-full max-w-[900px] mx-auto">
            {/* Tahukah kamu Section */}
            <FadeIn>
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
                  <div className="absolute inset-0 overflow-hidden rounded-bl-[100px] md:rounded-bl-[228px] rounded-br-[28px] rounded-tl-[100px] md:rounded-tl-[228px] rounded-tr-[28px]">
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
            </FadeIn>

            {/* Di sinilah Siramify Section */}
            <FadeIn delay={200}>
              <div className="flex flex-col md:flex-row gap-6 items-center w-full">
                <div className="flex items-center justify-center relative shrink-0 order-2 md:order-1 w-full md:w-[48%]">
                  <div className="flex-none rotate-[180deg] scale-y-[-100%] w-full">
                    <div className="h-[200px] md:h-[280px] lg:h-[360px] relative rounded-bl-[40px] md:rounded-bl-[60px] rounded-br-[16px] rounded-tl-[40px] md:rounded-tl-[60px] rounded-tr-[16px] w-full shrink-0">
                      <Image
                        src={imgSiramTentangKami}
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
            </FadeIn>

            {/* Visi Misi Section */}
            <div className="flex flex-col gap-5 md:gap-6 items-start w-full mt-5">
              {/* Visi */}
              <FadeIn delay={400} className="w-full">
                <div className="flex flex-col md:flex-row gap-5 md:gap-20 items-center w-full">
                  <div className="box-border flex gap-2 items-center justify-center p-2 w-full md:w-[48%] order-2 md:order-1">
                    <p className="font-normal text-xs md:text-sm text-[#561530] w-full">
                      Menjadi platform digital terdepan yang mendorong terciptanya sistem penyiraman otomatis untuk pertanian berkelanjutan dan efisien di seluruh Indonesia.
                    </p>
                  </div>
                  <div className="relative size-[100px] md:size-[120px] lg:size-[150px] shrink-0 order-1 md:order-2 md:ml-16">
                    <div className="size-full rounded-full bg-[#9e1c60]" />
                    <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm md:text-lg lg:text-xl text-center text-white">
                      Visi Kami
                    </p>
                  </div>
                </div>
              </FadeIn>

              {/* Misi */}
              <FadeIn delay={600} className="w-full">
                <div className="flex flex-col md:flex-row gap-5 md:gap-40 items-center justify-end w-full">
                  <div className="relative size-[100px] md:size-[120px] lg:size-[150px] shrink-0 order-1 md:order-1 md:ml-25">
                    <div className="size-full rounded-full bg-[#9e1c60]" />
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
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Artikel Section */}
        <section id="artikel" className="relative w-full py-6 md:py-8 scroll-mt-24 md:scroll-mt-28">
          {/* Blur Effect - Kanan Atas Artikel (zigzag 3: kanan atas, mepet kanan layar) */}
          <div className="absolute top-[5%] -right-[150px] md:-right-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
            <Image
              src="https://ik.imagekit.io/et2ltjxzhq/Siramify/Cahaya.webp"
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <FadeIn className="relative z-10 flex flex-col gap-5 md:gap-6 items-center w-full px-6 md:px-8 lg:px-10 max-w-[900px] mx-auto">
            <div className="flex flex-col gap-2.5 md:gap-3 items-start text-center w-full">
              <h2 className="font-bold text-[#9e1c60] text-lg md:text-xl lg:text-2xl w-full">Artikel</h2>
              <p className="font-normal text-xs md:text-sm text-[#561530] w-full">
                Jelajahi berbagai artikel yang membahas teknologi cerdas untuk pertanian, mulai dari pemantauan lingkungan, otomasi penyiraman, hingga tips praktis meningkatkan kualitas panen dan efisiensi penggunaan air.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center justify-center w-full mt-5">
              {isLoading ? (
                <>
                  <Skeleton className="w-full md:w-[48%] h-[280px]" />
                  <Skeleton className="w-full md:w-[48%] h-[280px]" />
                </>
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <Link href={`/artikel/${article.id}`} key={article.id} className="relative flex flex-col gap-2.5 items-start w-full md:w-[48%] rounded-xl p-6 transition cursor-pointer group overflow-hidden">
                    {/* Hover Background Animation */}
                    <div className="absolute inset-0 bg-[#eed2e1]/50 scale-0 transition-transform duration-250 ease-out group-hover:scale-100 rounded-xl origin-center -z-10" />

                    <div className="relative h-[160px] md:h-[200px] w-full rounded-tl-[12px] rounded-tr-[12px] overflow-hidden">
                      <Image
                        src={article.image_url || imgSiramTentangKami}
                        alt={article.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p className="font-bold text-xs md:text-sm text-[#561530] w-full line-clamp-2">
                      {article.title}
                    </p>
                    <p className="font-normal text-[10px] md:text-xs text-[#561530]">
                      {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-center text-[#561530] text-sm">Tidak ada artikel.</p>
              )}
            </div>
            <Link href="/artikel" className="border-2 border-[#9e1c60] border-solid box-border flex gap-2 items-center justify-center px-6 md:px-8 py-1.5 md:py-2 rounded-full bg-transparent hover:bg-[#9e1c60] active:brightness-75 transition group mt-4 cursor-pointer">
              <span className="font-bold text-xs md:text-sm text-[#9e1c60] group-hover:text-white transition">Lihat Lainnya</span>
            </Link>
          </FadeIn>
        </section>

        {/* Produk Section */}
        <section id="produk" className="relative w-full py-6 md:py-8 scroll-mt-24 md:scroll-mt-28">
          {/* Blur Effect - Kiri Bawah Produk (zigzag 4: kiri bawah, mepet kiri layar) */}
          <div className="absolute bottom-[15%] -left-[150px] md:-left-[200px] w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none opacity-60 z-0">
            <Image
              src="https://ik.imagekit.io/et2ltjxzhq/Siramify/Cahaya.webp"
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <FadeIn className="relative z-10 flex flex-col gap-5 md:gap-6 items-center w-full px-6 md:px-8 lg:px-10 max-w-[900px] mx-auto">
            <div className="flex flex-col gap-2.5 md:gap-3 items-start text-center w-full">
              <h2 className="font-bold text-[#9e1c60] text-lg md:text-xl lg:text-2xl w-full">Produk</h2>
              <div className="font-normal text-xs md:text-sm text-[#561530] w-full">
                <p className="mb-2">
                  Lihat berbagai produk segar dan siap pakai mulai dari selada merah berkualitas premium, beragam bibit pilihan, hingga pupuk pendukung pertumbuhan. Semua produk tersedia untuk petani yang ingin meningkatkan hasil tanam maupun konsumen yang mencari selada segar terbaik.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center justify-center w-full mt-5">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="relative flex flex-col gap-2.5 items-start w-full md:w-[30%] rounded-xl p-6">
                    <Skeleton className="w-full aspect-square rounded-tl-[16px] rounded-tr-[16px]" />
                    <div className="flex flex-col gap-2.5 items-start w-full">
                      <Skeleton className="w-full h-4" />
                      <div className="flex items-center justify-between w-full">
                        <Skeleton className="w-1/3 h-4" />
                        <Skeleton className="w-1/4 h-3" />
                      </div>
                    </div>
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <Link href={`/produk/${product.id}`} key={product.id} className="contents">
                    <div className="relative flex flex-col gap-2.5 items-start w-full md:w-[30%] rounded-xl p-6 transition cursor-pointer group overflow-hidden">
                      {/* Hover Background Animation */}
                      <div className="absolute inset-0 bg-[#eed2e1]/50 scale-0 transition-transform duration-250 ease-out group-hover:scale-100 rounded-xl origin-center -z-10" />

                      <div className="relative aspect-square w-full rounded-tl-[16px] rounded-tr-[16px] overflow-hidden">
                        <Image
                          src={product.foto || imgSiramTentangKami}
                          alt={product.nama}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col gap-2.5 items-start w-full">
                        <p className="font-normal text-xs md:text-sm text-[#561530] w-full">{product.nama}</p>
                        <div className="flex items-center justify-between w-full">
                          <p className="font-bold text-[#811844]">
                            <span className="text-[10px] md:text-xs">Rp</span>
                            <span className="text-xs md:text-sm">{formatCurrency(product.harga)}</span>
                          </p>
                          <p className="text-[10px] md:text-xs text-[#561530]">{product.jumlah_terjual || 0} Terjual</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-[#561530] text-sm">Tidak ada produk.</p>
              )}
            </div>
            <Link href="/produk" className="border-2 border-[#9e1c60] border-solid box-border flex gap-2 items-center justify-center px-6 md:px-8 py-1.5 md:py-2 rounded-full bg-transparent hover:bg-[#9e1c60] active:brightness-75 transition group mt-4 cursor-pointer">
              <span className="font-bold text-xs md:text-sm text-[#9e1c60] group-hover:text-white transition">Lihat Lainnya</span>
            </Link>
          </FadeIn>
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
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#561530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                disabled={isSubmitting}
                className={`bg-[#9e1c60] box-border flex gap-2 items-center justify-center px-6 md:px-8 py-2 md:py-2.5 rounded-full w-full hover:bg-[#811844] active:brightness-75 transition cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="font-bold text-xs md:text-sm text-white">
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                </span>
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
