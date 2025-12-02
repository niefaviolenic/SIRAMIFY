"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import React from "react";

const imgImage9 = "/profile.png";
const imgMaterialSymbolsEditOutline = "https://www.figma.com/api/mcp/asset/28d01788-21aa-43f5-8042-94832c343afb";

interface ProfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilModal({ isOpen, onClose }: ProfilModalProps) {
  const [formData, setFormData] = useState({
    namaLengkap: "Budi Budiman",
    email: "budiman123@gmail.com",
    password: "********",
    passwordBaru: "",
    konfirmasiPasswordBaru: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(imgImage9);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }
      
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Update profile in Supabase
      // const { error } = await supabase
      //   .from("users")
      //   .update({
      //     nama: formData.namaLengkap,
      //     email: formData.email,
      //     password: formData.passwordBaru
      //   })
      //   .eq("id", userId);
      // if (error) throw error;

      alert("Profil berhasil diperbarui!");
      onClose();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 py-8"
      onClick={onClose}
      style={{
        animation: 'fadeIn 0.2s ease-in-out',
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
      }}
    >
      <div
        className="bg-white rounded-[15px] border-2 border-[#9e1c60] p-6 max-w-[850px] w-full mx-4 relative my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out',
          fontFamily: 'Arial, Helvetica, sans-serif',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}
      >
        {/* Title */}
        <h2 className="font-bold text-black mb-6" style={{ fontSize: '22px' }}>
          Profil Akun
        </h2>

        <div className="flex gap-6 items-start">
          {/* Left Side - Profile Picture & Buttons */}
          <div className="flex-shrink-0 flex flex-col items-center w-[140px]">
            <div className="relative mb-5">
              <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#9e1c60] shadow-md">
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="object-cover object-center"
                  style={{ aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'center' }}
                  unoptimized
                />
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {/* Edit Icon - Outside the circle */}
              <div 
                onClick={handleImageClick}
                className="absolute bottom-0 right-0 w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#f0f0f0] transition-colors border-2 border-gray-300 shadow-lg z-10"
                style={{ transform: 'translate(8px, 8px)' }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                    fill="#000000"
                    stroke="#000000"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-[#27a73d] h-[35px] rounded-[5px] text-white font-bold hover:bg-[#1f8a31] active:bg-[#1a7a2a] transition-all duration-200 disabled:opacity-50 flex items-center justify-center text-center shadow-md w-full"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#e09028] h-[35px] rounded-[5px] text-white font-bold hover:bg-[#c77a1f] active:bg-[#b56a1a] transition-all duration-200 flex items-center justify-center text-center shadow-md w-full"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
              >
                Kembali
              </button>
            </div>
          </div>

          {/* Right Side - Form Fields */}
          <div className="flex-1 flex flex-col gap-3.5">
            {/* Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                className="bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black transition-all"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black transition-all"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  readOnly
                  className="bg-[#f5f5f5] h-[35px] px-3 py-2 pr-10 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black w-full transition-all"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword ? (
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#9f9f9f"
                      />
                    ) : (
                      <path
                        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                        fill="#9f9f9f"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswordBaru ? "text" : "password"}
                  value={formData.passwordBaru}
                  onChange={(e) => setFormData({ ...formData, passwordBaru: e.target.value })}
                  placeholder="Masukkan Password Baru Anda"
                  className={`bg-[#f5f5f5] h-[35px] px-3 py-2 pr-10 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] w-full transition-all ${formData.passwordBaru ? 'text-black' : 'text-black/50'}`}
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPasswordBaru ? (
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#9f9f9f"
                      />
                    ) : (
                      <path
                        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                        fill="#9f9f9f"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-black" style={{ fontSize: '14px' }}>
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showKonfirmasiPassword ? "text" : "password"}
                  value={formData.konfirmasiPasswordBaru}
                  onChange={(e) => setFormData({ ...formData, konfirmasiPasswordBaru: e.target.value })}
                  placeholder="Konfirmasi Password Baru"
                  className={`bg-[#f5f5f5] h-[35px] px-3 py-2 pr-10 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] w-full transition-all ${formData.konfirmasiPasswordBaru ? 'text-black' : 'text-black/50'}`}
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasiPassword(!showKonfirmasiPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showKonfirmasiPassword ? (
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#9f9f9f"
                      />
                    ) : (
                      <path
                        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                        fill="#9f9f9f"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

