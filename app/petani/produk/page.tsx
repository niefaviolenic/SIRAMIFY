"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import Toast from "@/app/components/Toast";

const imgIconamoonEditLight = "https://www.figma.com/api/mcp/asset/e12eaffa-ec34-4b35-ac23-8b0719bfdc0d";
const imgMaterialSymbolsDeleteRounded = "https://www.figma.com/api/mcp/asset/2b8b2938-0c34-49e2-b4a7-762bbfa895f7";
const imgTypcnPlus = "https://www.figma.com/api/mcp/asset/30828167-db43-4a98-a913-e4c3caf6eeb3";

interface Product {
  id: string;
  no: number;
  foto: string;
  namaProduk: string;
  harga: string;
  stok: string;
  jumlah_terjual: number;
  status: "Tersedia" | "Stok Menipis" | "Habis";
}

export default function ProdukPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User error:", userError);
        router.push("/masuk");
        return;
      }

      console.log("Loading products for user:", user.id);

      // Fetch products dari Supabase
      const { data, error } = await supabase
        .from("produk")
        .select("*")
        .eq("petani_id", user.id)
        .order("created_at", { ascending: false });

      console.log("Products data:", data);
      console.log("Products error:", error);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Map data ke format yang dibutuhkan
      const mappedProducts: Product[] = (data || []).map((item: any, index: number) => {
        const stock = item.stok || 0;
        const maxStock = item.stok_max || 1000;

        // Hitung status berdasarkan stok
        let status: "Tersedia" | "Stok Menipis" | "Habis" = "Tersedia";
        if (stock === 0) {
          status = "Habis";
        } else if (stock <= 100) {
          status = "Stok Menipis";
        }

        // Format harga ke "RpX.XXX"
        const hargaFormatted = `Rp${(item.harga || 0).toLocaleString("id-ID")}`;

        return {
          id: item.id,
          no: index + 1,
          foto: item.foto || "https://via.placeholder.com/100x60",
          namaProduk: item.nama,
          harga: hargaFormatted,
          stok: `${stock}/${maxStock.toLocaleString("id-ID")}`,
          jumlah_terjual: item.jumlah_terjual || 0,
          status: status,
        };
      });

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error("Error loading products:", error);
      setToast({ message: "Gagal memuat produk. Silakan coba lagi.", type: "error" });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tersedia":
        return "#106113";
      case "Stok Menipis":
        return "#ff9500";
      case "Habis":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/petani/produk/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("produk")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      // Reload products
      loadProducts();
      setShowDeleteModal(false);
      setDeleteId(null);
      setToast({ message: "Produk berhasil dihapus!", type: "success" });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      setToast({ message: "Gagal menghapus produk. Silakan coba lagi.", type: "error" });
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleTambahProduk = () => {
    router.push("/petani/produk/tambah");
  };

  return (
    <div className="min-h-screen bg-[#fef7f5] flex">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen bg-white" style={{ minHeight: '100vh', width: 'calc(100% - 180px)', paddingBottom: '40px' }}>
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-3xl text-black">Produk</h1>
                <p className="text-sm text-black mt-1">Produk</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Card Statistik */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Total Produk
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.length}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Total Penjualan
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.reduce((acc, curr) => acc + (curr.jumlah_terjual || 0), 0)}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Produk Tersedia
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.filter(p => p.status === "Tersedia").length}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Stok Menipis
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.filter(p => p.status === "Stok Menipis").length}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Produk Habis
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.filter(p => p.status === "Habis").length}
              </p>
            </div>
          </div>

          {/* Tambah Produk & Pesanan Buttons */}
          <div className="mb-4 flex gap-3">
            <button
              onClick={handleTambahProduk}
              className="px-4 py-2 bg-[#9e1c60] text-white rounded-[10px] hover:bg-[#7d1650] hover:shadow-md transition-all duration-200 flex items-center gap-2"
              style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ strokeWidth: '1.5' }}
              >
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Tambah Produk
            </button>
            <button
              onClick={() => router.push("/petani/produk/pesanan")}
              className="px-4 py-2 bg-[#9e1c60] text-white rounded-[10px] hover:bg-[#7d1650] hover:shadow-md transition-all duration-200 flex items-center gap-2"
              style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 2H4L4.5 6M4.5 6L5.5 12H12.5L13.5 6H4.5ZM4.5 6H14M6 13.5C6 13.7761 5.77614 14 5.5 14C5.22386 14 5 13.7761 5 13.5C5 13.2239 5.22386 13 5.5 13C5.77614 13 6 13.2239 6 13.5ZM12 13.5C12 13.7761 11.7761 14 11.5 14C11.2239 14 11 13.7761 11 13.5C11 13.2239 11.2239 13 11.5 13C11.7761 13 12 13.2239 12 13.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Pesanan
            </button>
          </div>

          {/* Table */}
          <div className="rounded-[15px] overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[#eed2e1] h-[40px]">
                    <th className="px-4 text-center font-bold text-[#181818] w-[62px]" style={{ fontSize: '14px' }}>
                      No
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[100px]" style={{ fontSize: '14px' }}>
                      Foto
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '14px' }}>
                      Nama Produk
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '14px' }}>
                      Harga
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '14px' }}>
                      Stok
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] w-[100px]" style={{ fontSize: '14px' }}>
                      Status
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[190px]" style={{ fontSize: '14px' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)' }}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '12px' }}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '12px' }}>
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="h-[50px] border-b border-[#9e1c60]/15 last:border-b-0 transition"
                        style={{
                          background: 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to bottom, #faf5f8 0%, #f5e8f0 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)';
                        }}
                      >
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{product.no}</p>
                        </td>
                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-[100px] h-[60px] flex items-center justify-center">
                              <Image
                                src={product.foto}
                                alt={product.namaProduk}
                                width={100}
                                height={60}
                                className="max-w-full max-h-full object-contain"
                                unoptimized
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{product.namaProduk}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{product.harga}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{product.stok}</p>
                        </td>
                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div
                              className="rounded-[10px] px-2 py-1 h-[24px] flex items-center justify-center"
                              style={{
                                backgroundColor: getStatusColor(product.status),
                                width: '100px',
                                minWidth: '100px',
                                maxWidth: '100px'
                              }}
                            >
                              <p className="font-bold text-white text-center whitespace-nowrap" style={{ fontSize: '12px' }}>
                                {product.status}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4">
                          <div className="flex items-center justify-center gap-[7px]">
                            <button
                              onClick={() => handleEdit(product.id)}
                              className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                              title="Edit"
                            >
                              <Image
                                src={imgIconamoonEditLight}
                                alt="Edit"
                                width={20}
                                height={20}
                                className="object-contain"
                                unoptimized
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
                              className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                              title="Delete"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#dc2626" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 py-8"
          onClick={handleDeleteCancel}
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <div
            className="rounded-[15px] p-8 max-w-sm w-full mx-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-[#9e1c60] flex items-center justify-center bg-white">
                <span className="text-4xl text-[#9e1c60] font-bold leading-none">!</span>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-[#181818] text-lg font-normal leading-relaxed" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Anda yakin ingin menghapus produk tersebut?
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-3 rounded-[10px] bg-[#ff9500] text-white hover:bg-[#e68500] transition font-semibold"
                style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-[10px] bg-[#dc2626] text-white hover:bg-[#b91c1c] transition font-semibold"
                style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

