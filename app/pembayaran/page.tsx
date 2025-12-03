"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/utils/supabaseClient";
import Toast from "../components/Toast";

interface CartItem {
  id: string;
  quantity: number;
  produk: {
    id: string;
    nama: string;
    harga: number;
    petani_id: string;
  };
}

export default function PembayaranPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhone: "",
    address: ""
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/masuk');
        return;
      }

      const idsParam = searchParams.get('ids');
      let query = supabase
        .from('keranjang')
        .select(`
          id,
          quantity,
          produk:produk_id (
            id,
            nama,
            harga,
            petani_id
          )
        `)
        .eq('user_id', user.id);

      if (idsParam) {
        const ids = idsParam.split(',');
        query = query.in('id', ids);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedItems = data.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          produk: Array.isArray(item.produk) ? item.produk[0] : item.produk
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setToast({ message: "Gagal memuat keranjang", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.produk.harga * item.quantity), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "receiverPhone") {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePayNow = () => {
    if (!formData.receiverName || !formData.receiverPhone || !formData.address) {
      setToast({ message: "Mohon lengkapi data pengiriman", type: "error" });
      return;
    }
    setShowQRIS(true);
  };

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 1. Create Transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: 'selesai', // Prototype: langsung sukses
          payment_method: 'qris'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 2. Create Transaction Items
      const transactionItems = cartItems.map(item => ({
        transaction_id: transactionData.id,
        produk_id: item.produk.id,
        petani_id: item.produk.petani_id,
        quantity: item.quantity,
        price: item.produk.harga
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // 3. Update Product Stock and Sold Count
      for (const item of cartItems) {
        // Fetch current product data first to ensure we have latest stock
        const { data: productData, error: fetchError } = await supabase
          .from('produk')
          .select('stok, jumlah_terjual')
          .eq('id', item.produk.id)
          .single();

        if (fetchError) {
          console.error(`Error fetching product ${item.produk.id}:`, fetchError);
          continue; // Skip update if fetch fails, but transaction is already created
        }

        const currentStock = parseInt(productData.stok);
        const currentSold = productData.jumlah_terjual || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        const newSold = currentSold + item.quantity;

        const { error: updateError } = await supabase
          .from('produk')
          .update({
            stok: newStock.toString(), // Assuming stok is string based on previous files
            jumlah_terjual: newSold
          })
          .eq('id', item.produk.id);

        if (updateError) {
          console.error(`Error updating stock for product ${item.produk.id}:`, updateError);
        }
      }

      // 4. Clear Paid Items from Cart
      const itemIds = cartItems.map(item => item.id);
      const { error: clearCartError } = await supabase
        .from('keranjang')
        .delete()
        .in('id', itemIds);

      if (clearCartError) throw clearCartError;

      setToast({ message: "Pembayaran berhasil!", type: "success" });

      // Redirect after short delay
      setTimeout(() => {
        router.push('/pesanan');
      }, 2000);

    } catch (error: any) {
      console.error("Error processing payment:", error);
      setToast({ message: "Gagal memproses pembayaran: " + error.message, type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[800px] mx-auto w-full flex-1 animate-pulse">
          {/* Title Skeleton */}
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-8"></div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E0E0E0] shadow-sm">
            {/* Shipping Form Skeleton */}
            <div className="mb-8">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Skeleton */}
            <div className="mb-8">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-7 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Button Skeleton */}
            <div className="h-14 w-full bg-gray-200 rounded-xl"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[800px] mx-auto w-full flex-1">
        <h1 className="font-bold text-[#561530] text-2xl md:text-3xl mb-8 text-center">Pembayaran</h1>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E0E0E0] shadow-sm">

          {!showQRIS ? (
            <>
              {/* Shipping Form */}
              <div className="mb-8">
                <h2 className="font-bold text-[#561530] text-lg mb-4">Informasi Pengiriman</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#561530] mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      name="receiverName"
                      value={formData.receiverName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#9e1c60] transition"
                      placeholder="Masukkan nama penerima"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#561530] mb-1">Nomor HP</label>
                    <input
                      type="tel"
                      name="receiverPhone"
                      value={formData.receiverPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#9e1c60] transition"
                      placeholder="Masukkan nomor HP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#561530] mb-1">Alamat Lengkap</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#9e1c60] transition resize-none"
                      placeholder="Masukkan alamat lengkap pengiriman"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-8">
                <h2 className="font-bold text-[#561530] text-lg mb-4">Ringkasan Pesanan</h2>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm md:text-base">
                      <span className="text-[#561530]">{item.produk.nama} x {item.quantity}</span>
                      <span className="font-bold text-[#561530]">{formatCurrency(item.produk.harga * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-[#E0E0E0] pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-[#561530]">Total Bayar</span>
                    <span className="font-bold text-xl text-[#9e1c60]">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={cartItems.length === 0}
                className="w-full py-4 bg-[#9e1c60] text-white rounded-xl font-bold text-lg hover:bg-[#811844] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Bayar Sekarang
              </button>
            </>
          ) : (
            <>
              {/* QRIS Section */}
              <div className="mb-8 flex flex-col items-center animate-fade-in">
                <h2 className="font-bold text-[#561530] text-lg mb-4">Scan QRIS untuk Membayar</h2>
                <div className="w-64 h-64 bg-white rounded-xl flex items-center justify-center border border-[#E0E0E0] relative overflow-hidden mb-4 p-4 shadow-sm">
                  <Image
                    src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SIRAMIFY-PAYMENT-PROTOTYPE"
                    alt="QRIS Barcode"
                    width={250}
                    height={250}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-center text-sm text-[#561530] mb-8">
                  Total Tagihan: <span className="font-bold">{formatCurrency(totalPrice)}</span>
                </p>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#9e1c60] text-white rounded-xl font-bold text-lg hover:bg-[#811844] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
                </button>

                <button
                  onClick={() => setShowQRIS(false)}
                  disabled={isProcessing}
                  className="mt-4 text-[#6C727C] hover:text-[#9e1c60] text-sm underline cursor-pointer"
                >
                  Kembali ke Form
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
