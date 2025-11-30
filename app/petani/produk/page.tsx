"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import Image from "next/image";

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
  status: "Tersedia" | "Stok Menipis" | "Habis";
}

export default function ProdukPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch products from Supabase
    // For now, using mock data
    const mockProducts: Product[] = [
      {
        id: "1",
        no: 1,
        foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
        namaProduk: "Benih Selada Merah",
        harga: "Rp7.000",
        stok: "100/1.000",
        status: "Tersedia"
      },
      {
        id: "2",
        no: 2,
        foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
        namaProduk: "Selada Oakloaf Merah",
        harga: "Rp32.000",
        stok: "50/1.000",
        status: "Stok Menipis"
      },
      {
        id: "3",
        no: 3,
        foto: "https://www.figma.com/api/mcp/asset/8c1614d4-747c-47ce-baf8-be35bd3ba6de",
        namaProduk: "Pupuk Organik",
        harga: "Rp97.000",
        stok: "0/1.000",
        status: "Habis"
      }
    ];
    
    setProducts(mockProducts);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tersedia":
        return "#106113";
      case "Stok Menipis":
        return "#ff9500";
      case "Habis":
        return "#ba0b0b";
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
      // TODO: Delete from Supabase
      // const { error } = await supabase
      //   .from("produk")
      //   .delete()
      //   .eq("id", deleteId);
      // if (error) throw error;

      // For now, just remove from state
      setProducts(products.filter(p => p.id !== deleteId));
      
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Gagal menghapus produk. Silakan coba lagi.");
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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-3 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-2xl text-black">Produk</h1>
                <p className="text-xs text-black mt-1">Produk</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Card Statistik */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="border border-[#9e1c60] rounded-[10px] p-4 bg-white">
              <p className="text-black mb-2" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Total Produk
              </p>
              <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.length}
              </p>
            </div>
            <div className="border border-[#9e1c60] rounded-[10px] p-4 bg-white">
              <p className="text-black mb-2" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Total Penjualan
              </p>
              <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                24
              </p>
            </div>
            <div className="border border-[#9e1c60] rounded-[10px] p-4 bg-white">
              <p className="text-black mb-2" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Produk Tersedia
              </p>
              <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.filter(p => p.status === "Tersedia").length}
              </p>
            </div>
            <div className="border border-[#9e1c60] rounded-[10px] p-4 bg-white">
              <p className="text-black mb-2" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Produk Habis
              </p>
              <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {products.filter(p => p.status === "Habis").length}
              </p>
            </div>
          </div>

          {/* Tambah Produk & Pesanan Buttons */}
          <div className="mb-4 flex gap-3">
            <button
              onClick={handleTambahProduk}
              className="px-4 py-2 bg-[#9e1c60] text-white rounded-[10px] hover:bg-[#7d1650] hover:shadow-md transition-all duration-200 flex items-center gap-2"
              style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}
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
              style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              Pesanan
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[10px] overflow-hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[#eed2e1] h-[40px]">
                    <th className="px-4 text-center font-bold text-[#181818] w-[62px]" style={{ fontSize: '12px' }}>
                      No
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[100px]" style={{ fontSize: '12px' }}>
                      Foto
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '12px' }}>
                      Nama Produk
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '12px' }}>
                      Harga
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[146px]" style={{ fontSize: '12px' }}>
                      Stok
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] w-[100px]" style={{ fontSize: '12px' }}>
                      Status
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[190px]" style={{ fontSize: '12px' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '10px' }}>
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
                        className="h-[50px] border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{product.no}</p>
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
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{product.namaProduk}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{product.harga}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{product.stok}</p>
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
                              <p className="font-bold text-white text-center whitespace-nowrap" style={{ fontSize: '10px' }}>
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
                              <Image
                                src={imgMaterialSymbolsDeleteRounded}
                                alt="Delete"
                                width={20}
                                height={20}
                                className="object-contain"
                                unoptimized
                              />
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
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={handleDeleteCancel}
          style={{ 
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div 
            className="bg-white rounded-[20px] p-8 max-w-sm w-full mx-4 shadow-2xl border-2 border-[#9e1c60]"
            onClick={(e) => e.stopPropagation()}
            style={{ 
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
              <p className="text-[#181818] text-base font-normal leading-relaxed" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Anda yakin ingin menghapus produk tersebut?
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-3 rounded-[10px] bg-[#ff9500] text-white hover:bg-[#e68500] active:bg-[#cc7500] transition-all duration-200 font-semibold"
                style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Tidak
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-[10px] bg-[#106113] text-white hover:bg-[#0d4f0f] active:bg-[#0a3d0c] transition-all duration-200 font-semibold"
                style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

