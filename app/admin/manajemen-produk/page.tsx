"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

const imgIconamoonEditLight = "https://www.figma.com/api/mcp/asset/e12eaffa-ec34-4b35-ac23-8b0719bfdc0d";
const imgMaterialSymbolsDeleteRounded = "https://www.figma.com/api/mcp/asset/2b8b2938-0c34-49e2-b4a7-762bbfa895f7";

interface Product {
  id: string;
  namaProduk: string;
  harga: string;
  stok: string;
  status: "Tersedia" | "Stok Menipis" | "Habis";
  foto: string;
  petani_id?: string;
  petani_name?: string;
  kategori?: string;
}

export default function ManajemenProdukPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [petaniFilter, setPetaniFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    namaProduk: "",
    harga: "",
    stok: "",
    status: "Tersedia" as "Tersedia" | "Stok Menipis" | "Habis",
    kategori: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, petaniFilter, statusFilter, products]);

  const loadProducts = async () => {
    try {
      // Try to fetch from products table
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          petani:users!products_petani_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        // Check if error is because table doesn't exist or empty error
        const errorMessage = error.message || '';
        const errorCode = error.code || '';
        const errorKeys = Object.keys(error).length;
        const errorString = JSON.stringify(error);
        
        // Check if error is empty or table not found
        const isEmptyError = errorKeys === 0 || errorString === '{}' || (!errorMessage && !errorCode);
        const isTableNotFound = errorCode === 'PGRST116' || 
                                errorMessage?.includes('does not exist') ||
                                errorMessage?.includes('relation') ||
                                errorMessage?.includes('not found') ||
                                isEmptyError;
        
        if (isTableNotFound) {
          // Table doesn't exist yet, use mock data silently
          setProducts([
            {
              id: "1",
              namaProduk: "Benih Selada Merah",
              harga: "Rp7.000",
              stok: "100/1.000",
              status: "Tersedia",
              foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
              petani_name: "Petani Satu",
              kategori: "Benih",
            },
            {
              id: "2",
              namaProduk: "Selada Oakloaf Merah",
              harga: "Rp32.000",
              stok: "50/1.000",
              status: "Stok Menipis",
              foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
              petani_name: "Petani Dua",
              kategori: "Tanaman",
            },
            {
              id: "3",
              namaProduk: "Pupuk Organik",
              harga: "Rp97.000",
              stok: "0/1.000",
              status: "Habis",
              foto: "https://www.figma.com/api/mcp/asset/8c1614d4-747c-47ce-baf8-be35bd3ba6de",
              petani_name: "Petani Satu",
              kategori: "Pupuk",
            },
          ]);
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (data) {
        const mappedProducts = data.map((product: any) => ({
          id: product.id,
          namaProduk: product.name || product.nama_produk || "",
          harga: `Rp${product.price || 0}`,
          stok: `${product.stock || 0}/${product.max_stock || 1000}`,
          status: product.status === "habis" ? "Habis" : product.status === "stok_menipis" ? "Stok Menipis" : "Tersedia",
          foto: product.image || product.foto || "",
          petani_id: product.petani_id,
          petani_name: product.petani?.full_name || product.petani?.email || "Unknown",
          kategori: product.category || product.kategori || "",
        }));
        setProducts(mappedProducts);
      }
    } catch (error: any) {
      // Check if error is because table doesn't exist or empty error object
      const errorMessage = error?.message || '';
      const errorCode = error?.code || '';
      const errorKeys = error ? Object.keys(error).length : 0;
      const errorString = JSON.stringify(error || {});
      
      // Check if error is empty or table not found
      const isEmptyError = errorKeys === 0 || errorString === '{}' || (!errorMessage && !errorCode);
      const isTableNotFound = errorCode === 'PGRST116' || 
                              errorMessage?.includes('does not exist') ||
                              errorMessage?.includes('relation') ||
                              errorMessage?.includes('not found') ||
                              isEmptyError;
      
      // Only log error if it's a real error with meaningful message
      if (!isTableNotFound && errorMessage && errorKeys > 0) {
        console.error("Error loading products:", error);
      }
      
      // Mock data
      setProducts([
        {
          id: "1",
          namaProduk: "Benih Selada Merah",
          harga: "Rp7.000",
          stok: "100/1.000",
          status: "Tersedia",
          foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
          petani_name: "Petani Satu",
          kategori: "Benih",
        },
        {
          id: "2",
          namaProduk: "Selada Oakloaf Merah",
          harga: "Rp32.000",
          stok: "50/1.000",
          status: "Stok Menipis",
          foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
          petani_name: "Petani Dua",
          kategori: "Tanaman",
        },
        {
          id: "3",
          namaProduk: "Pupuk Organik",
          harga: "Rp97.000",
          stok: "0/1.000",
          status: "Habis",
          foto: "https://www.figma.com/api/mcp/asset/8c1614d4-747c-47ce-baf8-be35bd3ba6de",
          petani_name: "Petani Satu",
          kategori: "Pupuk",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.namaProduk.toLowerCase().includes(query) ||
          (product.petani_name && product.petani_name.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      namaProduk: product.namaProduk,
      harga: product.harga.replace("Rp", "").replace(/\./g, ""),
      stok: product.stok.split("/")[0],
      status: product.status,
      kategori: product.kategori || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Gagal menghapus produk. Silakan coba lagi.");
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: editFormData.namaProduk,
          price: parseInt(editFormData.harga),
          stock: parseInt(editFormData.stok),
          status: editFormData.status.toLowerCase().replace(" ", "_"),
          category: editFormData.kategori,
        })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, ...editFormData, harga: `Rp${editFormData.harga}` }
          : p
      ));
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Gagal mengupdate produk. Silakan coba lagi.");
    }
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-2xl text-black">Manajemen Produk</h1>
                <p className="text-xs text-black mt-1">Kelola semua produk dari semua petani</p>
              </div>
              <div className="flex-shrink-0">
                <AdminHeader />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari produk (nama, petani)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-[#9e1c60] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-[#9e1c60] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
              >
                <option value="all">Semua Status</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Stok Menipis">Stok Menipis</option>
                <option value="Habis">Habis</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="border border-[#9e1c60] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#9e1c60] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold">Foto</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Nama Produk</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Petani</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Stok</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        Tidak ada produk ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 relative rounded overflow-hidden">
                            <Image
                              src={product.foto}
                              alt={product.namaProduk}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-black">{product.namaProduk}</td>
                        <td className="px-4 py-3 text-sm text-black">{product.petani_name || "-"}</td>
                        <td className="px-4 py-3 text-sm text-black">{product.harga}</td>
                        <td className="px-4 py-3 text-sm text-black">{product.stok}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: getStatusColor(product.status) }}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(product)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                              title="Detail"
                            >
                              <span className="text-xs text-[#9e1c60]">Detail</span>
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                              title="Edit"
                            >
                              <Image
                                src={imgIconamoonEditLight}
                                alt="Edit"
                                width={16}
                                height={16}
                                className="object-contain"
                                style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(300deg) brightness(92%) contrast(92%)' }}
                                unoptimized
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                              title="Hapus"
                            >
                              <Image
                                src={imgMaterialSymbolsDeleteRounded}
                                alt="Delete"
                                width={16}
                                height={16}
                                className="object-contain"
                                style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(300deg) brightness(92%) contrast(92%)' }}
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

      {/* Delete Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Hapus Produk</h3>
            <p className="text-sm text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus produk <strong>{selectedProduct.namaProduk}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Edit Produk</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={editFormData.namaProduk}
                  onChange={(e) => setEditFormData({ ...editFormData, namaProduk: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Harga</label>
                <input
                  type="number"
                  value={editFormData.harga}
                  onChange={(e) => setEditFormData({ ...editFormData, harga: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Stok</label>
                <input
                  type="number"
                  value={editFormData.stok}
                  onChange={(e) => setEditFormData({ ...editFormData, stok: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as "Tersedia" | "Stok Menipis" | "Habis" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Stok Menipis">Stok Menipis</option>
                  <option value="Habis">Habis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Kategori</label>
                <input
                  type="text"
                  value={editFormData.kategori}
                  onChange={(e) => setEditFormData({ ...editFormData, kategori: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Detail Produk</h3>
            <div className="space-y-3 mb-4">
              <div className="w-full h-48 relative rounded overflow-hidden mb-4">
                <Image
                  src={selectedProduct.foto}
                  alt={selectedProduct.namaProduk}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Nama Produk</p>
                <p className="text-sm font-bold text-black">{selectedProduct.namaProduk}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Petani</p>
                <p className="text-sm font-bold text-black">{selectedProduct.petani_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Harga</p>
                <p className="text-sm font-bold text-black">{selectedProduct.harga}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Stok</p>
                <p className="text-sm font-bold text-black">{selectedProduct.stok}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-bold text-black">{selectedProduct.status}</p>
              </div>
              {selectedProduct.kategori && (
                <div>
                  <p className="text-xs text-gray-500">Kategori</p>
                  <p className="text-sm font-bold text-black">{selectedProduct.kategori}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

