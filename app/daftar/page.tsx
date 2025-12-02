"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Navbar from "../components/Navbar";

const imgLogo1 = "https://www.figma.com/api/mcp/asset/853067a6-fee0-437e-84d5-18b281102ec0";
const imgSimpleLineIconsEye = "https://www.figma.com/api/mcp/asset/41c50270-7e46-4013-8c2d-002f283e7fc9";
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
      setSuccessMessage("Pendaftaran berhasil! Mengarahkan ke halaman masuk...");
      
      // Auto redirect ke halaman masuk setelah 1.5 detik (tanpa perlu klik OK)
      setTimeout(() => {
        router.push("/masuk");
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
          <div className="hidden md:flex items-center justify-center w-full md:w-auto md:flex-1 max-w-[500px]">
            <div className="relative w-[300px] md:w-[403px] h-[80px] md:h-[104px]">
              <Image
                src={imgLogo1}
                alt="Siramify Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Register Form Card */}
          <div className="w-full md:w-[340px] bg-[#eed2e1] border-2 border-[#9e1c60] rounded-[8px] p-4 shadow-lg">
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center cursor-pointer hover:opacity-70 transition"
                  >
                    <Image
                      src={imgSimpleLineIconsEye}
                      alt={showPassword ? "Hide password" : "Show password"}
                      width={14}
                      height={14}
                      className="object-contain"
                      unoptimized
                    />
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center cursor-pointer hover:opacity-70 transition"
                  >
                    <Image
                      src={imgSimpleLineIconsEye}
                      alt={showConfirmPassword ? "Hide password" : "Show password"}
                      width={14}
                      height={14}
                      className="object-contain"
                      unoptimized
                    />
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
                    className={`bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 pr-10 py-2 w-full font-normal text-xs text-black/50 focus:outline-none flex items-center justify-between relative ${
                      isAccountTypeOpen 
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
                            className={`w-full h-[38px] md:h-[40px] px-3 py-2 text-left font-normal text-xs hover:bg-[#eed2e1] transition ${
                              selectedAccountType === type
                                ? "bg-[#eed2e1] text-[#561530] font-semibold"
                                : "text-black/50"
                            } ${
                              index === accountTypes.length - 1 ? '' : 'border-b border-[#9e1c60]/30'
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
                className="bg-[#9e1c60] hover:bg-[#811844] transition text-white font-bold text-xs py-2 md:py-2.5 px-4 md:px-5 rounded-[10px] mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <footer className="bg-[#561530] w-full py-6 md:py-8 mt-auto">
        <div className="flex flex-col gap-3 md:gap-4 items-center px-6 md:px-8 lg:px-10 w-full max-w-[900px] mx-auto">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <div className="h-[30px] relative w-[117px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Image
                  src={imgLogo1} 
                  alt="Siramify Logo" 
                  width={117} 
                  height={30}
                  className="absolute h-[221.94%] left-[-1.71%] max-w-none top-[-64.52%] w-[101.76%]"
                  unoptimized
                />
              </div>
            </div>
            <div className="h-[26px] relative w-0 hidden md:block">
              <div className="absolute inset-[-1.92%_-0.5px]">
                <Image src={imgVector2} alt="" width={1} height={26} className="block max-w-none size-full" unoptimized />
              </div>
            </div>
            <div className="flex gap-[15px] items-center">
              <a href="https://www.linkedin.com/in/niefa-ev/" target="_blank" rel="noopener noreferrer" className="size-6 hover:opacity-70 transition flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" fill="white"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/niefaefrilia/" target="_blank" rel="noopener noreferrer" className="size-6 hover:opacity-70 transition flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="white"/>
                </svg>
              </a>
              <a href="https://wa.me/6281287840141" target="_blank" rel="noopener noreferrer" className="size-6 hover:opacity-70 transition flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="white"/>
                </svg>
              </a>
            </div>
          </div>
          <p className="font-normal text-[10px] md:text-xs text-center text-white w-full">
            Siramify adalah platform berbasis web yang dirancang untuk membantu petani mengelola penyiraman tanaman secara otomatis, efisien, dan berbasis data. Dengan memanfaatkan teknologi sensor suhu dan kelembapan yang terhubung ke sistem pemantauan real-time, Siramify memungkinkan pengguna mengetahui kondisi lingkungan tanaman secara akurat serta mengatur penyiraman sesuai kebutuhan.
          </p>
          <p className="font-normal text-[10px] md:text-xs text-center text-white w-full">© 2025 SIRAMIFY</p>
        </div>
      </footer>
    </div>
  );
}

