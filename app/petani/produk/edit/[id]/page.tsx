"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import Image from "next/image";

// Mock data - akan diganti dengan fetch dari Supabase
const mockProducts: { [key: string]: any } = {
  "1": {
    id: "1",
    foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
    namaProduk: "Benih Selada Merah",
    harga: "7.000",
    stok: 100,
    stokMax: 1000,
    deskripsi: "Benih selada merah berkualitas tinggi dengan daya tumbuh optimal. Cocok ditanam di pot maupun lahan, menghasilkan daun berwarna merah segar, renyah, dan kaya nutrisi. Ideal untuk salad, garnish, atau hidangan sehat sehari-hari."
  },
  "2": {
    id: "2",
    foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
    namaProduk: "Selada Oakloaf Merah",
    harga: "32.000",
    stok: 50,
    stokMax: 1000,
    deskripsi: "Selada oakloaf merah dengan kualitas premium."
  },
  "3": {
    id: "3",
    foto: "https://www.figma.com/api/mcp/asset/8c1614d4-747c-47ce-baf8-be35bd3ba6de",
    namaProduk: "Pupuk Organik",
    harga: "97.000",
    stok: 0,
    stokMax: 1000,
    deskripsi: "Pupuk organik berkualitas tinggi untuk pertumbuhan tanaman optimal."
  }
};

export default function EditProdukPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    stok: 0,
    stokMax: 1000,
    deskripsi: ""
  });
  const [productImage, setProductImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      // TODO: Fetch from Supabase
      // For now, using mock data
      const product = mockProducts[id];
      
      if (!product) {
        alert("Produk tidak ditemukan.");
        router.push("/petani/produk");
        return;
      }

      // Extract harga number from "Rp7.000" or "7.000"
      let hargaNumber = product.harga.replace("Rp", "").replace(".", "").replace(",", "");
      
      setFormData({
        nama: product.namaProduk || "",
        harga: hargaNumber || "",
        stok: product.stok || 0,
        stokMax: product.stokMax || 1000,
        deskripsi: product.deskripsi || ""
      });
      setProductImage(product.foto || "");
    } catch (error) {
      console.error("Error loading product:", error);
      alert("Gagal memuat data produk. Silakan coba lagi.");
      router.push("/petani/produk");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Update in Supabase
      // const { error } = await supabase
      //   .from("produk")
      //   .update({
      //     nama: formData.nama,
      //     harga: formData.harga,
      //     stok: formData.stok,
      //     stokMax: formData.stokMax,
      //     deskripsi: formData.deskripsi
      //   })
      //   .eq("id", id);
      // if (error) throw error;

      alert("Produk berhasil diperbarui!");
      router.push("/petani/produk");
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert("Gagal memperbarui produk. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/petani/produk");
  };

  const handleStokIncrement = () => {
    if (formData.stok < formData.stokMax) {
      setFormData({ ...formData, stok: formData.stok + 1 });
    }
  };

  const handleStokDecrement = () => {
    if (formData.stok > 0) {
      setFormData({ ...formData, stok: formData.stok - 1 });
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-2xl text-black">Produk</h1>
                <p className="text-xs text-black mt-1">Produk/Edit Produk</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Form */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                {/* Row 1: Image and Form Fields (Nama, Harga, Stok) */}
                <div className="flex gap-8">
                  {/* Left Side - Product Image (Smaller) */}
                  <div className="flex-shrink-0">
                    <div className="relative w-[250px] h-[300px] bg-white rounded-[10px] flex items-center justify-center overflow-hidden border border-gray-200">
                      {/* Decorative green frame elements at top and bottom */}
                      <div className="absolute top-0 left-0 right-0 h-8 bg-[#106113] opacity-30"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#106113] opacity-30"></div>
                      
                      {productImage && (
                        <div className="relative w-full h-full flex items-center justify-center p-4 z-10">
                          <Image
                            src={productImage}
                            alt={formData.nama || "Produk"}
                            width={220}
                            height={280}
                            className="max-w-full max-h-full object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Form Fields (Nama, Harga, Stok) */}
                  <div className="flex-1 flex flex-col gap-6">
                    {/* Nama */}
                    <div className="flex flex-col gap-[11px]">
                      <label className="font-bold text-black" style={{ fontSize: '12px' }}>
                        Nama
                      </label>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Nama produk"
                        className={`bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] ${formData.nama ? 'text-black' : 'text-black/50'}`}
                        style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px' }}
                        required
                      />
                    </div>

                    {/* Harga */}
                    <div className="flex flex-col gap-[11px]">
                      <label className="font-bold text-black" style={{ fontSize: '12px' }}>
                        Harga (Rp)
                      </label>
                      <input
                        type="text"
                        value={formData.harga}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, harga: value });
                        }}
                        placeholder="Harga"
                        className={`bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] ${formData.harga ? 'text-black' : 'text-black/50'}`}
                        style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px' }}
                        required
                      />
                    </div>

                    {/* Stok */}
                    <div className="flex flex-col gap-[11px]">
                      <label className="font-bold text-black" style={{ fontSize: '12px' }}>
                        Stok
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleStokDecrement}
                          disabled={formData.stok <= 0}
                          className="w-[35px] h-[35px] bg-[#9e1c60] text-white rounded-[5px] flex items-center justify-center hover:bg-[#7d1650] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '16px', fontWeight: 'bold' }}
                        >
                          -
                        </button>
                        <div className="flex-1 bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] flex items-center justify-center">
                          <span className="text-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px' }}>
                            {formData.stok}/{formData.stokMax}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleStokIncrement}
                          disabled={formData.stok >= formData.stokMax}
                          className="w-[35px] h-[35px] bg-[#9e1c60] text-white rounded-[5px] flex items-center justify-center hover:bg-[#7d1650] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '16px', fontWeight: 'bold' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Deskripsi (Full Width) */}
                <div className="flex flex-col gap-[11px]">
                  <label className="font-bold text-black" style={{ fontSize: '12px' }}>
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi produk"
                    rows={8}
                    className={`bg-[#f5f5f5] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] resize-none ${formData.deskripsi ? 'text-black' : 'text-black/50'}`}
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px' }}
                    required
                  />
                </div>

                {/* Row 3: Buttons (Full Width) */}
                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#27a73d] h-[35px] rounded-[5px] text-white font-bold hover:bg-[#1f8a31] transition-colors disabled:opacity-50 flex items-center justify-center text-center"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-[#e09028] h-[35px] rounded-[5px] text-white font-bold hover:bg-[#c77a1f] transition-colors flex items-center justify-center text-center"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}
                  >
                    Kembali
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

