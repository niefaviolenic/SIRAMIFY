"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const siramifyLogo = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_logo.png";


export default function MasukPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Validasi email
      if (!email || !email.includes('@')) {
        setErrorMessage("Masukkan email yang valid!");
        setIsLoading(false);
        return;
      }

      // Validasi password
      if (!password || password.length < 6) {
        setErrorMessage("Password minimal 6 karakter!");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Login error:", error);

        // Handle error dengan pesan yang lebih spesifik
        if (error.message.includes('Invalid login credentials') || error.message.includes('email')) {
          // Cek apakah email terdaftar (tidak bisa pakai admin API dari client, jadi pakai pesan umum)
          setErrorMessage("Email atau password salah. Pastikan email sudah terdaftar dan password benar.");
        } else if (error.message.includes('Email not confirmed')) {
          // Skip email verification requirement - langsung bisa login
          // setErrorMessage("Email belum diverifikasi. Silakan cek email Anda dan klik link verifikasi.");
          // Tetap lanjutkan login meskipun belum verifikasi
          console.log("Email not confirmed, but continuing login...");
        } else {
          setErrorMessage(error.message || "Email atau password salah. Silakan coba lagi.");
        }
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMessage("Gagal login. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      // Skip email verification - langsung bisa login
      // if (!data.user.email_confirmed_at) {
      //   setErrorMessage("Email belum diverifikasi. Silakan cek email Anda dan klik link verifikasi terlebih dahulu.");
      //   setIsLoading(false);
      //   return;
      // }

      // Tunggu sebentar untuk memastikan trigger sudah jalan (jika ada)
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("🔍 Checking user in users table, ID:", data.user.id);
      console.log("🔍 User email:", data.user.email);
      console.log("🔍 User metadata:", data.user.user_metadata);

      // Ambil role user dari database dengan retry
      let userData: { role: string; status: string } | null = null;
      let userError: any = null;

      // Coba query dengan retry (3x)
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: fetchedUserData, error: fetchError } = await supabase
          .from("users")
          .select("role, status, email, full_name")
          .eq("id", data.user.id)
          .single();

        if (fetchError) {
          console.log(`⚠️ Attempt ${attempt} failed:`, fetchError.message);
          userError = fetchError;

          // Jika error karena user tidak ada (PGRST116), coba buat user
          if (fetchError.code === 'PGRST116' || fetchError.message.includes('No rows')) {
            console.log("User not found in users table, will create...");
            break; // Keluar dari loop, akan create user di bawah
          }

          // Jika error lain (RLS, dll), tunggu sebentar dan coba lagi
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        } else if (fetchedUserData) {
          console.log("✅ User found in users table:", fetchedUserData);
          console.log("✅ User role:", fetchedUserData.role, "| status:", fetchedUserData.status);
          userData = fetchedUserData;
          break; // User ditemukan, keluar dari loop
        }
      }

      // Jika user tidak ditemukan, coba buat (hanya jika benar-benar tidak ada)
      if (!userData && (userError?.code === 'PGRST116' || userError?.message?.includes('No rows'))) {
        console.log("⚠️ User not found in users table, creating automatically...");
        const role = data.user.user_metadata?.role || "pembeli";
        const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || "User";

        const insertData = {
          id: data.user.id,
          email: data.user.email || "",
          full_name: fullName,
          role: role,
          status: "active"
        };

        console.log("Attempting to insert user data:", insertData);

        // Coba upsert (lebih aman daripada insert)
        const { error: upsertError } = await supabase
          .from("users")
          .upsert(insertData, {
            onConflict: 'id'
          });

        if (upsertError) {
          console.error("❌ Upsert failed:", upsertError);
          // Jangan block login, coba pakai metadata role sebagai fallback
          console.warn("⚠️ Using metadata role as fallback due to upsert failure");
          const fallbackRole = data.user.user_metadata?.role || "pembeli";
          redirectBasedOnRole(fallbackRole);
          return;
        } else {
          console.log("✅ User profile created via upsert");

          // Tunggu sebentar lalu verify
          await new Promise(resolve => setTimeout(resolve, 500));

          const { data: newUserData } = await supabase
            .from("users")
            .select("role, status")
            .eq("id", data.user.id)
            .single();

          if (newUserData) {
            console.log("✅ User verified in users table:", newUserData);
            userData = newUserData;
          } else {
            // Fallback ke metadata jika verify gagal
            console.warn("⚠️ Verification failed, using metadata role");
            const fallbackRole = data.user.user_metadata?.role || "pembeli";
            redirectBasedOnRole(fallbackRole);
            return;
          }
        }
      } else if (!userData) {
        // Jika error bukan karena user tidak ada, tapi karena RLS/error lain
        // Coba query langsung dengan service role atau cek di auth.users metadata
        console.warn("⚠️ Could not fetch user data (possibly RLS issue)");
        console.warn("⚠️ Error details:", userError);

        // Coba ambil role dari metadata atau email
        let fallbackRole = data.user.user_metadata?.role;

        // Jika email admin, pastikan role admin
        if (data.user.email?.toLowerCase().includes('admin') || data.user.email === 'admin@siramify.com') {
          console.log("🔧 Detected admin email, forcing admin role");
          fallbackRole = "admin";
        }

        // Jika masih tidak ada, default ke pembeli
        if (!fallbackRole) {
          console.warn("⚠️ No role in metadata, defaulting to pembeli");
          fallbackRole = "pembeli";
        }

        console.log("⚠️ Using fallback role:", fallbackRole);
        redirectBasedOnRole(fallbackRole);
        return;
      }

      // Jika userData ada, cek status dan redirect
      if (userData) {
        // Handle berbagai format status (active, aktif, dll)
        // Jika status null/kosong, anggap aktif
        const status = (userData.status || 'active').toLowerCase().trim();
        const isActive = status === 'active' || status === 'aktif' || !status;

        if (!isActive) {
          console.log("❌ User status:", userData.status, "-> considered inactive");
          setErrorMessage("Akun Anda tidak aktif. Silakan hubungi administrator.");
          setIsLoading(false);
          return;
        }

        console.log("✅ User status OK, redirecting to:", userData.role);
        redirectBasedOnRole(userData.role);
      } else {
        // Fallback terakhir ke metadata role
        console.warn("⚠️ No userData available, using metadata role as final fallback");
        const fallbackRole = data.user.user_metadata?.role || "pembeli";
        redirectBasedOnRole(fallbackRole);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Terjadi kesalahan saat login. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    // Normalize role to lowercase untuk case-insensitive check
    const normalizedRole = (role || "").toLowerCase().trim();
    console.log("Redirecting based on role:", role, "-> normalized:", normalizedRole);

    if (normalizedRole === "petani") {
      console.log("✅ Redirecting to /");
      router.push("/");
    } else if (normalizedRole === "admin") {
      console.log("✅ Redirecting to /");
      router.push("/");
    } else if (normalizedRole === "pembeli") {
      console.log("✅ Redirecting to /");
      router.push("/");
    } else {
      // Default untuk role lainnya
      console.log("⚠️ Unknown role, redirecting to landing page. Role was:", role);
      router.push("/");
    }
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

          {/* Login Form Card */}
          <div className="w-full md:w-[340px] bg-[#eed2e1]/80 backdrop-blur-sm border-2 border-[#9e1c60] rounded-[8px] p-4 shadow-lg">
            <h2 className="font-bold text-base md:text-lg text-[#561530] mb-3 md:mb-4">
              Masuk
            </h2>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-[10px] text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 md:gap-3">
              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {/* Lupa Password Link */}
                <div className="flex justify-end">
                  <Link href="/lupa-password" className="text-xs text-[#9e1c60] hover:underline">
                    Lupa Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#9e1c60] hover:bg-[#811844] transition text-white font-bold text-xs py-2 md:py-2.5 px-4 md:px-5 rounded-[10px] mt-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Masuk..." : "Masuk"}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center mt-3 md:mt-4 text-xs text-[#561530]">
              Belum punya akun?{" "}
              <Link href="/daftar" className="font-bold hover:text-[#9e1c60] transition">
                Daftar Sekarang
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

