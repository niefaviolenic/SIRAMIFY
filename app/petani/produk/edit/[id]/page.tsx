"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

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
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/masuk");
        return;
      }

      // Fetch product dari Supabase
      const { data, error } = await supabase
        .from("produk")
        .select("*")
        .eq("id", id)
        .eq("petani_id", user.id)
        .single();

      if (error) throw error;

      if (!data) {
        setErrorMessage("Produk tidak ditemukan.");
        setTimeout(() => {
          router.push("/petani/produk");
        }, 2000);
        return;
      }

      setFormData({
        nama: data.nama || "",
        harga: data.harga.toString() || "",
        stok: data.stok || 0,
        stokMax: data.stok_max || 1000,
        deskripsi: data.deskripsi || ""
      });
      setProductImage(data.foto || "");
    } catch (error: any) {
      console.error("Error loading product:", error);
      setErrorMessage("Gagal memuat data produk. Silakan coba lagi.");
      setTimeout(() => {
        router.push("/petani/produk");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImageToStorage = async (file: File, userId: string): Promise<string | null> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `produk/${fileName}`;

      // Upload file ke Supabase Storage
      const { data, error } = await supabase.storage
        .from('produk')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading image:", error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('produk')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image to storage:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/masuk");
        return;
      }

      // Upload foto baru jika ada
      let fotoUrl = productImage; // Default: gunakan foto yang sudah ada
      
      if (productImageFile) {
        try {
          fotoUrl = await uploadImageToStorage(productImageFile, user.id);
        } catch (error: any) {
          console.error("Error uploading image:", error);
          setErrorMessage("Gagal mengupload foto baru. Foto lama akan tetap digunakan.");
          setTimeout(() => setErrorMessage(""), 5000);
          // Lanjutkan dengan foto lama jika upload gagal
        }
      }

      // Update di database
      const { error } = await supabase
        .from("produk")
        .update({
          nama: formData.nama,
          harga: parseInt(formData.harga.replace(/\D/g, '') || '0'),
          stok: formData.stok,
          stok_max: formData.stokMax,
          deskripsi: formData.deskripsi,
          foto: fotoUrl
        })
        .eq("id", id)
        .eq("petani_id", user.id); // Pastikan hanya pemilik yang bisa update

      if (error) throw error;

      setSuccessMessage("Produk berhasil diperbarui! Mengarahkan ke halaman produk...");
      setTimeout(() => {
        router.push("/petani/produk");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating product:", error);
      setErrorMessage("Gagal memperbarui produk. Silakan coba lagi.");
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
    <div className="min-h-screen bg-[#fef7f5] flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-3xl text-black">Produk</h1>
                <p className="text-sm text-black mt-1">Produk/Edit Produk</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-[10px] text-sm">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-[10px] text-sm">
              {errorMessage}
            </div>
          )}

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
                    <div className="relative w-[250px] h-[300px] border-2 border-dashed border-gray-300 rounded-[10px] flex flex-col items-center justify-center bg-[#f5f5f5] cursor-pointer hover:border-[#9e1c60] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validasi ukuran file (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              setErrorMessage("Ukuran file terlalu besar. Maksimal 5MB.");
                              setTimeout(() => setErrorMessage(""), 5000);
                              return;
                            }

                            // Validasi tipe file
                            if (!file.type.startsWith('image/')) {
                              setErrorMessage("File harus berupa gambar.");
                              setTimeout(() => setErrorMessage(""), 5000);
                              return;
                            }
                            
                            // Clear error jika validasi berhasil
                            setErrorMessage("");

                            setProductImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProductImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {productImage ? (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          <Image
                            src={productImage}
                            alt={formData.nama || "Produk"}
                            width={220}
                            height={280}
                            className="max-w-full max-h-full object-contain rounded-[10px]"
                            unoptimized
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
                          <p className="text-black text-center" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}>
                            Klik untuk Ubah Foto
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Form Fields (Nama, Harga, Stok) */}
                  <div className="flex-1 flex flex-col gap-6">
                    {/* Nama */}
                    <div className="flex flex-col gap-[11px]">
                      <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                        Nama
                      </label>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Nama produk"
                        className={`bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] ${formData.nama ? 'text-black' : 'text-black/50'}`}
                        style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                        required
                      />
                    </div>

                    {/* Harga */}
                    <div className="flex flex-col gap-[11px]">
                      <label className="font-bold text-black" style={{ fontSize: '14px' }}>
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
                        style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                        required
                      />
                    </div>

                    {/* Stok */}
                    <div className="flex flex-col gap-[11px]">
                      <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                        Stok (Max: {formData.stokMax.toLocaleString('id-ID')})
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
                        <input
                          type="number"
                          min="0"
                          max={formData.stokMax}
                          value={formData.stok}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value >= 0 && value <= formData.stokMax) {
                              setFormData({ ...formData, stok: value });
                            } else if (value > formData.stokMax) {
                              setFormData({ ...formData, stok: formData.stokMax });
                            } else if (e.target.value === '' || value < 0) {
                              // Allow empty input for better UX
                              const numValue = parseInt(e.target.value);
                              if (isNaN(numValue) || numValue < 0) {
                                setFormData({ ...formData, stok: 0 });
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Ensure value is valid on blur
                            const value = parseInt(e.target.value) || 0;
                            if (value < 0) {
                              setFormData({ ...formData, stok: 0 });
                            } else if (value > formData.stokMax) {
                              setFormData({ ...formData, stok: formData.stokMax });
                            }
                          }}
                          className="flex-1 bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black text-center"
                          style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                          required
                        />
                        <span className="text-black/50" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}>
                          / {formData.stokMax.toLocaleString('id-ID')}
                        </span>
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
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-[#e09028] h-[35px] rounded-[5px] text-white font-bold hover:bg-[#c77a1f] transition-colors flex items-center justify-center text-center"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
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

