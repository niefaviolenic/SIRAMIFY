"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Banner from "./Banner";
import { supabase } from "../../utils/supabaseClient";

const imgSiramTentangKami = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siram_tentang_kami.webp?updatedAt=1764650943034";

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#6C727C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke="#6C727C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Product {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  deskripsi: string;
  foto: string | null;
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('produk')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="relative w-full pt-32 pb-12 px-6 md:px-8 lg:px-10 max-w-[1200px] mx-auto min-h-screen">

        {/* Header Section: Title and Search */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full mb-12 gap-6">
          <div className="flex flex-col gap-2 items-start text-left w-full md:w-auto">
            <h1 className="font-bold text-[#9e1c60] text-3xl md:text-4xl">Produk Kami</h1>
            <p className="font-normal text-sm md:text-base text-[#561530]">
              Temukan berbagai produk berkualitas tinggi dari Siramify.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-[400px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 border border-[#E0E0E0] rounded-full leading-5 bg-white placeholder-[#6C727C] focus:outline-none focus:ring-2 focus:ring-[#9e1c60] focus:border-transparent transition-all shadow-sm"
              placeholder="Cari produk atau merek"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>



        {/* Banner Section */}
        <Banner />

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex flex-col gap-2 items-start w-full rounded-xl p-4 border border-transparent">
                <div className="relative aspect-square w-full rounded-[12px] overflow-hidden bg-gray-200 animate-pulse"></div>
                <div className="flex flex-col gap-1.5 items-start w-full mt-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="flex items-center justify-between w-full mt-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Link href={`/produk/${product.id}`} key={product.id} className="contents">
                <div className="relative z-0 flex flex-col gap-2 items-start w-full rounded-xl p-4 transition cursor-pointer group overflow-hidden">
                  {/* Hover Background Animation */}
                  <div className="absolute inset-0 bg-[#eed2e1]/50 scale-0 transition-transform duration-250 ease-out group-hover:scale-100 rounded-xl origin-center -z-10" />

                  <div className="relative aspect-square w-full rounded-[12px] overflow-hidden bg-gray-100">
                    <Image
                      src={product.foto || imgSiramTentangKami}
                      alt={product.nama}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 items-start w-full mt-2">
                    <p className="font-medium text-sm text-[#561530] w-full line-clamp-2 leading-tight">{product.nama}</p>
                    <div className="flex items-center justify-between w-full mt-1">
                      <p className="font-bold text-[#811844] text-lg">
                        <span className="text-xs font-normal">Rp</span> {formatCurrency(product.harga)}
                      </p>
                      <p className="text-[10px] text-[#561530]/80">Stok: {product.stok}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg text-[#561530] font-medium">Tidak ada produk yang ditemukan.</p>
            <p className="text-sm text-[#6C727C] mt-2">Coba kata kunci lain atau reset pencarian Anda.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
