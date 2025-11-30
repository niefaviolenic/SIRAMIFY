"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";

export default function TambahProdukPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    stok: 1,
    stokMax: 1000,
    deskripsi: ""
  });
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Save to Supabase
      // const { error } = await supabase
      //   .from("produk")
      //   .insert({
      //     nama: formData.nama,
      //     harga: formData.harga,
      //     stok: formData.stok,
      //     stokMax: formData.stokMax,
      //     deskripsi: formData.deskripsi,
      //     foto: productImage
      //   });
      // if (error) throw error;

      alert("Produk berhasil ditambahkan!");
      router.push("/petani/produk");
    } catch (error: any) {
      console.error("Error adding product:", error);
      alert("Gagal menambahkan produk. Silakan coba lagi.");
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
    if (formData.stok > 1) {
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
                <p className="text-xs text-black mt-1">Produk/Tambah Produk</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Row 1: Image Upload and Form Fields (Nama, Harga, Stok) */}
              <div className="flex gap-8">
                {/* Left Side - Image Upload Area */}
                <div className="flex-shrink-0">
                  <div className="relative w-[250px] h-[300px] border-2 border-dashed border-gray-300 rounded-[10px] flex flex-col items-center justify-center bg-[#f5f5f5] cursor-pointer hover:border-[#9e1c60] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {productImage ? (
                      <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                          src={productImage}
                          alt="Product preview"
                          className="max-w-full max-h-full object-contain rounded-[10px]"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 10V30M10 20H30"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-black text-center" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px' }}>
                          Tambahkan Foto
                        </p>
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
                      placeholder="Masukkan Nama Produk"
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
                      placeholder="Masukkan Harga Produk"
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
                        disabled={formData.stok <= 1}
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
                  placeholder="Masukkan Deskripsi Produk"
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
        </div>
      </div>
    </div>
  );
}

