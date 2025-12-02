"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import Toast from "../../components/Toast";

const imgSiramTentangKami = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siram_tentang_kami.webp?updatedAt=1764650943034";
const defaultProfile = "https://ik.imagekit.io/et2ltjxzhq/Siramify/default-profile.png"; // Placeholder if no photo

interface Petani {
  id: string;
  full_name: string;
  photo_profile: string | null;
}

interface Product {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  deskripsi: string;
  foto: string | null;
  jumlah_terjual: number;
  petani_id: string;
  petani?: Petani; // Joined data
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch current product with petani details
        // Explicitly select full_name and photo_profile from users table
        const { data: productData, error: productError } = await supabase
          .from('produk')
          .select('*, petani:users(full_name, photo_profile)')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // Fetch related products
        const { data: relatedData, error: relatedError } = await supabase
          .from('produk')
          .select('*')
          .neq('id', id)
          .limit(4)
          .order('created_at', { ascending: false });

        if (relatedError) throw relatedError;
        setRelatedProducts(relatedData || []);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newQuantity = prev + delta;
      if (newQuantity < 1) return 1;
      if (product && newQuantity > product.stok) return product.stok;
      return newQuantity;
    });
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/masuk');
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (await checkAuth()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !product) return;

        // Check if item exists in cart
        const { data: existingItem, error: fetchError } = await supabase
          .from('keranjang')
          .select('*')
          .eq('user_id', user.id)
          .eq('produk_id', product.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
          throw fetchError;
        }

        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          // Optional: Check stock limit again
          const finalQuantity = newQuantity > product.stok ? product.stok : newQuantity;

          const { error: updateError } = await supabase
            .from('keranjang')
            .update({ quantity: finalQuantity, updated_at: new Date() })
            .eq('id', existingItem.id);

          if (updateError) throw updateError;
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from('keranjang')
            .insert({
              user_id: user.id,
              produk_id: product.id,
              quantity: quantity
            });

          if (insertError) throw insertError;
        }

        setToast({ message: "Produk berhasil ditambahkan ke keranjang!", type: "success" });
      } catch (error: any) {
        console.error("Error adding to cart:", error);
        setToast({ message: "Gagal menambahkan ke keranjang: " + error.message, type: "error" });
      }
    }
  };

  const handleBuyNow = async () => {
    if (await checkAuth()) {
      // Logic for buy now
      console.log("Buy now");
    }
  };

  if (loading) {
    return (
      <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
        <Navbar />
        <div className="relative w-full pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[1200px] mx-auto animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="h-6 w-24 bg-gray-200 rounded mb-8"></div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-20">
            {/* Left Skeleton */}
            <div className="w-full lg:w-[40%] flex flex-col gap-6">
              <div className="aspect-square w-full bg-gray-200 rounded-[24px]"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>

            {/* Right Skeleton */}
            <div className="w-full lg:w-[60%] flex flex-col items-start gap-4">
              <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-10 w-1/2 bg-gray-200 rounded mt-4"></div>
              <div className="h-20 w-1/3 bg-gray-200 rounded mt-4"></div>
              <div className="flex gap-4 w-full mt-4">
                <div className="h-12 flex-1 bg-gray-200 rounded-full"></div>
                <div className="h-12 flex-1 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
        <Navbar />
        <div className="w-full flex flex-col justify-center items-center min-h-screen pt-32 gap-4">
          <h1 className="text-2xl font-bold text-[#561530]">Produk tidak ditemukan</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#9e1c60] text-white rounded-full hover:bg-[#811844] transition cursor-pointer"
          >
            Kembali
          </button>
        </div>
        <Footer />
      </div>
    );
  }

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

      <div className="relative w-full pt-32 pb-12 px-6 md:px-8 lg:px-10 max-w-[1200px] mx-auto">

        {/* Breadcrumb-ish / Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#6C727C] hover:text-[#9e1c60] transition mb-8 group cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:-translate-x-1 transition-transform">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-medium">Kembali</span>
        </button>

        {/* Product Detail Section */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-0">
          {/* Left: Image, Petani, Description */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            <div className="relative aspect-square w-full rounded-[24px] overflow-hidden bg-gray-100 border border-[#E0E0E0]">
              <Image
                src={product.foto || imgSiramTentangKami}
                alt={product.nama}
                fill
                className="object-cover"
                unoptimized
              />
            </div>


          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-[60%] flex flex-col items-start justify-between">
            <h1 className="font-bold text-[#561530] text-3xl md:text-4xl leading-tight mb-2">
              {product.nama}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-[#6C727C] text-sm">
                {product.jumlah_terjual || 0} Terjual
              </p>
            </div>

            <p className="font-bold text-[#9e1c60] text-3xl md:text-4xl mb-6">
              <span className="text-xl font-normal text-[#561530]">Rp</span> {formatCurrency(product.harga)}
            </p>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-2 mb-6">
              <p className="text-[#561530] font-medium">Kuantitas</p>
              <div className="flex items-center justify-between border border-[#E0E0E0] rounded-full px-4 py-2 w-[140px] select-none">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-8 h-8 flex items-center justify-center text-[#561530] hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
                  disabled={quantity <= 1}
                  aria-label="Kurangi kuantitas"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-[#9e1c60] transition-colors">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="font-bold text-[#561530] text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 flex items-center justify-center text-[#561530] hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
                  disabled={quantity >= product.stok}
                  aria-label="Tambah kuantitas"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-[#9e1c60] transition-colors">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-[#6C727C]">Tersedia: {product.stok} unit</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 border border-[#9e1c60] text-[#9e1c60] hover:bg-[#9e1c60]/5 font-bold py-3 px-6 rounded-full transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 20C9.55228 20 10 19.5523 10 19C10 18.4477 9.55228 18 9 18C8.44772 18 8 18.4477 8 19C8 19.5523 8.44772 20 9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 20C20.5523 20 21 19.5523 21 19C21 18.4477 20.5523 18 20 18C19.4477 18 19 18.4477 19 19C19 19.5523 19.4477 20 20 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Masukkan Keranjang
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#9e1c60] hover:bg-[#811844] text-white font-bold py-3 px-6 rounded-full transition shadow-lg hover:shadow-xl cursor-pointer"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Divider Top */}
        <div className="w-full border-t border-[#E0E0E0] my-8"></div>

        {/* Petani Section */}
        <div className="w-full mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
              <Image
                src={product.petani?.photo_profile || defaultProfile}
                alt={product.petani?.full_name || "Petani"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="font-bold text-[#561530] text-lg">{product.petani?.full_name || "Petani Siramify"}</p>
              <p className="text-xs text-[#6C727C]">Penjual Terpercaya</p>
            </div>
          </div>
        </div>

        {/* Divider Bottom */}
        <div className="w-full border-t border-[#E0E0E0] mb-8"></div>

        {/* Description */}
        <div className="flex flex-col gap-2 w-full mb-8">
          <h3 className="font-bold text-[#561530] text-lg">Deskripsi Produk</h3>
          <p className="text-[#6C727C] text-base leading-relaxed whitespace-pre-line">
            {product.deskripsi}
          </p>
        </div>
      </div>

      {/* Related Products */}
      <div className="w-full bg-[#F9FAFB] py-16">
        <div className="px-6 md:px-8 lg:px-10 max-w-[1200px] mx-auto">
          <div className="flex flex-col mb-8">
            <h2 className="font-bold text-[#561530] text-2xl md:text-3xl uppercase">KAMU MUNGKIN JUGA SUKA</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((item) => (
              <Link href={`/produk/${item.id}`} key={item.id} className="contents">
                <div
                  className="relative z-0 flex flex-col gap-2 items-start w-full rounded-xl p-4 transition cursor-pointer group overflow-hidden"
                >
                  {/* Hover Background Animation */}
                  <div className="absolute inset-0 bg-[#eed2e1]/50 scale-0 transition-transform duration-250 ease-out group-hover:scale-100 rounded-xl origin-center -z-10" />

                  <div className="relative aspect-square w-full rounded-[12px] overflow-hidden bg-gray-100">
                    <Image
                      src={item.foto || imgSiramTentangKami}
                      alt={item.nama}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 items-start w-full mt-2">
                    <p className="font-medium text-sm text-[#561530] w-full line-clamp-2 leading-tight">{item.nama}</p>
                    <div className="flex items-center justify-between w-full mt-1">
                      <p className="font-bold text-[#811844] text-lg">
                        <span className="text-xs font-normal">Rp</span> {formatCurrency(item.harga)}
                      </p>
                      <p className="text-[10px] text-[#561530]/80">Stok: {item.stok}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
