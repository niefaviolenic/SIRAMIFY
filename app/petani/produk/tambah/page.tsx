"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import { supabase } from "@/utils/supabaseClient";
import Toast from "@/app/components/Toast";

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
  const [productImageFile, setProductImageFile] = useState<File | null>(null);


  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "Ukuran file terlalu besar. Maksimal 5MB.", type: "error" });
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        setToast({ message: "File harus berupa gambar.", type: "error" });
        return;
      }

      // Clear error jika validasi berhasil

      setProductImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file: File, userId: string): Promise<string | null> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `produk/${fileName}`;

      console.log("Uploading to path:", filePath);

      // Upload file ke Supabase Storage
      const { data, error } = await supabase.storage
        .from('produk')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Storage upload error:", error);
        const err = error as any;
        console.error("Error details:", {
          message: err.message,
          statusCode: err.statusCode,
          error: err.error
        });

        // Jika bucket tidak ada atau error 404, throw error yang lebih jelas
        if (err.message?.includes('Bucket') || err.statusCode === '404') {
          throw new Error("Bucket 'produk' belum dibuat di Supabase Storage. Silakan buat bucket terlebih dahulu.");
        }

        throw error;
      }

      console.log("File uploaded successfully:", data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('produk')
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);
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
      // Validasi form
      if (!formData.nama.trim()) {
        setToast({ message: "Nama produk harus diisi!", type: "error" });
        setIsSaving(false);
        return;
      }

      if (!formData.harga || parseInt(formData.harga.replace(/\D/g, '') || '0') <= 0) {
        setToast({ message: "Harga produk harus diisi dan lebih dari 0!", type: "error" });
        setIsSaving(false);
        return;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User error:", userError);
        setToast({ message: "Anda harus login terlebih dahulu!", type: "error" });
        setTimeout(() => {
          router.push("/masuk");
        }, 2000);
        setIsSaving(false);
        return;
      }


      console.log("Adding product for user:", user.id);
      console.log("Form data:", formData);

      // Upload foto ke Supabase Storage
      let fotoUrl: string | null = null;

      if (productImageFile) {
        try {
          console.log("Uploading image to storage...");
          fotoUrl = await uploadImageToStorage(productImageFile, user.id);
          console.log("Image uploaded successfully:", fotoUrl);
        } catch (error: any) {
          console.error("Error uploading image:", error);
          const errorMessage = error?.message || "Gagal mengupload foto";
          console.error("Upload error details:", {
            message: errorMessage,
            error: error
          });

          // Jika upload foto gagal, tetap lanjutkan tanpa foto
          setToast({ message: `Gagal mengupload foto: ${errorMessage}. Produk akan disimpan tanpa foto.`, type: "error" });
        }
      } else if (productImage && !productImage.startsWith('http')) {
        // Jika masih base64 (fallback), simpan sebagai base64
        fotoUrl = productImage;
      }

      // Prepare data untuk insert
      const hargaValue = parseInt(formData.harga.replace(/\D/g, '') || '0');
      const insertData = {
        petani_id: user.id,
        nama: formData.nama.trim(),
        harga: hargaValue,
        stok: formData.stok,
        stok_max: formData.stokMax,
        deskripsi: formData.deskripsi.trim() || null,
        foto: fotoUrl
      };

      console.log("Inserting product data:", insertData);

      // Insert ke database
      const { data: insertedData, error } = await supabase
        .from("produk")
        .insert(insertData)
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log("Product inserted successfully:", insertedData);



      setToast({ message: "Produk berhasil ditambahkan! Mengarahkan ke halaman produk...", type: "success" });
      setTimeout(() => {
        router.push("/petani/produk");
      }, 1500);
    } catch (error: any) {
      console.error("Error adding product:", error);

      // Tampilkan error message yang lebih detail
      let errorMsg = "Gagal menambahkan produk. Silakan coba lagi.";

      if (error?.message) {
        errorMsg = `Gagal menambahkan produk: ${error.message}`;
      } else if (error?.details) {
        errorMsg = `Gagal menambahkan produk: ${error.details}`;
      } else if (typeof error === 'string') {
        errorMsg = `Gagal menambahkan produk: ${error}`;
      }

      console.error("Full error object:", JSON.stringify(error, null, 2));

      setToast({ message: errorMsg, type: "error" });
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
      <div className="flex-1 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-3xl text-black">Produk</h1>
                <p className="text-sm text-black mt-1">Produk/Tambah Produk</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {/* Removed inline messages as we use Toast now */}

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
                        <p className="text-black text-center" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}>
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
                    <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                      Nama
                    </label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Masukkan Nama Produk"
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
                      placeholder="Masukkan Harga Produk"
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
                        disabled={formData.stok <= 1}
                        className="w-[35px] h-[35px] bg-[#9e1c60] text-white rounded-[5px] flex items-center justify-center hover:bg-[#7d1650] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '16px', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={formData.stokMax}
                        value={formData.stok}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 1 && value <= formData.stokMax) {
                            setFormData({ ...formData, stok: value });
                          } else if (value > formData.stokMax) {
                            setFormData({ ...formData, stok: formData.stokMax });
                          } else if (e.target.value === '' || value < 1) {
                            // Allow empty input for better UX
                            const numValue = parseInt(e.target.value);
                            if (isNaN(numValue) || numValue < 1) {
                              setFormData({ ...formData, stok: 1 });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // Ensure value is valid on blur
                          const value = parseInt(e.target.value) || 1;
                          if (value < 1) {
                            setFormData({ ...formData, stok: 1 });
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
        </div>
      </div>
    </div>
  );
}

