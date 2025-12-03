"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const imgLogo1 = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_logo.png";

const imgWeuiArrowFilled = "https://www.figma.com/api/mcp/asset/5c078d93-ce96-40aa-b0af-76b2273377d4";
const imgVector2 = "https://www.figma.com/api/mcp/asset/044ae3c8-2b69-4ea0-a2fc-094b22f6f72d";

export default function DaftarPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAccountTypeOpen, setIsAccountTypeOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("Pilih Jenis Akun");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const accountTypes = ["Petani", "Pembeli"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (selectedAccountType === "Pilih Jenis Akun") {
      setErrorMessage("Pilih jenis akun terlebih dahulu!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password dan Konfirmasi Password tidak sama!");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password minimal 6 karakter!");
      return;
    }

    setIsLoading(true);
    try {
      const role = selectedAccountType.toLowerCase();

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrorMessage("Format email tidak valid!");
        setIsLoading(false);
        return;
      }

      console.log("Starting registration for:", formData.email.trim(), "with role:", role);

      // Register user dengan Supabase (otomatis masuk ke auth.users)
      // Disable email confirmation untuk langsung bisa login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(), // Normalize email
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          },
          emailRedirectTo: undefined, // Tidak perlu redirect email
        },
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        console.error("Auth error details:", JSON.stringify(authError, null, 2));

        // Handle specific error messages
        let errorMsg = authError.message || "Gagal mendaftar. Silakan coba lagi.";

        if (authError.message?.includes("Database error")) {
          errorMsg = "Terjadi kesalahan pada database. Silakan coba lagi atau hubungi administrator.";
        } else if (authError.message?.includes("User already registered")) {
          errorMsg = "Email sudah terdaftar. Silakan gunakan email lain atau login.";
        } else if (authError.message?.includes("Password")) {
          errorMsg = "Password tidak valid. Pastikan password minimal 6 karakter.";
        }

        setErrorMessage(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrorMessage("User tidak berhasil dibuat. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      console.log("User created in auth.users:", authData.user.id);
      console.log("User email:", authData.user.email);
      console.log("User metadata:", authData.user.user_metadata);

      // Simpan data user ke tabel users (langsung setelah signup)
      // Tunggu sebentar untuk memastikan auth.users sudah tersimpan
      await new Promise(resolve => setTimeout(resolve, 800));

      const normalizedEmail = formData.email.trim().toLowerCase();
      const insertData = {
        id: authData.user.id,
        email: normalizedEmail,
        full_name: formData.fullName.trim(),
        role: role,
        status: "active",
      };

      console.log("Attempting to insert user data:", insertData);

      // Deklarasi variabel di scope yang benar
      let userCreated = false;
      let lastError: any = null;

      // Cek dulu apakah user sudah ada (mungkin dari trigger)
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, role, status")
        .eq("id", authData.user.id)
        .single();

      if (existingUser) {
        console.log("✅ User already exists in users table (probably from trigger):", existingUser);
        // User sudah ada, skip insert
        userCreated = true;
      } else {
        console.log("⚠️ User not found in users table, attempting to create...");

        // Coba insert dengan berbagai cara
        // Method 1: Direct insert
        const { data: userData, error: profileError } = await supabase
          .from("users")
          .insert(insertData)
          .select()
          .single();

        if (profileError) {
          console.error("Direct insert failed:", profileError);
          console.error("Error details:", JSON.stringify(profileError, null, 2));
          console.error("Error code:", profileError.code);
          console.error("Error message:", profileError.message);
          lastError = profileError;

          // Method 2: Upsert
          const { data: upsertData, error: upsertError } = await supabase
            .from("users")
            .upsert(insertData, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (upsertError) {
            console.error("Upsert also failed:", upsertError);
            console.error("Upsert error details:", JSON.stringify(upsertError, null, 2));
            console.error("Upsert error code:", upsertError.code);
            console.error("Upsert error message:", upsertError.message);
            lastError = upsertError;

            // Method 3: Try without select (sometimes select causes issues)
            const { error: simpleInsertError } = await supabase
              .from("users")
              .insert(insertData);

            if (simpleInsertError) {
              console.error("Simple insert also failed:", simpleInsertError);
              console.error("Simple insert error details:", JSON.stringify(simpleInsertError, null, 2));
              console.error("Simple insert error code:", simpleInsertError.code);
              console.error("Simple insert error message:", simpleInsertError.message);
              lastError = simpleInsertError;
            } else {
              console.log("✅ User created via simple insert (no select)");
              userCreated = true;

              // Verify dengan select terpisah
              const { data: verifyData } = await supabase
                .from("users")
                .select("*")
                .eq("id", authData.user.id)
                .single();
              console.log("Verified user data:", verifyData);
            }
          } else {
            console.log("✅ User profile created via upsert:", upsertData);
            userCreated = true;
          }
        } else {
          console.log("✅ User profile created successfully:", userData);
          userCreated = true;
        }
      }

      // Final verification
      if (userCreated) {
        const { data: finalCheck } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (finalCheck) {
          console.log("✅ User confirmed in users table:", finalCheck);
        } else {
          console.warn("⚠️ User created but verification failed");
        }
      } else {
        console.error("❌ Failed to create user in users table. Last error:", lastError);
        console.error("Last error details:", JSON.stringify(lastError, null, 2));
        // Tetap lanjutkan, akan dibuat saat login
        console.log("⚠️ Will create user profile during login instead");
      }

      // Tampilkan success message di halaman (tanpa alert)
      setSuccessMessage("Pendaftaran berhasil! Mengarahkan...");

      // Auto redirect ke halaman yang sesuai setelah 1.5 detik
      setTimeout(() => {
        if (authData.session) {
          // Jika sudah ada session (auto login), redirect sesuai role
          if (role === "petani") {
            router.push("/");
          } else {
            router.push("/");
          }
        } else {
          // Jika butuh verifikasi email atau tidak auto login
          router.push("/masuk");
        }
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      const errMsg = error?.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";
      setErrorMessage(errMsg);
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 md:px-20 pt-24 md:pt-32 pb-16 md:pb-20">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
          {/* Logo Section */}
          {/* Logo Section */}
          <div className="hidden md:flex flex-col items-center justify-center w-full md:w-auto md:flex-1 max-w-[600px] text-center gap-6">
            <div className="relative w-[300px] md:w-[400px] h-[300px] md:h-[400px]">
              <Image
                src="https://ik.imagekit.io/et2ltjxzhq/Siramify/character_siramify.webp"
                alt="Siramify Character"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-xl md:text-2xl text-[#561530]">
                Semua Lebih Mudah di Siramify
              </h1>
              <p className="text-xs md:text-sm text-[#561530]/80">
                Gabung dan rasakan kemudahan mengelola tanaman dengan siramify
              </p>
            </div>
          </div>

          {/* Register Form Card */}
          <div className="w-full md:w-[340px] bg-[#eed2e1]/80 backdrop-blur-sm border-2 border-[#9e1c60] rounded-[8px] p-4 shadow-lg">
            <h2 className="font-bold text-base md:text-lg text-[#561530] mb-3 md:mb-4">
              Daftar
            </h2>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded-[10px] text-xs">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-[10px] text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 md:gap-3">
              {/* Full Name Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Masukkan Nama Lengkap"
                  className="bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 py-2 rounded-[10px] w-full font-normal text-xs text-black/50 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Masukkan Email"
                  className="bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 py-2 rounded-[10px] w-full font-normal text-xs text-black/50 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Masukkan Password"
                    className="bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 pr-10 py-2 rounded-[10px] w-full font-normal text-xs text-black/50 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561530] hover:bg-gray-200 active:bg-gray-300 rounded-full p-1 transition cursor-pointer"
                  >
                    {showPassword ? (
                      // Icon Eye (Show Password)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      // Icon Eye Slash (Hide Password)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Masukkan Konfirmasi Password"
                    className="bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 pr-10 py-2 rounded-[10px] w-full font-normal text-xs text-black/50 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561530] hover:bg-gray-200 active:bg-gray-300 rounded-full p-1 transition cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      // Icon Eye (Show Password)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      // Icon Eye Slash (Hide Password)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Account Type Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Jenis Akun
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountTypeOpen(!isAccountTypeOpen)}
                    className={`bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 pr-10 py-2 w-full font-normal text-xs text-black/50 focus:outline-none flex items-center justify-between relative cursor-pointer ${isAccountTypeOpen
                      ? 'rounded-t-[10px] border-2 border-[#9e1c60] border-b-0'
                      : 'rounded-[10px]'
                      }`}
                  >
                    <span>{selectedAccountType}</span>
                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isAccountTypeOpen ? '-rotate-90' : 'rotate-90'}`}>
                      <Image
                        src={imgWeuiArrowFilled}
                        alt="Arrow"
                        width={10}
                        height={20}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </button>

                  {isAccountTypeOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[5]"
                        onClick={() => setIsAccountTypeOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 bg-[#f5f5f5] rounded-b-[10px] overflow-hidden z-10 shadow-lg border-2 border-[#9e1c60] border-t-0">
                        {accountTypes.map((type, index) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setSelectedAccountType(type);
                              setIsAccountTypeOpen(false);
                            }}
                            className={`w-full h-[38px] md:h-[40px] px-3 py-2 text-left font-normal text-xs hover:bg-[#eed2e1] transition cursor-pointer ${selectedAccountType === type
                              ? "bg-[#eed2e1] text-[#561530] font-semibold"
                              : "text-black/50"
                              } ${index === accountTypes.length - 1 ? '' : 'border-b border-[#9e1c60]/30'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#9e1c60] hover:bg-[#811844] transition text-white font-bold text-xs py-2 md:py-2.5 px-4 md:px-5 rounded-[10px] mt-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Mendaftar..." : "Daftar"}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center mt-3 md:mt-4 text-xs text-[#561530]">
              Sudah punya akun?{" "}
              <Link href="/masuk" className="font-bold hover:text-[#9e1c60] transition">
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
