"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/utils/supabaseClient";
import ConfirmationModal from "../components/ConfirmationModal";
import Toast from "../components/Toast";

interface CartItem {
  id: string; // keranjang id
  quantity: number;
  selected: boolean;
  produk: {
    id: string;
    nama: string;
    harga: number;
    foto: string | null;
    stok: number;
  };
}

import { Suspense } from "react";

function KeranjangContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/masuk');
        return;
      }

      const { data, error } = await supabase
        .from('keranjang')
        .select(`
          id,
          quantity,
          produk:produk_id (
            id,
            nama,
            harga,
            foto,
            stok
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const selectedParam = searchParams.get('selected');

        // Transform data and add selected property
        const formattedItems = data.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          selected: selectedParam ? item.produk.id === selectedParam : true, // Select specific if param exists, else all
          produk: item.produk
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle item selection
  const toggleSelection = (id: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Toggle all items selection
  const toggleAllSelection = () => {
    const allSelected = cartItems.every((item) => item.selected);
    setCartItems((items) =>
      items.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  // Update quantity
  const updateQuantity = async (id: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;

    // Optimistic update
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const { error } = await supabase
        .from('keranjang')
        .update({ quantity: newQuantity, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revert on error (optional, but good practice)
      fetchCartItems();
    }
  };

  // Remove item handler
  const handleRemoveClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmRemoveItem = async () => {
    if (!deleteId) return;

    // Optimistic update
    setCartItems((items) => items.filter((item) => item.id !== deleteId));
    setShowDeleteModal(false);

    try {
      const { error } = await supabase
        .from('keranjang')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      setToast({ message: "Item berhasil dihapus", type: "success" });
    } catch (error) {
      console.error("Error removing item:", error);
      setToast({ message: "Gagal menghapus item", type: "error" });
      fetchCartItems();
    } finally {
      setDeleteId(null);
    }
  };

  // Calculate total
  const totalItems = cartItems.filter((item) => item.selected).reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.filter((item) => item.selected).reduce((acc, item) => acc + (item.produk.harga * item.quantity), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white relative w-full min-h-screen overflow-x-hidden font-sans flex flex-col">
        <Navbar />
        <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[1200px] mx-auto w-full flex-1 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1 flex flex-col gap-6">
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              {[1, 2].map((i) => (
                <div key={i} className="h-32 w-full bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="w-full lg:w-[350px] shrink-0">
              <div className="h-64 w-full bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-white relative w-full min-h-screen overflow-x-hidden font-sans flex flex-col">
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Hapus Item"
        message="Apakah Anda yakin ingin menghapus item ini?"
        onConfirm={confirmRemoveItem}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Hapus"
        isDanger={true}
      />

      <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[1200px] mx-auto w-full flex-1">
        <h1 className="font-bold text-[#561530] text-2xl md:text-3xl mb-8">Keranjang Saya</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Cart Items */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Header / Select All */}
            <div className="flex items-center gap-4 pb-4 border-b border-[#E0E0E0]">
              <input
                type="checkbox"
                checked={cartItems.length > 0 && cartItems.every((item) => item.selected)}
                onChange={toggleAllSelection}
                className="w-5 h-5 accent-[#9e1c60] cursor-pointer"
              />
              <span className="text-[#561530] font-medium text-sm md:text-base cursor-pointer" onClick={toggleAllSelection}>Pilih Semua</span>
            </div>

            {/* Items List */}
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center p-4 bg-white rounded-xl border border-[#E0E0E0] shadow-sm">
                  {/* Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelection(item.id)}
                      className="w-5 h-5 accent-[#9e1c60] cursor-pointer"
                    />
                  </div>

                  {/* Image */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.produk.foto || "https://ik.imagekit.io/et2ltjxzhq/Siramify/siram_tentang_kami.webp?updatedAt=1764650943034"}
                      alt={item.produk.nama}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <h3 className="font-bold text-[#561530] text-base md:text-lg">{item.produk.nama}</h3>
                    <p className="font-bold text-[#9e1c60] text-sm md:text-base">{formatCurrency(item.produk.harga)}</p>
                    <p className="text-xs text-[#6C727C]">Stok: {item.produk.stok}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-2 md:mt-0">
                    {/* Quantity Control */}
                    <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.produk.stok)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-[#561530] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center text-[#561530] font-medium text-sm border-x border-[#E0E0E0]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.produk.stok)}
                        disabled={item.quantity >= item.produk.stok}
                        className="w-8 h-8 flex items-center justify-center text-[#561530] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveClick(item.id)}
                      className="text-[#9e1c60] hover:text-[#811844] transition p-2 cursor-pointer"
                      title="Hapus item"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 6V4C8 3.46957 8.21071 3 8.58579 2.62513C8.96086 2.25026 9.46957 2.04061 10 2.04061H14C14.5304 2.04061 15.0391 2.25026 15.4142 2.62513C15.7893 3 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21 18.4142 21.3749C18.0391 21.7497 17.5304 21.9594 17 21.9594H7C6.46957 21.9594 5.96086 21.7497 5.58579 21.3749C5.21071 21 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#E0E0E0] rounded-xl">
                <p className="text-[#561530] font-medium text-lg mb-2">Keranjang Anda kosong</p>
                <p className="text-[#6C727C] text-sm mb-6">Yuk, mulai belanja produk-produk berkualitas!</p>
                <Link href="/produk" className="px-6 py-3 bg-[#9e1c60] text-white rounded-full font-bold text-sm hover:bg-[#811844] transition shadow-md cursor-pointer">
                  Belanja Sekarang
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm sticky top-32">
              <h2 className="font-bold text-[#561530] text-lg mb-6">Ringkasan Belanja</h2>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center text-[#561530]">
                  <span className="text-sm">Total Harga ({totalItems} barang)</span>
                  <span className="font-bold">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="border-t border-[#E0E0E0] pt-4 mb-6">
                <div className="flex justify-between items-center text-[#561530]">
                  <span className="font-bold text-lg">Total Tagihan</span>
                  <span className="font-bold text-xl text-[#9e1c60]">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const selectedIds = cartItems.filter(item => item.selected).map(item => item.id);
                  router.push(`/pembayaran?ids=${selectedIds.join(',')}`);
                }}
                className="w-full py-4 bg-[#9e1c60] text-white rounded-xl font-bold text-base hover:bg-[#811844] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={totalItems === 0}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function KeranjangPage() {
  return (
    <Suspense fallback={
      <div className="bg-white relative w-full min-h-screen overflow-x-hidden font-sans flex flex-col">
        <Navbar />
        <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[1200px] mx-auto w-full flex-1 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1 flex flex-col gap-6">
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              {[1, 2].map((i) => (
                <div key={i} className="h-32 w-full bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="w-full lg:w-[350px] shrink-0">
              <div className="h-64 w-full bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <KeranjangContent />
    </Suspense>
  );
}
